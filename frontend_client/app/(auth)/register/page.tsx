"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Steps, Input, ConfigProvider } from "antd";
import {
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
} from "lucide-react";

import {
  registerSchema,
  RegisterFormData,
  verifyOtpSchema,
  VerifyOtpFormData,
} from "@/validators/auth.validator";
import {
  useRegister,
  useVerifyOtp,
  useSendOtp,
} from "@/hooks/useAuth";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tự động nhận email và step từ URL (ví dụ: /register?email=...&step=2)
  const emailParam = searchParams.get("email");
  const stepParam = searchParams.get("step");
  const [currentStep, setCurrentStep] = useState<1 | 2>(stepParam === "2" ? 2 : 1);

  // Lưu thông tin đăng ký để phục vụ bước OTP
  const [registeredEmail, setRegisteredEmail] = useState<string>(emailParam || "");
  
  // Quản lý mật khẩu ẩn/hiện
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Đếm ngược gửi lại OTP (120s)
  const [countdown, setCountdown] = useState(120);
  const canResend = countdown === 0;

  // React Query Mutations
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();
  const sendOtpMutation = useSendOtp();

  // Form Bước 1: Nhập thông tin
  const {
    register: registerStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1, isSubmitting: isSubmittingStep1 },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      last_name: "",
      first_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form Bước 2: Xác thực OTP
  const {
    control: controlOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp, isSubmitting: isSubmittingOtp },
    reset: resetOtp,
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
    },
  });

  // Hiệu ứng đếm ngược thời gian gửi lại OTP ở Bước 2
  useEffect(() => {
    if (currentStep !== 2 || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, countdown]);

  // Xử lý nộp Form Bước 1: Đăng ký tài khoản
  const onSubmitStep1 = async (data: RegisterFormData) => {
    try {
      const full_name = `${data.last_name} ${data.first_name}`.trim();
      await registerMutation.mutateAsync({
        full_name,
        email: data.email,
        password: data.password,
      });

      setRegisteredEmail(data.email);
      setCountdown(120);
      resetOtp();
      setCurrentStep(2); // Chuyển sang bước 2: Xác thực OTP
    } catch (error: any) {
      // toast error đã được xử lý trong mutation onError
    }
  };

  // Xử lý nộp Form Bước 2: Xác thực OTP
  const onSubmitStep2 = async (data: VerifyOtpFormData) => {
    try {
      await verifyOtpMutation.mutateAsync({
        email: registeredEmail,
        otp: data.otp,
      });
    } catch (error: any) {
      // toast error đã được xử lý trong mutation onError
    }
  };

  // Xử lý gửi lại mã OTP
  const handleResendOtp = async () => {
    if (!canResend || sendOtpMutation.isPending) return;
    try {
      await sendOtpMutation.mutateAsync(registeredEmail);
      setCountdown(120);
    } catch (error: any) {}
  };

  return (
    <div className="w-full bg-white border border-zinc-200 p-8 sm:p-10 shadow-sm rounded-none transition-colors duration-200">
      {/* header */}
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center mb-3">
          <img
            src="/logo.png"
            alt="THE LUKI Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>
        <p className="text-xs sm:text-sm text-zinc-600 tracking-wide">
          Tạo tài khoản mới để trải nghiệm
        </p>
      </div>

      {/* steps */}
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#09090b",
              colorText: "#09090b",
              colorTextDescription: "#a1a1aa",
              borderRadius: 0,
              borderRadiusSM: 0,
              fontFamily: "inherit",
            },
            components: {
              Steps: {
                iconSizeSM: 26,
                customIconSize: 26,
              },
            },
          }}
        >
          <div className="
            [&_.ant-steps-item-icon]:!rounded-none
            [&_.ant-steps-item-icon]:!font-mono
            [&_.ant-steps-item-icon]:!font-bold
            [&_.ant-steps-item-icon]:!border-zinc-200
            [&_.ant-steps-item-process_.ant-steps-item-icon]:!bg-zinc-900
            [&_.ant-steps-item-process_.ant-steps-item-icon]:!text-white
            [&_.ant-steps-item-process_.ant-steps-item-icon]:!border-zinc-900
            [&_.ant-steps-item-finish_.ant-steps-item-icon]:!bg-zinc-900
            [&_.ant-steps-item-finish_.ant-steps-item-icon]:!text-white
            [&_.ant-steps-item-finish_.ant-steps-item-icon]:!border-zinc-900
            [&_.ant-steps-item-wait_.ant-steps-item-icon]:!bg-zinc-50
            [&_.ant-steps-item-wait_.ant-steps-item-icon]:!text-zinc-400
            [&_.ant-steps-item-content]:!text-center
            [&_.ant-steps-item-title]:!text-[11px]
            [&_.ant-steps-item-title]:!font-bold
            [&_.ant-steps-item-title]:!uppercase
            [&_.ant-steps-item-title]:!tracking-wider
            [&_.ant-steps-item-title]:!mt-1.5
            [&_.ant-steps-item-finish_.ant-steps-item-title]:!text-zinc-900
            [&_.ant-steps-item-process_.ant-steps-item-title]:!text-zinc-900
            [&_.ant-steps-item-wait_.ant-steps-item-title]:!text-zinc-400
            [&_.ant-steps-item-tail::after]:!bg-zinc-200
            [&_.ant-steps-item-finish>.ant-steps-item-container>.ant-steps-item-tail::after]:!bg-zinc-900
          ">
            <Steps
              current={currentStep - 1}
              size="small"
              labelPlacement="vertical"
              items={[
                { title: "Nhập thông tin" },
                { title: "Xác thực OTP" },
              ]}
            />
          </div>
        </ConfigProvider>
      </div>

      {/* b1 */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmitStep1(onSubmitStep1)} className="space-y-4">
          {/* họ tên */}
          <div className="grid grid-cols-2 gap-3">
            {/* họ */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5"
              >
                Họ
              </label>
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                {...registerStep1("last_name")}
                placeholder="Nguyễn"
                className={`w-full h-11 px-3.5 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                  errorsStep1.last_name ? "border-red-500" : "border-zinc-200"
                }`}
              />
              {errorsStep1.last_name && (
                <p className="text-xs text-red-500 mt-1">{errorsStep1.last_name.message}</p>
              )}
            </div>

            {/* Tên */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5"
              >
                Tên
              </label>
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                {...registerStep1("first_name")}
                placeholder="Văn A"
                className={`w-full h-11 px-3.5 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                  errorsStep1.first_name ? "border-red-500" : "border-zinc-200"
                }`}
              />
              {errorsStep1.first_name && (
                <p className="text-xs text-red-500 mt-1">{errorsStep1.first_name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              {...registerStep1("email")}
              placeholder="name@example.com"
              className={`w-full h-11 px-3.5 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                errorsStep1.email ? "border-red-500" : "border-zinc-200"
              }`}
            />
            {errorsStep1.email && (
              <p className="text-xs text-red-500 mt-1">{errorsStep1.email.message}</p>
            )}
          </div>

          {/* Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5"
            >
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...registerStep1("password")}
                placeholder="••••••••"
                className={`w-full h-11 pl-3.5 pr-10 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                  errorsStep1.password ? "border-red-500" : "border-zinc-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorsStep1.password && (
              <p className="text-xs text-red-500 mt-1">{errorsStep1.password.message}</p>
            )}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5"
            >
              Nhập lại mật khẩu
            </label>
            <div className="relative flex items-center">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...registerStep1("confirmPassword")}
                placeholder="••••••••"
                className={`w-full h-11 pl-3.5 pr-10 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                  errorsStep1.confirmPassword ? "border-red-500" : "border-zinc-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errorsStep1.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errorsStep1.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Nút Đăng ký */}
          <button
            type="submit"
            disabled={isSubmittingStep1 || registerMutation.isPending}
            className="w-full mt-6 h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.15em] transition-colors rounded-none flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmittingStep1 || registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ĐANG XỬ LÝ...</span>
              </>
            ) : (
              <span>TIẾP TỤC</span>
            )}
          </button>
        </form>
      )}

      {/* ======================= BƯỚC 2: XÁC THỰC OTP ======================= */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmitOtp(onSubmitStep2)} className="space-y-6">
          <div className="text-center mb-2">
            <p className="text-xs text-zinc-600">
              Mã xác thực đã gửi đến{" "}
              <span className="font-semibold text-zinc-900 font-mono block sm:inline mt-0.5 sm:mt-0">
                {registeredEmail}
              </span>
            </p>
          </div>

          {/* Ô nhập mã OTP bằng Antd Input.OTP */}
          <div>
            <div className="flex justify-center">
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: "#09090b",
                    colorText: "#09090b",
                    colorBgContainer: "#f8fafc",
                    colorBorder: "#e4e4e7",
                    borderRadius: 0,
                    controlHeight: 48,
                  },
                }}
              >
                <Controller
                  name="otp"
                  control={controlOtp}
                  render={({ field }) => (
                    <Input.OTP
                      length={6}
                      size="large"
                      autoFocus
                      formatter={(str) => str.toUpperCase()}
                      {...field}
                      className="[&_input]:!rounded-none [&_input]:!font-mono [&_input]:!font-bold [&_input]:!text-lg [&_input]:!h-12 [&_input]:!w-10 sm:[&_input]:!w-12 [&_input]:!border-zinc-200 hover:[&_input]:!border-zinc-400 focus:[&_input]:!border-zinc-900 [&_input]:!bg-zinc-50 [&_input]:!text-zinc-900"
                    />
                  )}
                />
              </ConfigProvider>
            </div>
            {errorsOtp.otp && (
              <p className="text-xs text-red-500 mt-2 text-center">
                {errorsOtp.otp.message}
              </p>
            )}
          </div>

          {/* Hàng đếm ngược & Gửi lại OTP */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200 pt-3">
            <span className="text-zinc-400">
              {countdown > 0 ? (
                <>Gửi lại sau: <span className="font-mono font-bold text-zinc-900">{countdown}s</span></>
              ) : (
                "Chưa nhận được mã?"
              )}
            </span>

            <button
              type="button"
              disabled={!canResend || sendOtpMutation.isPending}
              onClick={handleResendOtp}
              className={`font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                canResend
                  ? "text-zinc-900 hover:underline cursor-pointer"
                  : "text-zinc-400 cursor-not-allowed opacity-50"
              }`}
            >
              {sendOtpMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>GỬI LẠI MÃ</span>
            </button>
          </div>

          {/* Nút Xác nhận OTP */}
          <button
            type="submit"
            disabled={isSubmittingOtp || verifyOtpMutation.isPending}
            className="w-full mt-4 h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.15em] transition-colors rounded-none flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {isSubmittingOtp || verifyOtpMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ĐANG XÁC THỰC...</span>
              </>
            ) : (
              <span>XÁC THỰC OTP</span>
            )}
          </button>

          {/* Quay lại bước 1 nếu nhập nhầm thông tin */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="w-full text-center text-xs text-zinc-600 hover:text-zinc-900 transition-colors pt-2 uppercase font-semibold tracking-wider cursor-pointer"
          >
            ← Đổi thông tin email
          </button>
        </form>
      )}

      {/* 3. Footer chuyển sang Đăng nhập (Chỉ hiển thị ở Bước 1) */}
      {currentStep === 1 && (
        <div className="mt-8 text-center text-xs text-zinc-600 tracking-wide">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="text-zinc-900 font-bold hover:underline ml-1"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-white border border-zinc-200 p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}