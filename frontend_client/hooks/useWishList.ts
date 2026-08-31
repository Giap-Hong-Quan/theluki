"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/services/wishlistService";
import { IProduct } from "@/types/productType";
import toast from "react-hot-toast";

export const WISHLIST_KEYS = {
  all: ["wishlist"] as const,
  list: () => [...WISHLIST_KEYS.all, "list"] as const,
};

// 1. Hook lấy danh sách sản phẩm yêu thích của người dùng đang đăng nhập
export const useWishlist = () => {
  return useQuery({
    queryKey: WISHLIST_KEYS.list(),
    queryFn: () => wishlistService.getWishlist(),
    select: (res) => (res?.data || []) as IProduct[],
    staleTime: 2 * 60 * 1000, // Cache 2 phút
    retry: false,
  });
};

// 2. Hook Toggle Like/Unlike sản phẩm (Thêm/Xóa nhanh)
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.toggleWishlist(productId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      if (res?.data?.isFavorite) {
        toast.success("Đã thêm vào danh sách yêu thích");
      } else {
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
    },
  });
};

// 3. Hook xóa 1 sản phẩm cụ thể khỏi Wishlist
export const useRemoveWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeWishlistItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Xóa sản phẩm thất bại!");
    },
  });
};

// 4. Hook xóa toàn bộ sản phẩm trong Wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Đã xóa toàn bộ danh sách yêu thích");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Xóa danh sách thất bại!");
    },
  });
};

// 5. Helper Hook kiểm tra nhanh xem 1 sản phẩm có đang được Like không
export const useIsFavorite = (productId?: string) => {
  const { data: wishlist = [] } = useWishlist();
  if (!productId) return false;
  return wishlist.some((item) => item._id === productId);
};
