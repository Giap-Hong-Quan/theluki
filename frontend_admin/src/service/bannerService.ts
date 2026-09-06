import { apiClient } from "./apiclient";
import type { ApiResponse } from "../types/apiResponseType";
import type {
  BannerItem,
  GetBannersQueryParams,
  GetBannersData,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "../types/bannerType";

export const bannerService = {
  // 1. Lấy toàn bộ danh sách banner (hỗ trợ lọc position, isActive - không phân trang)
  getAllBanners: (
    params?: GetBannersQueryParams
  ): Promise<ApiResponse<GetBannersData>> => {
    return apiClient.get("/banner", { params });
  },

  // 2. Lấy chi tiết banner theo ID
  getBannerById: (id: string): Promise<ApiResponse<BannerItem>> => {
    return apiClient.get(`/banner/${id}`);
  },

  // 3. Tạo mới banner
  createBanner: (
    payload: CreateBannerPayload
  ): Promise<ApiResponse<BannerItem>> => {
    return apiClient.post("/banner", payload);
  },

  // 4. Cập nhật banner theo ID
  updateBanner: (
    id: string,
    payload: UpdateBannerPayload
  ): Promise<ApiResponse<BannerItem>> => {
    return apiClient.put(`/banner/${id}`, payload);
  },

  // 5. Bật / Tắt trạng thái hiển thị banner
  toggleActiveBanner: (id: string): Promise<ApiResponse<BannerItem>> => {
    return apiClient.patch(`/banner/${id}/toggle-active`);
  },

  // 6. Xóa vĩnh viễn banner
  deleteBanner: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/banner/${id}`);
  },
};
