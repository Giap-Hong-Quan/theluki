import mongoose from "mongoose";
import Order from "../../models/Order.js";
import PaymentTransaction from "../../models/PaymentTransaction.js";
import ApiError from "../../exceptions/ApiError.js";
import { getIO } from "../../config/socket.js";
import { createVnpayPaymentUrl, verifyVnpaySignature, getClientIp } from "./vnpayService.js";
import { createMomoPaymentUrl, verifyMomoSignature } from "./momoService.js";
import { generateCounterVietQr, verifySepayWebhook } from "./sepayService.js";

/**
 * 1. API TỔNG: Khởi tạo thanh toán cho đơn hàng (Hỗ trợ VNPAY, MOMO, SEPAY, COD)
 * Dùng cho cả Khách mua trên Web lẫn Thu ngân POS tại quầy
 */
export const createUnifiedPayment = async ({ userId, orderCode, paymentMethod, bankCode, req }) => {
    // 1. Kiểm tra đơn hàng: hỗ trợ tìm bằng orderCode HOẶC _id Mongo
    let order = null;
    const userFilter = userId ? { user: userId } : {};

    if (mongoose.Types.ObjectId.isValid(orderCode)) {
        order = await Order.findOne({ _id: orderCode, ...userFilter });
    }

    if (!order) {
        order = await Order.findOne({ orderCode, ...userFilter });
    }

    if (!order) {
        throw new ApiError(404, `Không tìm thấy đơn hàng #${orderCode}`);
    }

    if (order.orderStatus === "CANCELLED") {
        throw new ApiError(400, "Đơn hàng này đã bị hủy, không thể tiến hành thanh toán");
    }

    if (order.paymentInfo?.status === "PAID") {
        throw new ApiError(400, "Đơn hàng này đã được thanh toán thành công trước đó");
    }

    const amount = order.financials.finalAmount;
    const finalMethod = (paymentMethod || order.paymentInfo?.method || "COD").toUpperCase();

    // 2. Rẽ nhánh theo phương thức thanh toán
    switch (finalMethod) {
        case "VNPAY": {
            // Tạo bản ghi PaymentTransaction
            const transaction = await PaymentTransaction.create({
                order: order._id,
                user: order.user,
                gateway: "VNPAY",
                amount,
                status: "PENDING"
            });

            order.paymentInfo.method = "VNPAY";
            order.paymentDueAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
            await order.save();

            const clientIp = req ? getClientIp(req) : "127.0.0.1";
            const vnpayResult = createVnpayPaymentUrl({
                orderCode: order.orderCode,
                amount,
                orderInfo: `Thanh toan don hang ${order.orderCode}`,
                bankCode,
                ipAddr: clientIp
            });

            return {
                paymentMethod: "VNPAY",
                actionType: "REDIRECT",
                paymentUrl: vnpayResult.paymentUrl,
                orderCode: order.orderCode,
                amount,
                transactionId: transaction._id,
                expireDate: vnpayResult.expireDate
            };
        }

        case "MOMO": {
            const transaction = await PaymentTransaction.create({
                order: order._id,
                user: order.user,
                gateway: "MOMO",
                amount,
                status: "PENDING"
            });

            order.paymentInfo.method = "MOMO";
            order.paymentDueAt = new Date(Date.now() + 15 * 60 * 1000);
            await order.save();

            const momoResult = await createMomoPaymentUrl({
                orderCode: order.orderCode,
                amount,
                orderInfo: `Thanh toan don hang ${order.orderCode}`
            });

            return {
                paymentMethod: "MOMO",
                actionType: "REDIRECT",
                paymentUrl: momoResult.paymentUrl,
                shortLink: momoResult.shortLink,
                deeplink: momoResult.deeplink,
                qrCodeUrl: momoResult.qrCodeUrl,
                orderCode: order.orderCode,
                amount,
                transactionId: transaction._id
            };
        }

        case "SEPAY": {
            // SePay dùng cho bán hàng tại quầy POS
            const transaction = await PaymentTransaction.create({
                order: order._id,
                user: order.user,
                gateway: "SEPAY",
                amount,
                status: "PENDING"
            });

            order.paymentInfo.method = "SEPAY";
            await order.save();

            const qrInfo = generateCounterVietQr({
                orderCode: order.orderCode,
                amount
            });

            return {
                paymentMethod: "SEPAY",
                actionType: "QR_MODAL",
                qrInfo,
                orderCode: order.orderCode,
                amount,
                transactionId: transaction._id
            };
        }

        case "COD": {
            order.paymentInfo.method = "COD";
            order.paymentInfo.status = "PENDING";
            order.shippingInfo.codAmount = amount;
            await order.save();

            return {
                paymentMethod: "COD",
                actionType: "NONE",
                orderCode: order.orderCode,
                amount,
                message: "Đơn hàng chọn thanh toán khi nhận hàng (COD)"
            };
        }

        default:
            throw new ApiError(400, `Phương thức thanh toán '${paymentMethod}' không được hỗ trợ`);
    }
};

/**
 * 2. Xử lý IPN Webhook từ VNPAY (Server-to-Server)
 */
export const processVnpayIpn = async (query) => {
    const verification = verifyVnpaySignature(query);

    if (!verification.isValid) {
        return { RspCode: "97", Message: "Checksum failed" };
    }

    const { orderCode, amount, isSuccess, responseCode, transactionNo, rawParams } = verification;

    const order = await Order.findOne({ orderCode });
    if (!order) {
        return { RspCode: "01", Message: "Order not found" };
    }

    if (Math.round(order.financials.finalAmount) !== Math.round(amount)) {
        return { RspCode: "04", Message: "Invalid amount" };
    }

    if (order.paymentInfo?.status === "PAID") {
        return { RspCode: "02", Message: "Order already confirmed" };
    }

    let transaction = await PaymentTransaction.findOne({
        order: order._id,
        gateway: "VNPAY",
        status: "PENDING"
    }).sort({ createdAt: -1 });

    if (!transaction) {
        transaction = new PaymentTransaction({
            order: order._id,
            user: order.user,
            gateway: "VNPAY",
            amount
        });
    }

    transaction.rawPayload = rawParams;
    transaction.gatewayEventId = transactionNo;
    transaction.transactionCode = transactionNo ? `VNPAY-${transactionNo}` : `VNPAY-${orderCode}-${Date.now()}`;

    if (isSuccess) {
        transaction.status = "SUCCESS";
        transaction.paidAt = new Date();
        await transaction.save();

        order.paymentInfo.status = "PAID";
        order.paymentInfo.transactionId = transaction.transactionCode;
        order.paymentInfo.paidAt = new Date();

        if (order.orderStatus === "PENDING") {
            order.orderStatus = "PROCESSING";
        }

        order.timeline.push({
            type: "PAYMENT",
            status: "PAID",
            note: `Thanh toán thành công qua VNPAY (Mã GD: ${transactionNo})`,
            updatedAt: new Date()
        });

        await order.save();

        // Bắn Socket realtime
        emitPaymentSuccess(order);

        return { RspCode: "00", Message: "Confirm Success" };
    } else {
        transaction.status = "FAILED";
        await transaction.save();

        order.timeline.push({
            type: "PAYMENT",
            status: "FAILED",
            note: `Thanh toán VNPAY thất bại (ResponseCode: ${responseCode})`,
            updatedAt: new Date()
        });
        await order.save();

        return { RspCode: "00", Message: "Confirm Success" };
    }
};

/**
 * 3. Xử lý IPN Webhook từ MOMO (Server-to-Server)
 */
export const processMomoIpn = async (body) => {
    const verification = verifyMomoSignature(body);

    if (!verification.isValid) {
        return { resultCode: 99, message: "Invalid signature" };
    }

    const { orderCode, amount, isSuccess, resultCode, message, transId, rawPayload } = verification;

    const order = await Order.findOne({ orderCode });
    if (!order) {
        return { resultCode: 1, message: "Order not found" };
    }

    if (Math.round(order.financials.finalAmount) !== Math.round(amount)) {
        return { resultCode: 4, message: "Invalid amount" };
    }

    if (order.paymentInfo?.status === "PAID") {
        return { resultCode: 0, message: "Order already paid" };
    }

    let transaction = await PaymentTransaction.findOne({
        order: order._id,
        gateway: "MOMO",
        status: "PENDING"
    }).sort({ createdAt: -1 });

    if (!transaction) {
        transaction = new PaymentTransaction({
            order: order._id,
            user: order.user,
            gateway: "MOMO",
            amount
        });
    }

    transaction.rawPayload = rawPayload;
    transaction.gatewayEventId = transId ? String(transId) : null;
    transaction.transactionCode = transId ? `MOMO-${transId}` : `MOMO-${orderCode}-${Date.now()}`;

    if (isSuccess) {
        transaction.status = "SUCCESS";
        transaction.paidAt = new Date();
        await transaction.save();

        order.paymentInfo.status = "PAID";
        order.paymentInfo.transactionId = transaction.transactionCode;
        order.paymentInfo.paidAt = new Date();

        if (order.orderStatus === "PENDING") {
            order.orderStatus = "PROCESSING";
        }

        order.timeline.push({
            type: "PAYMENT",
            status: "PAID",
            note: `Thanh toán thành công qua MoMo (Mã GD: ${transId})`,
            updatedAt: new Date()
        });

        await order.save();

        emitPaymentSuccess(order);

        return { resultCode: 0, message: "Success" };
    } else {
        transaction.status = "FAILED";
        await transaction.save();

        order.timeline.push({
            type: "PAYMENT",
            status: "FAILED",
            note: `Thanh toán MoMo thất bại [${resultCode}]: ${message}`,
            updatedAt: new Date()
        });
        await order.save();

        return { resultCode: 0, message: "Acknowledged failure" };
    }
};

/**
 * 4. Xử lý Webhook từ SEPAY (Biến động số dư tại quầy POS)
 */
export const processSepayWebhook = async (headers, body) => {
    const verification = verifySepayWebhook(headers, body);

    if (!verification.isAuthorized) {
        throw new ApiError(401, "Unauthorized SePay Webhook");
    }

    const { isSuccess, eventId, transactionCode, amount, orderCode, rawPayload } = verification;

    if (!orderCode) {
        return { success: true, message: "Ignored: No orderCode in transfer content" };
    }

    // Kiểm tra idempotency (chống xử lý webhook trùng)
    if (eventId) {
        const existingTx = await PaymentTransaction.findOne({ gatewayEventId: eventId });
        if (existingTx && existingTx.status === "SUCCESS") {
            return { success: true, message: "Transaction already processed" };
        }
    }

    const order = await Order.findOne({ orderCode });
    if (!order) {
        return { success: true, message: `Ignored: Order #${orderCode} not found` };
    }

    if (order.paymentInfo?.status === "PAID") {
        return { success: true, message: "Order already confirmed" };
    }

    let transaction = await PaymentTransaction.findOne({
        order: order._id,
        gateway: "SEPAY",
        status: "PENDING"
    }).sort({ createdAt: -1 });

    if (!transaction) {
        transaction = new PaymentTransaction({
            order: order._id,
            user: order.user,
            gateway: "SEPAY",
            amount
        });
    }

    transaction.rawPayload = rawPayload;
    transaction.gatewayEventId = eventId;
    transaction.transactionCode = transactionCode;

    if (isSuccess && amount >= order.financials.finalAmount) {
        transaction.status = "SUCCESS";
        transaction.paidAt = new Date();
        await transaction.save();

        order.paymentInfo.status = "PAID";
        order.paymentInfo.transactionId = transactionCode;
        order.paymentInfo.paidAt = new Date();

        if (order.orderStatus === "PENDING") {
            order.orderStatus = "PROCESSING";
        }

        order.timeline.push({
            type: "PAYMENT",
            status: "PAID",
            note: `Thanh toán thành công tại quầy qua VietQR SePay (${transactionCode})`,
            updatedAt: new Date()
        });

        await order.save();

        // Bắn Socket thông báo ngay cho màn hình POS của thu ngân
        emitPaymentSuccess(order);

        return { success: true, message: "Payment confirmed successfully" };
    } else {
        return { success: true, message: "Amount mismatch or invalid transfer type" };
    }
};

/**
 * 5. Xác thực kết quả redirect về từ VNPAY (vnpay-return)
 */
export const verifyVnpayReturn = async (query) => {
    return verifyVnpaySignature(query);
};

/**
 * Hàm phụ trợ: Bắn Socket.IO khi thanh toán thành công
 */
function emitPaymentSuccess(order) {
    try {
        const io = getIO();
        if (io) {
            io.emit(`order_paid_${order.orderCode}`, {
                orderCode: order.orderCode,
                status: "PAID",
                amount: order.financials.finalAmount,
                paymentMethod: order.paymentInfo?.method
            });
            // Cũng bắn sự kiện chung cho quầy POS
            io.emit("payment_received", {
                orderCode: order.orderCode,
                status: "PAID"
            });
        }
    } catch (err) {
        console.error("Socket emit error:", err.message);
    }
}
