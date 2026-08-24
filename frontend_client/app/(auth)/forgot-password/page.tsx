"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, ConfigProvider, theme as antdTheme } from "antd";
import {
  Mail,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  ArrowLeft,
  KeyRound,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
  verifyOtpSchema,
  VerifyOtpFormData,
  newPasswordSchema,
  NewPasswordFormData,
} from "@/validators/auth.validator";
import {
  useForgotPassword,
  useResetPassword,
} from "@/hooks/useAuth";
import { useUIStore } from "@/stores/uiStore";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme } = useUIStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [userEmail, setUserEmail] = useState<string>("");
  const [verifiedOtp, setVerifiedOtp] = useState<string>("");

  // Quản lý ẩn/hiện mật khẩu ở Bước 3
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Đếm ngược gửi lại OTP (120s)
  const [countdown, setCountdown] = useState(120);
  const canResend = countdown === 0;

  // React Query Mutations
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  // Form Bước 1: Nhập Email khôi phục
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  // Form Bước 2: Nhập OTP
  const {
    control: controlStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2, isSubmitting: isSubmittingStep2 },
    reset: resetStep2,
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
    },
  });

  // Form Bước 3: Đặt lại mật khẩu mới
  const {
    register: registerStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3, isSubmitting: isSubmittingStep3 },
    reset: resetStep3,
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Đếm ngược thời gian gửi lại OTP ở Bước 2
  useEffect(() => {
    if (currentStep !== 2 || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, countdown]);

  // ==================== XỬ LÝ SUBMIT CÁC BƯỚC ====================

  // Xử lý Bước 1: Gửi mã OTP về email
  const onSubmitStep1 = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setUserEmail(data.email);
      setCountdown(120);
      resetStep2();
      setCurrentStep(2); // Chuyển sang Bước 2: Nhập OTP
    } catch (error: any) {}
  };

  // Xử lý Bước 2: Lưu OTP và chuyển sang Bước 3
  const onSubmitStep2 = (data: VerifyOtpFormData) => {
    setVerifiedOtp(data.otp);
    resetStep3();
    setCurrentStep(3); // Chuyển sang Bước 3: Nhập Mật khẩu mới
  };

  // Xử lý Bước 3: Đổi mật khẩu mới
  const onSubmitStep3 = async (data: NewPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: userEmail,
        otp: verifiedOtp,
        newPassword: data.newPassword,
      });
    } catch (error: any) {}
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (!canResend || forgotPasswordMutation.isPending) return;
    try {
      await forgotPasswordMutation.mutateAsync(userEmail);
      setCountdown(120);
    } catch (error: any) {}
  };

  return (
    <div className="w-full bg-card border border-line p-8 sm:p-10 shadow-box rounded-none transition-colors duration-200">
      {/* 1. Header / Logo Branding */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-primary uppercase">
            THE LUKI
          </h1>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mt-1">
          {currentStep === 1 && "Quên mật khẩu?"}
          {currentStep === 2 && "Xác thực mã OTP"}
          {currentStep === 3 && "Tạo mật khẩu mới"}
        </h2>
        <p className="text-xs sm:text-sm text-secondary tracking-wide mt-2">
          {currentStep === 1 &&
            "Đừng lo! Chúng mình sẽ giúp bạn lấy lại mật khẩu ngay"}
          {currentStep === 2 && `Mã xác thực đã được gửi đến ${userEmail}`}
          {currentStep === 3 &&
            "Vui lòng nhập mật khẩu mới cho tài khoản của bạn"}
        </p>
      </div>

      {/* ======================= BƯỚC 1: NHẬP EMAIL ======================= */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-primary mb-2"
            >
              Số điện thoại hoặc email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-muted pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                {...registerStep1("email")}
                placeholder="Nhập số điện thoại hoặc email của bạn"
                className={`w-full h-12 pl-10 pr-4 text-sm bg-input border hover:border-line-dark focus:border-line-focus text-primary outline-none rounded-none transition-colors placeholder:text-muted ${
                  errorsStep1.email ? "border-red-500" : "border-line"
                }`}
              />
            </div>
            {errorsStep1.email && (
              <p className="text-xs text-red-500 mt-1.5">
                {errorsStep1.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmittingStep1 || forgotPasswordMutation.isPending}
            className="w-full h-12 bg-accent hover:opacity-90 text-accent-contrast font-bold text-xs uppercase tracking-[0.15em] transition-opacity rounded-none flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmittingStep1 || forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ĐANG GỬI MÃ...</span>
              </>
            ) : (
              <span>GỬI XÁC MINH</span>
            )}
          </button>
        </form>
      )}

      {/* ======================= BƯỚC 2: XÁC THỰC OTP ======================= */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmitStep2(onSubmitStep2)} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2 text-center">
              NHẬP MÃ XÁC THỰC (6 SỐ)
            </label>
            <div className="flex justify-center">
              <ConfigProvider
                theme={{
                  algorithm:
                    theme === "dark"
                      ? antdTheme.darkAlgorithm
                      : antdTheme.defaultAlgorithm,
                  token: {
                    colorPrimary: theme === "dark" ? "#ffffff" : "#09090b",
                    colorText: theme === "dark" ? "#f4f4f5" : "#09090b",
                    colorBgContainer: theme === "dark" ? "#18181b" : "#f8fafc",
                    colorBorder: theme === "dark" ? "#52525b" : "#e4e4e7",
                    borderRadius: 0,
                    controlHeight: 48,
                  },
                }}
              >
                <Controller
                  name="otp"
                  control={controlStep2}
                  render={({ field }) => (
                    <Input.OTP
                      length={6}
                      size="large"
                      autoFocus
                      formatter={(str) => str.toUpperCase()}
                      {...field}
                      className="[&_input]:!rounded-none [&_input]:!font-mono [&_input]:!font-bold [&_input]:!text-lg [&_input]:!h-12 [&_input]:!w-10 sm:[&_input]:!w-12 [&_input]:!border-line hover:[&_input]:!border-line-dark focus:[&_input]:!border-line-focus dark:focus:[&_input]:!border-white [&_input]:!bg-input [&_input]:!text-primary"
                    />
                  )}
                />
              </ConfigProvider>
            </div>
            {errorsStep2.otp && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {errorsStep2.otp.message}
              </p>
            )}
          </div>

          {/* Hàng đếm ngược & Gửi lại OTP */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-line pt-3">
            <span className="text-muted">
              {countdown > 0 ? (
                <>
                  Gửi lại sau:{" "}
                  <span className="font-mono font-bold text-primary">
                    {countdown}s
                  </span>
                </>
              ) : (
                "Chưa nhận được mã?"
              )}
            </span>

            <button
              type="button"
              disabled={!canResend || forgotPasswordMutation.isPending}
              onClick={handleResendOtp}
              className={`font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                canResend
                  ? "text-primary hover:underline cursor-pointer"
                  : "text-muted cursor-not-allowed opacity-50"
              }`}
            >
              {forgotPasswordMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>GỬI LẠI MÃ</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmittingStep2}
            className="w-full h-12 bg-accent hover:opacity-90 text-accent-contrast font-bold text-xs uppercase tracking-[0.15em] transition-opacity rounded-none flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <span>TIẾP TỤC</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="w-full text-center text-xs text-secondary hover:text-primary transition-colors pt-2 uppercase font-semibold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Đổi thông tin email</span>
          </button>
        </form>
      )}

      {/* ======================= BƯỚC 3: ĐẶT MẬT KHẨU MỚI ======================= */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmitStep3(onSubmitStep3)} className="space-y-5">
          {/* Field: Mật khẩu mới */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
            >
              Mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                {...registerStep3("newPassword")}
                placeholder="Tối thiểu 6 ký tự"
                className={`w-full h-11 pl-3.5 pr-10 text-sm bg-input border hover:border-line-dark focus:border-line-focus text-primary outline-none rounded-none transition-colors placeholder:text-muted ${
                  errorsStep3.newPassword ? "border-red-500" : "border-line"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted hover:text-primary transition-colors p-1 cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errorsStep3.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errorsStep3.newPassword.message}
              </p>
            )}
          </div>

          {/* Field: Xác nhận mật khẩu mới */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-primary mb-1.5"
            >
              Nhập lại mật khẩu mới
            </label>
            <div className="relative flex items-center">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...registerStep3("confirmPassword")}
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full h-11 pl-3.5 pr-10 text-sm bg-input border hover:border-line-dark focus:border-line-focus text-primary outline-none rounded-none transition-colors placeholder:text-muted ${
                  errorsStep3.confirmPassword ? "border-red-500" : "border-line"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-muted hover:text-primary transition-colors p-1 cursor-pointer"
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errorsStep3.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errorsStep3.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Nút Đặt lại mật khẩu */}
          <button
            type="submit"
            disabled={isSubmittingStep3 || resetPasswordMutation.isPending}
            className="w-full mt-4 h-12 bg-accent hover:opacity-90 text-accent-contrast font-bold text-xs uppercase tracking-[0.15em] transition-opacity rounded-none flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmittingStep3 || resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ĐANG CẬP NHẬT...</span>
              </>
            ) : (
              <span>CẬP NHẬT MẬT KHẨU</span>
            )}
          </button>

          {/* Quay lại bước 2 */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="w-full text-center text-xs text-secondary hover:text-primary transition-colors pt-2 uppercase font-semibold tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại nhập mã OTP</span>
          </button>
        </form>
      )}

      {/* 3. Footer Đăng nhập (Chỉ hiển thị ở Bước 1) */}
      {currentStep === 1 && (
        <div className="mt-8 text-center text-xs text-secondary tracking-wide">
          Bạn đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline ml-1"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </div>
  );
}
