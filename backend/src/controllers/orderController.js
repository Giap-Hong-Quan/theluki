import * as orderService from "../services/orderService.js";
import { success } from "../utils/success.js";

/**
 * 1. Tạo đơn hàng từ giỏ hàng (Checkout) - dùng chung cho MỌI phương thức thanh toán.
 * Controller chỉ làm nhiệm vụ nhận request, gọi service và trả response.
 */
export const checkoutController = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const order = await orderService.createOrderFromCart(userId, req.body);

        const message =
            order.paymentInfo.method === "COD"
                ? "Đặt hàng thành công"
                : "Tạo đơn hàng thành công, vui lòng tiến hành thanh toán";

        return success(res, order, message, 201);
    } catch (error) {
        next(error);
    }
};

/**
 * 2. Lấy danh sách đơn hàng của user hiện tại (phân trang, filter theo trạng thái)
 */
export const getMyOrdersController = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const result = await orderService.getMyOrders(userId, req.query);
        return success(res, result, "Lấy danh sách đơn hàng thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
/**
 * 3. Lấy chi tiết 1 đơn hàng (theo id hoặc orderCode)
 */
export const getOrderDetailController = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const userRole = req.user.role?.name || req.user.role || "";
        const identifier = req.params.orderCode || req.params.id;
        const order = await orderService.getOrderDetail(userId, identifier, userRole);
        return success(res, order, "Lấy chi tiết đơn hàng thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * 4. Hủy đơn hàng (chỉ khi đang PENDING hoặc PROCESSING)
 */
export const cancelOrderController = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { orderCode } = req.params;
        const { reason } = req.body;
        const order = await orderService.cancelOrder(userId, orderCode, reason);
        return success(res, order, "Hủy đơn hàng thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * 5. Tính trước phí ship cho giỏ hàng hiện tại với địa chỉ nhận hàng cụ thể
 */
export const calculateShippingFeeController = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const fees = await orderService.calculateShippingFee(userId, req.body);
        return success(res, fees, "Tính phí vận chuyển thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * 6. [ADMIN] Lấy danh sách toàn bộ đơn hàng
 */
export const getAllOrdersAdminController = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrdersAdmin(req.query);
        return success(res, result, "Lấy danh sách đơn hàng thành công", 200);
    } catch (error) {
        next(error);
    }
};

/**
 * 7. [ADMIN] Cập nhật trạng thái đơn hàng (Duyệt, Đóng gói, Vận chuyển, Hủy)
 */
export const updateOrderStatusAdminController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user._id;
        const order = await orderService.updateOrderStatusAdmin(id, status, userId);
        return success(res, order, "Cập nhật trạng thái đơn hàng thành công", 200);
    } catch (error) {
        next(error);
    }
};

export const viettelPostWebhookController = async (req, res, next) => {
    try {
        console.log("[ViettelPost Webhook] Nhận dữ liệu:", JSON.stringify(req.body));
        const updatedOrder = await orderService.handleViettelPostWebhook(req.body);

        return res.status(200).json({
            status: 200,
            message: "Nhận và xử lý webhook thành công",
            data: updatedOrder ? { orderCode: updatedOrder.orderCode } : null
        });
    } catch (error) {
        console.error("Lỗi khi xử lý ViettelPost Webhook:", error);
        // Luôn trả về HTTP 200 kèm error để ViettelPost không retry spam server
        return res.status(200).json({
            status: 200,
            message: "Đã nhận webhook nhưng có lỗi xử lý nội bộ",
            error: error.message
        });
    }
};