import { apiClient } from "./apiclient";
import type { PayloadLogin, LoginResponse } from "../types/authType";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  id?: string;
  role?: string;
  date?: string;
}

export const authService = {
  // Đăng nhập hệ thống Quản trị Admin
  loginAdmin: async (payload: PayloadLogin): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/auth/signin", payload);
    const token = res.data?.data?.accessToken;

    if (!token) {
      throw new Error("Không nhận được mã xác thực từ máy chủ.");
    }

    // Giải mã token để kiểm tra role
    let role = "";
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      role = decoded.role || "";
    } catch {
      throw new Error("Token không hợp lệ.");
    }

    // Kiểm tra role: Chỉ cho phép admin và staff đăng nhập vào Portal
    if (role !== "admin" && role !== "staff") {
      throw new Error("Tài khoản của bạn không có quyền truy cập vào trang Quản trị.");
    }

    // Lưu token
    localStorage.setItem("accessToken", token);

    return res.data;
  },

  // Đăng xuất
  logoutAdmin: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
    }
  },

  // Lấy thông tin cá nhân hiện tại
  getProfile: async () => {
    const res = await apiClient.get("/auth/profile");
    return res.data;
  },
};