import { apiClient } from "./apiclient";
import type {
  GetOrdersQueryParams,
  OrdersApiResponse,
  OrderAdminItem,
} from "../types/orderType";

export const orderService = {
  // Lấy danh sách toàn bộ đơn hàng (Admin)
  getAllOrders: async (
    params?: GetOrdersQueryParams
  ): Promise<{ success: boolean; data: OrdersApiResponse }> => {
    return apiClient.get("/order/admin/all", { params });
  },

  // Lấy chi tiết đơn hàng (theo id hoặc mã đơn hàng)
  getOrderDetail: async (
    id: string
  ): Promise<{ success: boolean; data: OrderAdminItem }> => {
    return apiClient.get(`/order/${id}`);
  },

  // Cập nhật trạng thái đơn hàng (Duyệt đơn, Đóng gói, Vận chuyển, Hủy)
  updateOrderStatus: async (
    id: string,
    payload: {
      orderStatus?: string;
      shippingStatus?: string;
      trackingCode?: string;
      note?: string;
    }
  ): Promise<{ success: boolean; data: OrderAdminItem; message: string }> => {
    return apiClient.put(`/order/admin/${id}/status`, payload);
  },
};

export default orderService;
