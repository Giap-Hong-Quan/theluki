import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "@/contants/api-endpoint";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Hàm lấy token từ Cookie
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Hàm lưu token vào Cookie
export function setCookie(name: string, value: string, maxAge = 604800) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// Hàm xóa Cookie
export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// Helper kiểm tra thời gian hết hạn của token
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded?.exp) return false;
    // Hết hạn hoặc sắp hết hạn trong vòng 10 giây
    return decoded.exp * 1000 - Date.now() < 10000;
  } catch {
    return true;
  }
}

// Khởi tạo Axios Instance cơ bản
export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Gắn Access Token từ Cookie vào Header Authorization
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Trả về data trực tiếp & Tự động gọi Refresh Token khi 401
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Không refresh nếu chính các request auth (signin, signup, refresh-token) bị lỗi
    const isAuthRequest =
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.SIGNIN) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.SIGNUP) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      if (isRefreshing) {
        // Đang có 1 request refresh chạy -> đưa request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API cấp lại accessToken mới (Backend tự đọc refreshToken từ HTTP-only Cookie)
        const refreshResponse = await axios.post(
          `${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (newAccessToken) {
          setCookie("accessToken", newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Giải phóng hàng đợi với token mới
          processQueue(null, newAccessToken);

          // Gửi lại request ban đầu một cách liền mạch
          return axiosClient(originalRequest);
        } else {
          throw new Error("Không nhận được accessToken mới từ máy chủ.");
        }
      } catch (refreshError) {
        // Refresh token cũng hết hạn / lỗi -> Logout
        processQueue(refreshError, null);
        deleteCookie("accessToken");

        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const customError = error.response?.data || {
      success: false,
      message: error.message || "Đã có lỗi xảy ra",
    };
    return Promise.reject(customError);
  }
);

export default axiosClient;
