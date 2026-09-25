import * as paymentService from "../services/payment/paymentService.js";
import { success } from "../utils/success.js";

/**
 * 1. API TỔNG: Khởi tạo thanh toán (POST /api/payment/create)
 * Nhận orderCode và paymentMethod (VNPAY, MOMO, SEPAY, COD)
 */
export const createPaymentController = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { orderCode, paymentMethod, bankCode } = req.body;

        const result = await paymentService.createUnifiedPayment({
            userId,
            orderCode,
            paymentMethod,
            bankCode,
            req
        });

        return success(res, result, "Khởi tạo yêu cầu thanh toán thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * 2. VNPAY IPN (GET /api/payment/vnpay/ipn)
 * Cổng VNPAY gọi server-to-server để xác nhận kết quả
 */
export const vnpayIpnController = async (req, res, next) => {
    try {
        const result = await paymentService.processVnpayIpn(req.query);
        // VNPAY yêu cầu trả JSON { RspCode: '00', Message: 'Confirm Success' }
        return res.status(200).json(result);
    } catch (error) {
        return res.status(200).json({ RspCode: "99", Message: error.message || "Unknown error" });
    }
};

/**
 * 3. VNPAY Return URL (GET /api/payment/vnpay/return)
 * Trình duyệt khách redirect về sau khi thanh toán trên cổng VNPAY
 */
export const vnpayReturnController = async (req, res, next) => {
    try {
        const result = await paymentService.verifyVnpayReturn(req.query);
        return success(res, result, "Kiểm tra kết quả thanh toán VNPAY thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * 4. MOMO IPN (POST /api/payment/momo/ipn)
 * Cổng MoMo gọi server-to-server để xác nhận kết quả
 */
export const momoIpnController = async (req, res, next) => {
    try {
        const result = await paymentService.processMomoIpn(req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(200).json({ resultCode: 99, message: error.message || "Unknown error" });
    }
};

/**
 * 5. SEPAY Webhook (POST /api/payment/sepay/webhook)
 * SePay gọi webhook khi có biến động số dư ngân hàng tại quầy POS
 */
export const sepayWebhookController = async (req, res, next) => {
    try {
        const result = await paymentService.processSepayWebhook(req.headers, req.body);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
