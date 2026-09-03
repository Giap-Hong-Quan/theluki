import axiosClient from "@/services/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import { IProduct } from "@/types/productType";
import { IToggleWishlistResponse } from "@/types/wishlistType";

export const wishlistService = {
  // 1. Lấy danh sách toàn bộ sản phẩm yêu thích
  getWishlist: async (): Promise<{ data: IProduct[]; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.WISHLIST.GET);
  },

  // 2. Thêm hoặc Xóa sản phẩm khỏi danh sách yêu thích (Toggle Like/Unlike)
  toggleWishlist: async (
    productId: string
  ): Promise<{ data: IToggleWishlistResponse; message: string; statusCode: number }> => {
    return axiosClient.post(API_ENDPOINTS.WISHLIST.TOGGLE(productId));
  },

  // 3. Xóa 1 sản phẩm khỏi danh sách yêu thích
  removeWishlistItem: async (
    productId: string
  ): Promise<{ data: { totalWishlist: number }; message: string; statusCode: number }> => {
    return axiosClient.delete(API_ENDPOINTS.WISHLIST.REMOVE_ITEM(productId));
  },

  // 4. Xóa toàn bộ sản phẩm trong danh sách yêu thích
  clearWishlist: async (): Promise<{ data: { totalWishlist: number }; message: string; statusCode: number }> => {
    return axiosClient.delete(API_ENDPOINTS.WISHLIST.CLEAR);
  },
};
