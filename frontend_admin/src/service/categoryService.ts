import { apiClient } from "./apiclient";
import type { ApiResponse } from "../types/apiResponseType";
import type {
  CategoryItem,
  GetCategoriesQueryParams,
  GetCategoriesData,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/categoryType";

export const categoryService = {
  // 1. Lấy toàn bộ danh sách danh mục (hỗ trợ tìm kiếm, lọc theo isDeleted, isActive - không phân trang)
  getAllCategories: (
    params?: GetCategoriesQueryParams
  ): Promise<ApiResponse<GetCategoriesData>> => {
    return apiClient.get("/category", { params });
  },

  // 2. Lấy chi tiết danh mục theo ID
  getCategoryById: (id: string): Promise<ApiResponse<CategoryItem>> => {
    return apiClient.get(`/category/${id}`);
  },

  // 3. Tạo mới danh mục
  createCategory: (
    payload: CreateCategoryPayload
  ): Promise<ApiResponse<CategoryItem>> => {
    return apiClient.post("/category", payload);
  },

  // 5. Cập nhật thông tin danh mục theo ID
  updateCategory: (
    id: string,
    payload: UpdateCategoryPayload
  ): Promise<ApiResponse<CategoryItem>> => {
    return apiClient.put(`/category/${id}`, payload);
  },

  // 6. Bật / Tắt trạng thái hoạt động của danh mục (Active / Inactive)
  toggleActiveCategory: (id: string): Promise<ApiResponse<CategoryItem>> => {
    return apiClient.put(`/category/${id}/active`);
  },

  // 8. Xóa mềm danh mục (đưa vào thùng rác)
  deleteCategory: (id: string): Promise<ApiResponse<CategoryItem>> => {
    return apiClient.put(`/category/${id}/delete`);
  },

  // 9. Khôi phục danh mục đã bị xóa mềm từ thùng rác
  restoreCategory: (id: string): Promise<ApiResponse<CategoryItem>> => {
    return apiClient.put(`/category/${id}/restore`);
  },

  // 10. Xóa vĩnh viễn danh mục (Hard Delete)
  forceDeleteCategory: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/category/${id}/force`);
  },
};
