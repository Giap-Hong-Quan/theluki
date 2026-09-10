import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      console.warn("Lỗi tính cước ViettelPost:", error?.message);
    },
  });
};
