import axiosClient from "@/services/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import {
  GetCollectionsParams,
  GetCollectionsResponse,
  ICollection,
} from "@/types/collectionType";

export const collectionService = {
  // Lấy danh sách bộ sưu tập (có hỗ trợ phân trang, lọc active, nổi bật)
  getCollections: async (
    params?: GetCollectionsParams
  ): Promise<{ data: GetCollectionsResponse; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.COLLECTIONS.GET_ALL, {
      params,
    });
  },

  // Lấy chi tiết bộ sưu tập theo Slug
  getCollectionBySlug: async (
    slug: string
  ): Promise<{ data: ICollection; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.COLLECTIONS.GET_BY_SLUG(slug));
  },

  // Lấy chi tiết bộ sưu tập theo ID
  getCollectionById: async (
    id: string
  ): Promise<{ data: ICollection; message: string; statusCode: number }> => {
    return axiosClient.get(API_ENDPOINTS.COLLECTIONS.GET_BY_ID(id));
  },
};
