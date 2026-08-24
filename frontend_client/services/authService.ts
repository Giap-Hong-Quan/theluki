import axiosClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import { SigninPayload, SignupPayload, LoginResponse,RegisterResponse } from "@/types/authType";
export const authService = {
  // Đăng nhập
  signin: (payload: SigninPayload): Promise<LoginResponse> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.SIGNIN, payload);
  },

  // Đăng ký tài khoản
  signup: (payload: SignupPayload): Promise<RegisterResponse> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.SIGNUP, payload);
  },

  // Đăng xuất
  logout: (): Promise<{ message?: string; success?: boolean }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Lấy thông tin cá nhân hiện tại
  getProfile: (): Promise<any> => {
    return axiosClient.get(API_ENDPOINTS.AUTH.PROFILE);
  },

  // Gửi OTP xác minh
  sendOtp: (email: string): Promise<RegisterResponse> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { email });
  },

  // Xác minh OTP
  verifyOtp: (email: string, otp: string): Promise<RegisterResponse> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
  },

  // Đăng nhập Google
  googleLogin: (token: string): Promise<LoginResponse> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.GOOGLE, { token });
  },

  // Đăng nhập Facebook
  facebookLogin: (token: string): Promise<LoginResponse> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.FACEBOOK, { token });
  },

  // Quên mật khẩu - Gửi OTP
  forgotPassword: (email: string): Promise<{ message?: string; success?: boolean }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Đặt lại mật khẩu mới bằng OTP
  resetPassword: (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ message?: string; success?: boolean }> => {
    return axiosClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
  },
};

export default authService;
