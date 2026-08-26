import axiosClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import {
  GetCategoriesParams,
  GetCategoriesResponse,
} from "@/types/categoryType";

export const categoryService = {
  // Lấy danh sách danh mục (Client)
  getCategories: async (
    params?: GetCategoriesParams
  ): Promise<{ data: GetCategoriesResponse; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL, {
      params,
    });
  },
};
