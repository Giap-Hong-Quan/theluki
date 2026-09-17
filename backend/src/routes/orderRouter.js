import express from "express";
import {
    checkoutController,
    getMyOrdersController,
    getOrderDetailController,
    cancelOrderController,
    calculateShippingFeeController,
    getAllOrdersAdminController,
    updateOrderStatusAdminController,
    viettelPostWebhookController
} from "../controllers/orderController.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { checkoutZod, cancelOrderZod, getMyOrdersZod } from "../validators/orderZod.js";

const orderRouter = express.Router();

/**
 * @swagger
 * /order/webhooks/viettelpost:
 *   post:
 *     summary: Webhook nhận cập nhật trạng thái vận chuyển từ ViettelPost (Public)
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DATA:
 *                 type: object
 *                 properties:
 *                   ORDER_NUMBER:
 *                     type: string
 *                     example: "123456789VTP"
 *                   ORDER_STATUS:
 *                     type: integer
 *                     example: 501
 *                   STATUS_NAME:
 *                     type: string
 *                     example: "Giao hàng thành công"
 *                   NOTE:
 *                     type: string
 *                     example: "Khách đã nhận hàng"
 *     responses:
 *       200:
 *         description: Nhận và xử lý webhook thành công
 */
orderRouter.post("/webhooks/viettelpost", viettelPostWebhookController);

// Tất cả route đơn hàng phía dưới đều yêu cầu đăng nhập
orderRouter.use(verifyToken);

orderRouter.post("/calculate-fee", calculateShippingFeeController);

/**
 * @swagger
 * /order/checkout:
 *   post:
 *     summary: Tạo đơn hàng từ giỏ hàng (dùng chung cho mọi phương thức thanh toán)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - receiverName
 *                   - receiverPhone
 *                   - province
 *                   - district
 *                   - ward
 *                   - detailAddress
 *                 properties:
 *                   receiverName: { type: string, example: "Nguyễn Văn A" }
 *                   receiverPhone: { type: string, example: "0901234567" }
 *                   province: { type: string, example: "TP. Hồ Chí Minh" }
 *                   district: { type: string, example: "Quận 1" }
 *                   ward: { type: string, example: "Phường Bến Nghé" }
 *                   detailAddress: { type: string, example: "123 Nguyễn Huệ" }
 *                   note: { type: string, example: "Giao giờ hành chính" }
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, SEPAY, MOMO, VNPAY, ESCROW]
 *                 example: "COD"
 *               couponCode:
 *                 type: string
 *                 example: "SUMMER2026"
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       400:
 *         description: Giỏ hàng trống, tồn kho không đủ, hoặc coupon không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Giỏ hàng trống
 *       500:
 *         description: Lỗi hệ thống
 */
orderRouter.post("/checkout", validate(checkoutZod), checkoutController);

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Lấy danh sách đơn hàng của tôi
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED] }
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi hệ thống
 */
orderRouter.get("/", validate(getMyOrdersZod), getMyOrdersController);
orderRouter.get("/my-orders", validate(getMyOrdersZod), getMyOrdersController);

// ================= ROUTE DÀNH CHO ADMIN / STAFF =================

/**
 * @swagger
 * /order/admin/all:
 *   get:
 *     summary: "[ADMIN] Lấy tất cả đơn hàng hệ thống (phân trang, lọc theo trạng thái)"
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED] }
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin/staff
 */
orderRouter.get("/admin/all", authorizeRoles("admin", "staff"), getAllOrdersAdminController);

/**
 * @swagger
 * /order/admin/{id}/status:
 *   put:
 *     summary: "[ADMIN] Cập nhật trạng thái đơn hàng (Duyệt PROCESSING -> ViettelPost, Hủy CANCELLED -> Hoàn kho)"
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID đơn hàng MongoDB
 *         schema:
 *           type: string
 *           example: "65f123456789abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, RETURNED]
 *                 example: "PROCESSING"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin/staff
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
orderRouter.put("/admin/:id/status", authorizeRoles("admin", "staff"), updateOrderStatusAdminController);

/**
 * @swagger
 * /order/{orderCode}:
 *   get:
 *     summary: Lấy chi tiết 1 đơn hàng
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lấy chi tiết đơn hàng thành công
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi hệ thống
 */
orderRouter.get("/:orderCode", getOrderDetailController);

/**
 * @swagger
 * /order/{orderCode}/cancel:
 *   put:
 *     summary: Hủy đơn hàng (chỉ khi đơn đang PENDING hoặc PROCESSING)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: "Đổi ý không mua nữa" }
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 *       400:
 *         description: Đơn hàng không thể hủy ở trạng thái hiện tại
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi hệ thống
 */
orderRouter.put("/:orderCode/cancel", validate(cancelOrderZod), cancelOrderController);

export default orderRouter;
