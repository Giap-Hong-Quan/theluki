import { apiClient } from "./apiclient";
import type { ApiResponse } from "../types/apiResponseType";
import type {
  CollectionItem,
  GetCollectionsQueryParams,
  GetCollectionsData,
  CreateCollectionPayload,
  UpdateCollectionPayload,
} from "../types/collectionType";

export const collectionService = {
  // 1. Lấy danh sách bộ sưu tập (phân trang, tìm kiếm, lọc theo isFeatured, isActive, isDeleted)
  getAllCollections: (
    params?: GetCollectionsQueryParams
  ): Promise<ApiResponse<GetCollectionsData>> => {
    return apiClient.get("/collection", { params });
  },

  // 2. Lấy chi tiết bộ sưu tập theo ID
  getCollectionById: (id: string): Promise<ApiResponse<CollectionItem>> => {
    return apiClient.get(`/collection/${id}`);
  },

  // 3. Tạo mới bộ sưu tập
  createCollection: (
    payload: CreateCollectionPayload
  ): Promise<ApiResponse<CollectionItem>> => {
    return apiClient.post("/collection", payload);
  },

  // 4. Cập nhật thông tin bộ sưu tập theo ID
  updateCollection: (
    id: string,
    payload: UpdateCollectionPayload
  ): Promise<ApiResponse<CollectionItem>> => {
    return apiClient.put(`/collection/${id}`, payload);
  },

  // 5. Bật / Tắt trạng thái hoạt động của bộ sưu tập (Active / Inactive)
  toggleActiveCollection: (id: string): Promise<ApiResponse<CollectionItem>> => {
    return apiClient.put(`/collection/${id}/active`);
  },

  // 6. Xóa mềm bộ sưu tập (đưa vào thùng rác)
  deleteCollection: (id: string): Promise<ApiResponse<CollectionItem>> => {
    return apiClient.put(`/collection/${id}/delete`);
  },

  // 7. Khôi phục bộ sưu tập đã bị xóa mềm từ thùng rác
  restoreCollection: (id: string): Promise<ApiResponse<CollectionItem>> => {
    return apiClient.put(`/collection/${id}/restore`);
  },

  // 8. Xóa vĩnh viễn bộ sưu tập (Hard Delete)
  forceDeleteCollection: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/collection/${id}/force`);
  },
};
