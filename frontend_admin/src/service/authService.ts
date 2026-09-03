import { apiClient } from "./apiclient";
import type { PayloadLogin, LoginResponse } from "../types/authType";

export const authService = {
  // Đăng nhập hệ thống Quản trị Admin
  loginAdmin: (payload: PayloadLogin): Promise<LoginResponse> => {
    return apiClient.post("/auth/signin", payload);
  },
};