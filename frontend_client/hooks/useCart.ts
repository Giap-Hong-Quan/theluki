"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cartService,
  AddToCartPayload,
  UpdateQuantityPayload,
  ToggleSelectPayload,
  RemoveItemPayload,
} from "@/services/cartService";
import { ICart } from "@/types/cartType";
import toast from "react-hot-toast";

import { getCookie } from "@/services/axios-client";

export const CART_KEYS = {
  all: ["cart"] as const,
};

export const useCart = () => {
  return useQuery<ICart>({
    queryKey: CART_KEYS.all,
    queryFn: async () => {
      const res: any = await cartService.getCart();
      return res?.data;
    },
    enabled: typeof window !== "undefined" && !!getCookie("accessToken"),
    retry: false,
    staleTime: 1000 * 60, // 1 minute
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

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateQuantityPayload) =>
      cartService.updateQuantity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật số lượng!";
      toast.error(msg);
    },
  });
};

export const useToggleSelectCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ToggleSelectPayload) =>
      cartService.toggleSelect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể thay đổi trạng thái chọn!";
      toast.error(msg);
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RemoveItemPayload) => cartService.removeItem(payload),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
      toast.success(res?.message || "Đã xóa sản phẩm khỏi giỏ hàng");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa sản phẩm!";
      toast.error(msg);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
      toast.success(res?.message || "Đã làm trống giỏ hàng");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa giỏ hàng!";
      toast.error(msg);
    },
  });
};
