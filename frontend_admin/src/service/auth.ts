import { apiClient } from "./apiclient";
import type { PayloadLogin, LoginResponse } from "../types/authType";

function decodeJwt(token: string): { id?: string; role?: string; date?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
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
    const decoded = decodeJwt(token);
    const role = decoded?.role;

    // Kiểm tra role: Chỉ cho phép admin và staff đăng nhập vào Portal
    if (role !== "admin" && role !== "staff") {
      throw new Error("Tài khoản của bạn không có quyền truy cập vào trang Quản trị.");
    }

    // Lưu token
    localStorage.setItem("admin_token", token);
    localStorage.setItem("astkn", token);

    // Lấy thông tin chi tiết user
    try {
      const profileRes = await apiClient.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes?.data?.data) {
        localStorage.setItem("admin_user", JSON.stringify(profileRes.data.data));
      }
    } catch {
      localStorage.setItem("admin_user", JSON.stringify({ email: payload.email, role }));
    }

    return res.data;
  },

  // Đăng xuất
  logoutAdmin: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("astkn");
    }
  },

  // Lấy thông tin cá nhân hiện tại
  getProfile: async () => {
    const res = await apiClient.get("/auth/profile");
    return res.data;
  },
};