import axiosClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import {
  GetProductsParams,
  GetProductsResponse,
} from "@/types/productType";

export const productService = {
  // Lấy danh sách sản phẩm theo Slug danh mục (hoặc ID danh mục)
  getProductsByCategorySlug: async (
    categorySlug: string,
    params?: Omit<GetProductsParams, "category">
  ): Promise<{ data: GetProductsResponse; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.PRODUCTS.GET_ALL, {
      params: {
        ...params,
        category: categorySlug,
      },
    });
  },

  // Lấy danh sách sản phẩm tổng quát (hỗ trợ phân trang, tìm kiếm, lọc)
  getProducts: async (
    params?: GetProductsParams
  ): Promise<{ data: GetProductsResponse; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.PRODUCTS.GET_ALL, {
      params,
    });
  },
};
