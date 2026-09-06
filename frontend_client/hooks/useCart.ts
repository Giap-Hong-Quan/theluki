"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService, AddToCartPayload } from "@/services/cartService";
import toast from "react-hot-toast";

export const CART_KEYS = {
  all: ["cart"] as const,
};

export const useCart = () => {
  return useQuery({
    queryKey: CART_KEYS.all,
    queryFn: () => cartService.getCart(),
    select: (res) => res?.data,
    retry: false,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addToCart(payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
      toast.success(res?.message || "Đã thêm sản phẩm vào giỏ hàng!");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Vui lòng đăng nhập để thêm vào giỏ hàng!";
      toast.error(msg);
    },
  });
};
