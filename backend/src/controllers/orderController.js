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
 * 3. Lấy chi tiết 1 đơn hàng theo orderCode
 */
export const getOrderDetailController = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { orderCode } = req.params;
        const order = await orderService.getOrderDetail(userId, orderCode);
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
