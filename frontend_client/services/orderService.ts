import axiosClient from "@/services/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import {
  CheckoutPayload,
  CalculateFeePayload,
  ShippingFeeOption,
  OrderResponse,
} from "@/types/orderType";

export const orderService = {
  // Tính phí vận chuyển trước
  calculateShippingFee: (payload: CalculateFeePayload): Promise<{ success: boolean; data: ShippingFeeOption[] }> => {
    return axiosClient.post(API_ENDPOINTS.ORDERS.CALCULATE_FEE, payload);
  },

  // Tạo đơn hàng (Checkout)
  checkout: (payload: CheckoutPayload): Promise<{ success: boolean; message: string; data: OrderResponse }> => {
    return axiosClient.post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
  },

  // Lấy danh sách đơn hàng của tôi
  getMyOrders: (params?: { page?: number; limit?: number; status?: string }) => {
    return axiosClient.get(API_ENDPOINTS.ORDERS.GET_MY_ORDERS, { params });
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: (id: string) => {
    return axiosClient.get(API_ENDPOINTS.ORDERS.GET_DETAIL(id));
  },

  // Hủy đơn hàng
  cancelOrder: (id: string, reason?: string) => {
    return axiosClient.put(API_ENDPOINTS.ORDERS.CANCEL(id), { reason });
  },
};

export default orderService;
