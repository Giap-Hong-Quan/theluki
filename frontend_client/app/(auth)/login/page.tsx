"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { loginSchema, LoginFormData } from "@/validators/auth.validator";
import { useLogin, useGoogleAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { useGoogleLogin } from "@react-oauth/google";
import TheLukiLoader from "@/components/common/TheLukiLoader";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"otp" | "password">("password");
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
 
  const rememberMe = watch("rememberMe");
  const loginMutation = useLogin();

  // Xử lý gửi form đăng nhập
  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      if (
        error?.message?.includes("chưa được xác minh OTP") ||
        error?.message?.includes("chưa xác minh")
      ) {
        try {
          await authService.sendOtp(data.email);
        } catch (_) {}
        router.push(`/register?email=${encodeURIComponent(data.email)}&step=2`);
        return;
      }

      toast.error(error?.message || "Đăng nhập thất bại, vui lòng kiểm tra lại!");
    }
  };
  const googleAuthMutation = useGoogleAuth();

  // Xử lý đăng nhập Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleAuthMutation.mutate(tokenResponse.access_token);
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại!");
    },
  });

  return (
    <>
      {/* Overlay loader when login or Google auth is pending */}
      {(loginMutation.isPending || googleAuthMutation.isPending) && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <TheLukiLoader text="Đang đăng nhập..." />
          <p className="mt-4 text-sm font-semibold tracking-widest text-white uppercase animate-pulse">
            Đang xử lý đăng nhập...
          </p>
        </div>
      )}

      <div className="w-full bg-white border border-zinc-200 p-8 sm:p-10 shadow-sm rounded-none transition-colors duration-200">
        {/* 1. Header / Logo Branding */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-3">
            <img
              src="/logo.png"
              alt="THE LUKI Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>
          <p className="text-xs sm:text-sm text-zinc-600 tracking-wide">
            Chào mừng bạn quay lại
          </p>
        </div>

        {/* 2. Đăng nhập nhanh với Social */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Facebook Button */}
          <button
            type="button"
            className="h-11 px-4 border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-900 transition-colors flex items-center justify-center gap-2 text-xs font-semibold rounded-none"
          >
            <Image src="/fb.svg" alt="Facebook" width={20} height={20} className="w-5 h-5 object-contain" />
            <span>Facebook</span>
          </button>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            disabled={googleAuthMutation.isPending}
            className="h-11 px-4 border border-zinc-200 bg-zinc-50 hover:border-zinc-400 text-zinc-900 transition-colors flex items-center justify-center gap-2 text-xs font-semibold rounded-none cursor-pointer disabled:opacity-50"
          >
            {googleAuthMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <Image src="/gg.svg" alt="Google" width={20} height={20} className="w-5 h-5 object-contain" />
            )}
            <span>Google</span>
          </button>
        </div>

        {/* 3. Divider Hoặc */}
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-zinc-200" />
          <span className="absolute bg-white px-3 text-xs text-zinc-400 uppercase tracking-widest transition-colors">
            Hoặc
          </span>
        </div>

        {/* 4. Tabs */}
        <div className="grid grid-cols-2 border-b border-zinc-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("otp")}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "otp"
                ? "text-zinc-900 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-zinc-900"
                : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            OTP
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === "password"
                ? "text-zinc-900 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-zinc-900"
                : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Mật khẩu
          </button>
        </div>

        {/* 5. Form Content */}
        {activeTab === "password" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Field: Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                {...register("email")}
                placeholder="name@example.com"
                className={`w-full h-11 px-3.5 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                  errors.email ? "border-red-500" : "border-zinc-200"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Field: Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full h-11 pl-3.5 pr-10 text-sm bg-zinc-50 border hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none transition-colors placeholder:text-zinc-400 ${
                    errors.password ? "border-red-500" : "border-zinc-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Row Ghi nhớ & Quên mật khẩu */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="rememberMe"
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 border flex items-center justify-center transition-colors rounded-none ${
                    rememberMe
                      ? "bg-zinc-900 border-zinc-900"
                      : "border-zinc-200 group-hover:border-zinc-400 bg-transparent"
                  }`}
                >
                  <Check
                    className={`w-3 h-3 text-white stroke-[3] transition-opacity ${
                      rememberMe ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
                <span className="text-xs text-zinc-600 font-medium group-hover:text-zinc-900 transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full mt-4 h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.15em] transition-colors rounded-none flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ĐANG XỬ LÝ...</span>
                </>
              ) : (
                <span>ĐĂNG NHẬP</span>
              )}
            </button>
          </form>
        ) : (
          /* Tab OTP */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 text-sm bg-zinc-50 border border-zinc-200 hover:border-zinc-400 focus:border-zinc-900 text-zinc-900 outline-none rounded-none placeholder:text-zinc-400"
              />
            </div>

            <button
              type="button"
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-[0.15em] transition-colors rounded-none cursor-pointer"
              onClick={() => toast("Chức năng gửi OTP đang hoàn thiện!")}
            >
              GỬI MÃ OTP
            </button>
          </div>
        )}

        {/* 6. Footer Đăng ký ngay */}
        <div className="mt-8 text-center text-xs text-zinc-600 tracking-wide">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-zinc-900 font-bold hover:underline ml-1"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </>
  );
}
