import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../service/orderService";
import type { GetOrdersQueryParams } from "../types/orderType";
import toast from "react-hot-toast";

// 1. Hook lấy danh sách toàn bộ đơn hàng (Admin)
export const useGetAllOrders = (params?: GetOrdersQueryParams) => {
  return useQuery({
    queryKey: ["adminOrders", params],
    queryFn: () => orderService.getAllOrders(params),
    select: (response) => response?.data,
  });
};

// 2. Hook lấy chi tiết đơn hàng (theo id hoặc orderCode)
export const useGetOrderDetail = (id?: string) => {
  return useQuery({
    queryKey: ["adminOrderDetail", id],
    queryFn: () => orderService.getOrderDetail(id!),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
};

// 3. Hook cập nhật trạng thái đơn hàng (Duyệt, Đóng gói, Vận chuyển, Hủy)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      orderCode,
      payload,
    }: {
      id?: string;
      orderCode?: string;
      payload: {
        orderStatus?: string;
        shippingStatus?: string;
        trackingCode?: string;
        note?: string;
      };
    }) => orderService.updateOrderStatus((id || orderCode)!, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Cập nhật trạng thái đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      queryClient.invalidateQueries({ queryKey: ["adminOrderDetail"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật trạng thái đơn hàng!"
      );
    },
  });
};
