export interface PayloadLogin {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "user";
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: AdminUser;
  };
}