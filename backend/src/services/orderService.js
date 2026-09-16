import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../exceptions/ApiError.js";
import { restoreProductStock } from "./productService.js";
import { validateCoupon, calculateDiscountAmount, applyCouponAtomic } from "./couponService.js";
import { getIO } from "../config/socket.js";
import { createOrderVTP } from "./viettelPostService.js";
// check tỉnh
export const isSameProvince = (receiverAddress) => {
    if (!receiverAddress) return false;
    // Nhận vào object địa chỉ hoặc chuỗi text
    const provinceStr = typeof receiverAddress === "object" ? receiverAddress.province || "" : String(receiverAddress);

    const clean = provinceStr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đð]/gi, "d")
        .replace(/^(tinh|thanh pho|tp\.?|tp)\s+/i, "")
        .trim();

    return clean.includes("binh dinh");
};


// tính cước vận chuyển đơn giản
export const calculateFee = async ({ receiverAddress, productPrice = 0 }) => {
    const isSame = isSameProvince(receiverAddress);
    const price = Number(productPrice) || 0;

    let fee = isSame ? 20000 : 30000;
    const freeThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD) || 300000;
    if (price >= freeThreshold) {
        fee = 0;
    }
    return [
        {
            fee,
            isSameProvince: isSame
        }
    ];
};

export const createOrderFromCart = async (userId, payload) => {
    const {
        shippingAddress,
        paymentMethod = "COD",
        couponCode,
        note
    } = payload;
    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items || cart.items.length === 0) {
        throw new ApiError(404, "Giỏ hàng của bạn đang trống");
    }
    const selectedItems = cart.items.filter((item) => item.isSelected);
    if (!selectedItems || selectedItems.length === 0) {
        throw new ApiError(400, "Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng");
    }
    const session = await mongoose.startSession(); // tạo 
    session.startTransaction(); // bắt đầu

    try {
        const orderItems = [];
        // Kiểm tra tồn kho, trừ kho và lấy đầy đủ variantId, sizeId
        for (const item of selectedItems) {
            const product = await Product.findById(item.product).session(session);
            if (!product || product.isActive === false || product.deletedAt) {
                throw new ApiError(404, `Sản phẩm '${item.name}' không còn tồn tại hoặc đã ngừng hoạt động`);
            }
            let resolvedVariantId = null;
            let resolvedSizeId = null;
            let resolvedColor = item.color;
            let resolvedSize = item.size;
            let resolvedSku = item.sku;
            let resolvedThumbnail = item.thumbnail || product.thumbnail;

            if (product.variants && product.variants.length > 0) {
                // Tìm biến thể màu sắc theo variantId hoặc tên color
                let colorVar = null;
                if (item.variantId) {
                    colorVar = product.variants.find((v) => v._id && v._id.toString() === item.variantId.toString());
                }
                if (!colorVar && item.color) {
                    colorVar = product.variants.find((v) => v.color && v.color.trim().toLowerCase() === item.color.trim().toLowerCase());
                }
                if (!colorVar) {
                    throw new ApiError(400, `Phân loại màu '${item.color}' không tồn tại cho sản phẩm '${product.name}'`);
                }

                // Tìm phân loại size theo sizeId hoặc tên size
                let sizeOpt = null;
                if (item.sizeId && colorVar.sizes) {
                    sizeOpt = colorVar.sizes.find((s) => s._id && s._id.toString() === item.sizeId.toString());
                }
                if (!sizeOpt && item.size && colorVar.sizes) {
                    sizeOpt = colorVar.sizes.find((s) => s.size && s.size.trim().toLowerCase() === item.size.trim().toLowerCase());
                }
                if (!sizeOpt) {
                    throw new ApiError(400, `Kích cỡ '${item.size}' không tồn tại cho phân loại '${colorVar.color}'`);
                }
                // Kiểm tra số lượng tồn kho của size
                if (sizeOpt.stock < item.quantity) {
                    throw new ApiError(400, `Sản phẩm '${product.name}' (${colorVar.color}/${sizeOpt.size}) không đủ tồn kho (còn ${sizeOpt.stock})`);
                }

                // Trừ kho size
                sizeOpt.stock -= item.quantity;
                resolvedVariantId = colorVar._id;
                resolvedSizeId = sizeOpt._id;
                resolvedColor = colorVar.color;
                resolvedSize = sizeOpt.size;
                resolvedSku = colorVar.sku || `${product.sku}-${sizeOpt.size.toUpperCase()}`;
                resolvedThumbnail = colorVar.image || product.thumbnail || item.thumbnail;
            } else {
                // Sản phẩm không phân loại biến thể
                if (product.stock < item.quantity) {
                    throw new ApiError(400, `Sản phẩm '${product.name}' không đủ tồn kho (còn ${product.stock})`);
                }
                product.stock -= item.quantity;
                resolvedSku = product.sku;
            }

            // Tăng lượt bán và lưu lại trong transaction
            product.sold = (product.sold || 0) + item.quantity;
            await product.save({ session });

            // Map item snapshot cho đơn hàng với ĐẦY ĐỦ variantId và sizeId
            orderItems.push({
                product: item.product,
                variantId: resolvedVariantId,
                sizeId: resolvedSizeId,
                name: item.name || product.name,
                color: resolvedColor,
                size: resolvedSize,
                sku: resolvedSku,
                quantity: item.quantity,
                price: item.price,
                thumbnail: resolvedThumbnail
            });
        }
        const itemsSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // Tính phí ship theo chính sách của Shop (20k nội tỉnh, 30k ngoại tỉnh, đơn >= 300k Free ship)
        const shippingFeeResults = await calculateFee({
            receiverAddress: shippingAddress,
            productPrice: itemsSubtotal
        });

        const selectedOption = shippingFeeResults?.[0];
        const finalShippingFee = typeof selectedOption?.fee === "number" ? selectedOption.fee : 30000;

        // Áp dụng mã giảm giá Coupon nếu có
        let coupon = null;
        let discountAmount = 0;
        if (couponCode && couponCode.trim()) {
            coupon = await validateCoupon(couponCode.trim(), itemsSubtotal);
            discountAmount = calculateDiscountAmount(coupon, itemsSubtotal);
            await applyCouponAtomic(coupon._id, session);
        }

        const finalAmount = Math.max(0, itemsSubtotal + finalShippingFee - discountAmount);

        // 4. Tạo Document Order
        const [newOrder] = await Order.create(
            [
                {
                    user: userId,
                    items: orderItems,
                    shippingAddress: {
                        receiverName: shippingAddress.receiverName,
                        receiverPhone: shippingAddress.receiverPhone,
                        province: shippingAddress.province,
                        district: shippingAddress.district,
                        ward: shippingAddress.ward,
                        detailAddress: shippingAddress.detailAddress,
                        note: shippingAddress.note || null
                    },
                    shippingInfo: {
                        carrier: "VIETTELPOST",
                        shippingFee: finalShippingFee,
                        codAmount: paymentMethod === "COD" ? finalAmount : 0
                    },
                    paymentInfo: {
                        method: paymentMethod,
                        status: "PENDING"
                    },
                    paymentDueAt:
                        paymentMethod === "COD"
                            ? null
                            : new Date(Date.now() + 15 * 60 * 1000), // 15 phút thanh toán online
                    financials: {
                        itemsSubtotal,
                        shippingFee: finalShippingFee,
                        discountAmount,
                        finalAmount
                    },
                    coupon: coupon
                        ? {
                            couponId: coupon._id,
                            code: coupon.code,
                            discountAmount
                        }
                        : undefined,
                    orderStatus: "PENDING",
                    note: note || "",
                    timeline: [
                        {
                            type: "ORDER",
                            status: "PENDING",
                            updatedBy: userId,
                            note: "Đơn hàng được tạo thành công"
                        }
                    ]
                }
            ],
            { session }
        );

        // 5. Xóa các món đã mua khỏi giỏ hàng
        cart.items = cart.items.filter((item) => !item.isSelected);
        await cart.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Bắn tín hiệu socket realtime sau khi giao dịch đã được commit vào DB
        try {
            getIO().emit("new_order", {
                orderCode: newOrder.orderCode,
                totalAmount: newOrder.financials?.finalAmount
            });
            console.log("📢 [Socket] Đã phát sự kiện new_order cho mã đơn:", newOrder.orderCode);
        } catch (socketError) {
            console.error("Lỗi phát socket new_order:", socketError.message);
        }

        return newOrder;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

/**
 * Tính trước phí ship cho giỏ hàng hiện tại với địa chỉ nhận hàng cụ thể
 */
export const calculateShippingFee = async (userId, payload) => {
    const { shippingAddress, productPrice } = payload;
    if (!shippingAddress) {
        throw new ApiError(400, "Địa chỉ nhận hàng là bắt buộc");
    }

    let itemsSubtotal = typeof productPrice === "number" ? Number(productPrice) : null;

    if (itemsSubtotal === null) {
        const cart = await Cart.findOne({ user: userId });
        const selectedItems = cart?.items?.filter((item) => item.isSelected) || [];
        itemsSubtotal = 0;
        for (const item of selectedItems) {
            itemsSubtotal += item.price * item.quantity;
        }
    }

    const fees = await calculateFee({
        receiverAddress: shippingAddress,
        productPrice: itemsSubtotal
    });

    return fees;
};

/**
 * Lấy danh sách đơn hàng của user hiện tại (phân trang, filter theo trạng thái)
 */
export const getMyOrders = async (userId, { page = 1, limit = 10, status } = {}) => {
    const filter = { user: userId };
    if (status) filter.orderStatus = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter)
    ]);

    return { orders, total, page: Number(page), limit: Number(limit) };
};

/**
 * Lấy chi tiết 1 đơn hàng (hỗ trợ cả _id lẫn orderCode, Admin/Staff xem được mọi đơn, khách hàng chỉ xem đơn của mình)
 */
export const getOrderDetail = async (userId, identifier, userRole = "") => {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const filter = isObjectId
        ? { _id: identifier }
        : { orderCode: String(identifier).toUpperCase() };

    const roleName = typeof userRole === "object" ? userRole?.name : userRole;
    const isAdminOrStaff = ["admin", "staff"].includes(String(roleName).toLowerCase());
    if (!isAdminOrStaff) {
        filter.user = userId;
    }

    const order = await Order.findOne(filter);
    if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");
    return order;
};

/**
 * Hủy đơn hàng - chỉ cho phép khi đơn còn PENDING hoặc PROCESSING (chưa bàn giao vận chuyển).
 * Phải hoàn lại tồn kho đã trừ lúc tạo đơn.
 */
export const cancelOrder = async (userId, orderCode, reason) => {
    const order = await Order.findOne({ orderCode: orderCode.toUpperCase(), user: userId });
    if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");

    if (!["PENDING", "PROCESSING"].includes(order.orderStatus)) {
        throw new ApiError(400, "Đơn hàng này không thể hủy ở trạng thái hiện tại");
    }

    for (const item of order.items) {
        await restoreProductStock(item.product, {
            variantId: item.variantId,
            sizeId: item.sizeId,
            color: item.color,
            size: item.size,
            quantity: item.quantity
        });
    }

    order.orderStatus = "CANCELLED";
    order.cancelReason = reason || "Khách hàng tự hủy đơn";
    order.timeline.push({
        type: "ORDER",
        status: "CANCELLED",
        updatedBy: userId,
        note: order.cancelReason
    });

    await order.save();
    return order;
};

/**
 * [ADMIN] Lấy tất cả đơn hàng hệ thống với bộ lọc đa dạng (trạng thái, vận chuyển, thanh toán, ngày tháng, khoảng giá, sắp xếp)
 */
export const getAllOrdersAdmin = async ({
    page = 1,
    limit = 20,
    status,
    shippingStatus,
    paymentStatus,
    paymentMethod,
    carrier,
    province,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    search,
    sortBy = "createdAt_desc"
} = {}) => {
    const filter = {};

    // 1. Trạng thái đơn hàng tổng
    if (status && status !== "ALL") {
        filter.orderStatus = status;
    }

    // 2. Trạng thái giao vận
    if (shippingStatus && shippingStatus !== "ALL") {
        filter["shippingInfo.status"] = shippingStatus;
    }

    // 3. Trạng thái thanh toán
    if (paymentStatus && paymentStatus !== "ALL") {
        filter["paymentInfo.status"] = paymentStatus;
    }

    // 4. Phương thức thanh toán
    if (paymentMethod && paymentMethod !== "ALL") {
        filter["paymentInfo.method"] = paymentMethod;
    }

    // 5. Đơn vị vận chuyển
    if (carrier && carrier !== "ALL") {
        filter["shippingInfo.carrier"] = carrier;
    }

    // 6. Khu vực / Tỉnh thành
    if (province && province.trim()) {
        filter["shippingAddress.province"] = new RegExp(province.trim(), "i");
    }

    // 7. Khoảng giá trị đơn hàng
    if (minAmount !== undefined || maxAmount !== undefined) {
        filter["financials.finalAmount"] = {};
        if (minAmount !== undefined && !isNaN(Number(minAmount))) {
            filter["financials.finalAmount"].$gte = Number(minAmount);
        }
        if (maxAmount !== undefined && !isNaN(Number(maxAmount))) {
            filter["financials.finalAmount"].$lte = Number(maxAmount);
        }
    }

    // 8. Khoảng thời gian đặt hàng
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = end;
        }
    }

    // 9. Tìm kiếm tổng hợp (Mã đơn, Tên người nhận, SĐT, Mã vận đơn, Tên sản phẩm)
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
            { orderCode: regex },
            { "shippingAddress.receiverName": regex },
            { "shippingAddress.receiverPhone": regex },
            { "shippingInfo.trackingCode": regex },
            { "items.name": regex },
            { "items.sku": regex }
        ];
    }

    // 10. Sắp xếp
    let sortOption = { createdAt: -1 };
    if (sortBy === "createdAt_asc") sortOption = { createdAt: 1 };
    else if (sortBy === "amount_desc") sortOption = { "financials.finalAmount": -1 };
    else if (sortBy === "amount_asc") sortOption = { "financials.finalAmount": 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total, statsAgg] = await Promise.all([
        Order.find(filter).sort(sortOption).skip(skip).limit(Number(limit)),
        Order.countDocuments(filter),
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalPending: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "PENDING"] }, 1, 0] }
                    },
                    totalProcessing: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "PROCESSING"] }, 1, 0] }
                    },
                    totalShipping: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "SHIPPING"] }, 1, 0] }
                    },
                    totalDelivered: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "DELIVERED"] }, 1, 0] }
                    },
                    totalCancelled: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $ne: ["$orderStatus", "CANCELLED"] },
                                "$financials.finalAmount",
                                0
                            ]
                        }
                    }
                }
            }
        ])
    ]);

    const stats = statsAgg[0] || {
        totalOrders: 0,
        totalPending: 0,
        totalProcessing: 0,
        totalShipping: 0,
        totalDelivered: 0,
        totalCancelled: 0,
        totalRevenue: 0
    };

    return { orders, total, page: Number(page), limit: Number(limit), stats };
};

/**
 * [ADMIN] Cập nhật trạng thái đơn hàng (Duyệt đơn, Đóng gói, Bàn giao bưu tá, Giao thành công, Hủy)
 */
export const updateOrderStatusAdmin = async (orderId, status, userId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Không tìm thấy đơn hàng");
    if (status) {
        order.orderStatus = status;
        order.timeline.push({
            type: "ORDER",
            status: status,
            updatedBy: userId || null,
            note: `Admin cập nhật trạng thái đơn: ${status}`
        });
        if (status === "PROCESSING") {
            // tạo đơn hàng viettel post
            const fullAddress = [
                order.shippingAddress.detailAddress,
                order.shippingAddress.ward,
                order.shippingAddress.district,
                order.shippingAddress.province
            ].filter(Boolean).join(", ");
            const totalWeight = order.items.reduce(
                (sum, item) => sum + (item.weight || 200) * item.quantity,
                0
            );
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const vtpRes = await createOrderVTP({
                ORDER_NUMBER: order.orderCode,
                SENDER_FULLNAME: process.env.SENDER_NAME || "The Luki Shop",
                SENDER_PHONE: process.env.SENDER_PHONE,
                SENDER_ADDRESS: process.env.SENDER_ADDRESS,
                PICKUP_DATE: "",
                PICKUP_CODE: "",
                RECEIVER_FULLNAME: order.shippingAddress.receiverName,
                RECEIVER_ADDRESS: fullAddress,
                RECEIVER_PHONE: order.shippingAddress.receiverPhone,
                DELIVERY_CODE: "",
                PRODUCT_NAME: order.items.map(item => item.name).join(", "),
                PRODUCT_QUANTITY: totalQuantity,
                PRODUCT_PRICE: order.financials.finalAmount,
                PRODUCT_WEIGHT: totalWeight, // gram
                PRODUCT_LENGTH: 0,
                PRODUCT_WIDTH: 0,
                PRODUCT_HEIGHT: 0,
                ORDER_PAYMENT: 1, // Shop trả phí ship cho ViettelPost
                ORDER_SERVICE: "VTK", // Tiết kiệm
                PRODUCT_TYPE: "HH",
                ORDER_SERVICE_ADD: null,
                ORDER_NOTE: order.note || "Cho khách xem hàng khi nhận",
                MONEY_COLLECTION: order.paymentInfo.method === "COD" ? order.financials.finalAmount : 0,
                EXTRA_MONEY: 0,
                CHECK_UNIQUE: true,
                PRODUCT_DETAIL: order.items.map(item => ({
                    PRODUCT_NAME: item.name,
                    PRODUCT_QUANTITY: item.quantity,
                    PRODUCT_PRICE: item.price,
                    PRODUCT_WEIGHT: (item.weight || 200) * item.quantity
                })),
                ENABLE_SORT_CODE: false
            });
            // Lưu mã vận đơn ViettelPost cấp vào đơn hàng
            order.shippingInfo.trackingCode = vtpRes.ORDER_NUMBER;
            order.shippingInfo.status = "CONFIRMED";
            order.timeline.push({
                type: "SHIPPING",
                status: "CONFIRMED",
                updatedBy: userId || null,
                note: `Tạo vận đơn ViettelPost thành công, Mã vận đơn: ${vtpRes.ORDER_NUMBER}`
            });
        }
        // Nếu chuyển sang CANCELLED thì hoàn tồn kho
        if (status === "CANCELLED") {
            order.cancelReason = "Admin hủy đơn hàng";
            for (const item of order.items) {
                await restoreProductStock(item.product, {
                    variantId: item.variantId,
                    sizeId: item.sizeId,
                    color: item.color,
                    size: item.size,
                    quantity: item.quantity
                });
            }
        }
    }

    await order.save();
    return order;
};

/**
 * [WEBHOOK] Xử lý webhook cập nhật trạng thái đơn vận chuyển từ ViettelPost
 */
export const handleViettelPostWebhook = async (payload) => {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    // ViettelPost bọc toàn bộ dữ liệu bên trong object "DATA"
    const data = payload.DATA || payload.data || payload;

    const trackingCode = data.ORDER_NUMBER || data.order_number || data.orderNumber;
    const orderReference = data.ORDER_REFERENCE || data.order_reference || data.orderReference;
    const statusCode = Number(data.ORDER_STATUS ?? data.order_status ?? data.orderStatus);
    const statusName = data.STATUS_NAME || data.status_name || "";
    const note = data.NOTE || data.note || "";
    const locName = data.LOC_NAME || data.LOCATION_CURRENTLY || data.loc_name || "";

    if (!trackingCode && !orderReference) {
        console.warn("[ViettelPost Webhook] Thiếu ORDER_NUMBER và ORDER_REFERENCE trong payload:", payload);
        return null;
    }

    // Tìm đơn hàng theo mã vận đơn ViettelPost hoặc mã đơn của shop
    const filter = {
        $or: [
            ...(trackingCode ? [{ "shippingInfo.trackingCode": String(trackingCode).trim() }] : []),
            ...(orderReference ? [{ orderCode: String(orderReference).trim().toUpperCase() }] : []),
            ...(trackingCode ? [{ orderCode: String(trackingCode).trim().toUpperCase() }] : [])
        ]
    };

    const order = await Order.findOne(filter);
    if (!order) {
        console.warn(`[ViettelPost Webhook] Không tìm thấy đơn hàng với mã: ${trackingCode || orderReference}`);
        return null;
    }

    let newShippingStatus = order.shippingInfo.status;
    let newOrderStatus = order.orderStatus;
    let eventNote = note || statusName || `ViettelPost cập nhật mã: ${statusCode}`;
    if (locName) {
        eventNote += ` (Tại: ${locName})`;
    }

    // Ánh xạ mã số ViettelPost sang trạng thái của hệ thống
    switch (statusCode) {
        case 100: // Tiếp nhận đơn hàng
            newShippingStatus = "CONFIRMED";
            break;

        case 102: // Đang lấy hàng
        case 103: // Giao bưu tá đi lấy
        case 104: // Lấy hàng thành công
            newShippingStatus = "PICKING";
            if (order.orderStatus === "PENDING") {
                newOrderStatus = "PROCESSING";
            }
            break;

        case 200: // Nhận tại bưu cục gốc
        case 300: // Đang luân chuyển
        case 301:
        case 302:
        case 303:
        case 400: // Đang phát hàng
        case 401:
        case 402:
        case 403:
            newShippingStatus = "SHIPPING";
            newOrderStatus = "SHIPPING";
            break;

        case 501: // GIAO HÀNG THÀNH CÔNG 🎉
            newShippingStatus = "DELIVERED";
            newOrderStatus = "DELIVERED";

            // Nếu là đơn COD: tự động xác nhận đã thu tiền
            if (order.paymentInfo.method === "COD") {
                order.paymentInfo.status = "PAID";
                order.paymentInfo.paidAt = new Date();
                order.timeline.push({
                    type: "PAYMENT",
                    status: "PAID",
                    note: `Thu tiền COD thành công bởi shipper ViettelPost (${order.financials.finalAmount.toLocaleString("vi-VN")} đ)`
                });
            }
            break;

        case 502:
        case 503:
        case 504: // Chờ phát lại
        case 505: // Khách hẹn giao lại
            newShippingStatus = "FAILED";
            break;

        case 507: // Chuyển hoàn về shop (khách từ chối nhận / bom hàng)
        case 508:
        case 509:
            newShippingStatus = "RETURNED";
            newOrderStatus = "RETURNED";
            break;

        case -100: // Hủy đơn
        case 107:
            newShippingStatus = "CANCELLED";
            newOrderStatus = "CANCELLED";
            break;

        default:
            console.log(`[ViettelPost Webhook] Mã trạng thái chưa map cụ thể: ${statusCode}`);
            break;
    }

    // Cập nhật trạng thái
    order.shippingInfo.status = newShippingStatus;
    order.orderStatus = newOrderStatus;

    // Ghi nhật ký sự kiện vào timeline
    order.timeline.push({
        type: "SHIPPING",
        status: newShippingStatus,
        note: eventNote
    });

    await order.save();

    // Bắn socket realtime cho client/admin nếu có kết nối
    try {
        const io = getIO();
        if (io) {
            io.emit("order_status_updated", {
                orderId: order._id,
                orderCode: order.orderCode,
                orderStatus: newOrderStatus,
                shippingStatus: newShippingStatus,
                note: eventNote
            });
        }
    } catch {
        // Socket không khả dụng thì bỏ qua
    }

    console.log(`[ViettelPost Webhook] Đã cập nhật đơn ${order.orderCode} -> Shipping: ${newShippingStatus}, Order: ${newOrderStatus}`);
    return order;
};
