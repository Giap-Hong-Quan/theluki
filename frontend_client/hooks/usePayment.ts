import { useMutation } from "@tanstack/react-query";
import { paymentService, CreatePaymentPayload } from "@/services/paymentService";
import toast from "react-hot-toast";

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentService.createPayment(payload),
    onError: (error: any) => {
      toast.error(error?.message || "Không thể khởi tạo thanh toán!");
    },
  });
};
