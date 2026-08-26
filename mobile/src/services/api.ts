import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { CONFIG } from "../constants/Config";

// Tạo instance của Axios
const api: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 1. Request Interceptor: Tự động đính kèm Token xác thực vào Header nếu có
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Sau này khi lưu token trong AsyncStorage / SecureStore / Zustand, bạn lấy ra ở đây:
    // const token = await AsyncStorage.getItem("accessToken");
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Xử lý dữ liệu trả về và bắt lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để code ở view ngắn gọn hơn
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      // Xử lý các mã lỗi phổ biến
      switch (status) {
        case 401:
          console.warn("[API 401] Chưa đăng nhập hoặc phiên làm việc hết hạn");
          // Xử lý logout hoặc chuyển hướng về /login nếu cần
          break;
        case 403:
          console.warn("[API 403] Không có quyền truy cập");
          break;
        case 404:
          console.warn("[API 404] Không tìm thấy tài nguyên");
          break;
        case 500:
          console.error("[API 500] Lỗi hệ thống server:", data?.message || error.message);
          break;
        default:
          console.error(`[API ${status}]:`, data?.message || error.message);
      }
    } else if (error.request) {
      console.error("[API Network Error] Không thể kết nối tới Server. Hãy kiểm tra IP backend!");
    } else {
      console.error("[API Error]", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
