import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../exceptions/ApiError.js";
import { restoreProductStock } from "./productService.js";
import { validateCoupon, calculateDiscountAmount, applyCouponAtomic } from "./couponService.js";
import { calculateFee } from "./viettelPostService.js";

export const createOrderFromCart = async (userId, payload) => {
    const {
        shippingAddress,
        paymentMethod = "COD",
        shippingService = "VTK",
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
        let totalWeight = 0;
        // 1. Kiểm tra tồn kho, trừ kho và lấy đầy đủ variantId, sizeId
        for (const item of selectedItems) {
            const product = await Product.findById(item.product).session(session);
            if (!product || product.isActive === false || product.deletedAt) {
                throw new ApiError(404,`Sản phẩm '${item.name}' không còn tồn tại hoặc đã ngừng hoạt động`);
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
                    throw new ApiError(400,`Sản phẩm '${product.name}' (${colorVar.color}/${sizeOpt.size}) không đủ tồn kho (còn ${sizeOpt.stock})`);
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
                    throw new ApiError(400,`Sản phẩm '${product.name}' không đủ tồn kho (còn ${product.stock})`);
                }
                product.stock -= item.quantity;
                resolvedSku = product.sku;
            }

            // Tăng lượt bán và lưu lại trong transaction
            product.sold = (product.sold || 0) + item.quantity;
            await product.save({ session });
            totalWeight += (product.weight || 300) * item.quantity;

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
        // 2. Tính phí ship theo chính sách của Shop (20k nội tỉnh, 30k ngoại tỉnh, đơn >= 300k Free ship)
        const shippingFeeResults = await calculateFee({
            receiverAddress: shippingAddress,
            weight: totalWeight || 300,
            productPrice: itemsSubtotal,
            codAmount: paymentMethod === "COD" ? itemsSubtotal : 0
        });

        const selectedOption = shippingFeeResults?.[0];
        const finalShippingFee = typeof selectedOption?.fee === "number" ? selectedOption.fee : 30000;

        // 3. Áp dụng mã giảm giá Coupon nếu có
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
                        provinceId: shippingAddress.provinceId || null,
                        wardId: shippingAddress.wardId || null,
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
    const { shippingAddress, productPrice, codAmount = 0 } = payload;
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
        productPrice: itemsSubtotal,
        codAmount
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
 * Lấy chi tiết 1 đơn hàng (kèm check quyền sở hữu - chỉ chủ đơn mới xem được)
 */
export const getOrderDetail = async (userId, orderCode) => {
    const order = await Order.findOne({ orderCode: orderCode.toUpperCase(), user: userId });
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
