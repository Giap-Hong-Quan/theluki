import { z } from "zod";

// Schema đăng nhập bằng mật khẩu
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema đăng ký tài khoản (Bước 1: Nhập thông tin)
export const registerSchema = z
  .object({
    last_name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ"),
    first_name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Email không đúng định dạng"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Schema xác thực OTP (Bước 2)
export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(6, "Mã OTP gồm 6 chữ số")
    .max(6, "Mã OTP gồm 6 chữ số")
    .regex(/^\d+$/, "Mã OTP chỉ bao gồm chữ số"),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

// Schema Quên mật khẩu (Bước 1)
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Schema Đặt lại mật khẩu mới (Bước 2 hoặc 3)
export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .trim()
      .min(6, "Mã OTP gồm 6 chữ số")
      .max(6, "Mã OTP gồm 6 chữ số")
      .regex(/^\d+$/, "Mã OTP chỉ bao gồm chữ số"),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schema Mật khẩu mới (Bước 3: Chỉ nhập mật khẩu)
export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

