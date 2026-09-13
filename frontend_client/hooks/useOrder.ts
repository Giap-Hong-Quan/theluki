import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { CheckoutPayload, CalculateFeePayload } from "@/types/orderType";
import toast from "react-hot-toast";

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => orderService.checkout(payload),
    onSuccess: (res) => {
      // Invalidate giỏ hàng sau khi đặt thành công
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success(res?.message || "Đặt hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đặt hàng thất bại, vui lòng thử lại!");
    },
  });
};

export const useCalculateShippingFee = () => {
  return useMutation({
    mutationFn: (payload: CalculateFeePayload) => orderService.calculateShippingFee(payload),
    onError: (error: any) => {
      console.warn("Lỗi tính cước:", error?.message);
    },
  });
};

export const useMyOrders = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ["myOrders", params],
    queryFn: () => orderService.getMyOrders(params),
  });
};

export const useOrderDetail = (orderCode: string) => {
  return useQuery({
    queryKey: ["orderDetail", orderCode],
    queryFn: () => orderService.getOrderDetail(orderCode),
    enabled: Boolean(orderCode),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderCode, reason }: { orderCode: string; reason?: string }) =>
      orderService.cancelOrder(orderCode, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      queryClient.invalidateQueries({ queryKey: ["orderDetail"] });
      toast.success("Hủy đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể hủy đơn hàng!");
    },
  });
};


