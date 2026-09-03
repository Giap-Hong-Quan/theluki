import axiosClient from "@/services/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import {
  GetBannersParams,
  GetBannersResponse,
  IBanner,
} from "@/types/bannerType";

export const bannerService = {
  // Lấy danh sách banner (mặc định lấy banner active)
  getBanners: async (
    params?: GetBannersParams
  ): Promise<{ data: GetBannersResponse; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.BANNERS.GET_ALL, {
      params,
    });
  },

  // Lấy chi tiết banner theo ID
  getBannerById: async (
    id: string
  ): Promise<{ data: IBanner; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.BANNERS.GET_BY_ID(id));
  },
};
