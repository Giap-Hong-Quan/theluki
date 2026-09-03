import { apiClient } from "./apiclient";
import type { ApiResponse } from "../types/apiResponseType";
import type {
  UserItem,
  GetUsersQueryParams,
  GetUsersData,
  CreateUserPayload,
  UpdateUserPayload,
} from "../types/userType";

export const userService = {
  // 1. Lấy danh sách người dùng (có phân trang, tìm kiếm, lọc theo hạng, ngày, trạng thái...)
  getAllUsers: (params?: GetUsersQueryParams): Promise<ApiResponse<GetUsersData>> => {
    return apiClient.get("/user", { params });
  },

  // 2. Lấy chi tiết thông tin người dùng theo ID
  getUserById: (id: string): Promise<ApiResponse<UserItem>> => {
    return apiClient.get(`/user/${id}`);
  },

  // 3. Tạo mới tài khoản người dùng (Admin tạo)
  createUser: (payload: CreateUserPayload): Promise<ApiResponse<UserItem>> => {
    return apiClient.post("/user", payload);
  },

  // 4. Cập nhật thông tin người dùng theo ID
  updateUser: (id: string, payload: UpdateUserPayload): Promise<ApiResponse<UserItem>> => {
    return apiClient.put(`/user/${id}`, payload);
  },

  // 5. Bật / Tắt trạng thái hoạt động của người dùng (Active / Inactive)
  toggleActiveUser: (id: string): Promise<ApiResponse<UserItem>> => {
    return apiClient.put(`/user/${id}/active`);
  },

  // 6. Xóa mềm người dùng (Soft Delete)
  deleteUser: (id: string): Promise<ApiResponse<UserItem>> => {
    return apiClient.put(`/user/${id}/delete`);
  },

  // 7. Khôi phục người dùng đã bị xóa mềm (Restore)
  restoreUser: (id: string): Promise<ApiResponse<UserItem>> => {
    return apiClient.put(`/user/${id}/restore`);
  },

  // 8. Xóa vĩnh viễn người dùng (Hard Delete / Force Delete)
  forceDeleteUser: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/user/${id}/force`);
  },
};