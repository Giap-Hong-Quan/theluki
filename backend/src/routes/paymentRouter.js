import express from "express";
import {
    createPaymentController,
    vnpayIpnController,
    vnpayReturnController,
    momoIpnController,
    sepayWebhookController
} from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const paymentRouter = express.Router();

/**
 * =========================================================================
 * 1. CÁC ROUTE WEBHOOK / IPN (PUBLIC - BÊN THỨ 3 GỌI VÀO)
 * Tuyệt đối không đặt verifyToken ở đây vì Server Gateway gọi sang
 * =========================================================================
 */

// VNPAY IPN & Return
paymentRouter.get("/vnpay/ipn", vnpayIpnController);
paymentRouter.get("/vnpay/return", vnpayReturnController);

// MOMO IPN
paymentRouter.post("/momo/ipn", momoIpnController);

// SEPAY Webhook (Biến động số dư tại quầy POS)
paymentRouter.post("/sepay/webhook", sepayWebhookController);

/**
 * =========================================================================
 * 2. CÁC ROUTE YÊU CẦU ĐĂNG NHẬP (USER / STAFF / ADMIN)
 * =========================================================================
 */
paymentRouter.use(verifyToken);

// API tổng tạo yêu cầu thanh toán (Hỗ trợ VNPAY, MOMO, SEPAY, COD)
paymentRouter.post("/create", createPaymentController);

export default paymentRouter;
