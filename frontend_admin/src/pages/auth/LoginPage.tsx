import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { authService } from "../../service/authService";
import logoImg from "../../assets/image/logo.png";

interface JwtPayload {
  id?: string;
  role?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      const msg = "Vui lòng điền đầy đủ email và mật khẩu.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      const res = await authService.loginAdmin({ email: email.trim(), password });
      const token = res?.data?.accessToken || (res as any)?.data?.data?.accessToken;

      if (!token) {
        throw new Error("Không nhận được mã xác thực từ máy chủ.");
      }

      // Kiểm tra quyền role của tài khoản
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.role || "";
      if (role !== "admin" && role !== "staff") {
        throw new Error("Tài khoản của bạn không có quyền truy cập vào trang Quản trị.");
      }

      // Lưu accessToken vào localStorage
      localStorage.setItem("accessToken", token);

      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-100/70 text-zinc-900 px-4 py-12 font-sans">
      {/* Main Login Card */}
      <div className="relative w-full max-w-[440px] bg-white border border-zinc-200/90 p-8 sm:p-12 shadow-sm space-y-8 rounded-none">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5">
          <img
            src={logoImg}
            alt="THE LUKI Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <p className="text-xs text-zinc-500 font-normal tracking-wide">
            Cổng Quản Trị Hệ Thống
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium animate-in fade-in duration-200">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2 text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-800">
              EMAIL
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-11 px-3.5 bg-white border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 rounded-none focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2 text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-800">
              MẬT KHẨU
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-3.5 pr-10 bg-white border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 rounded-none focus:outline-none focus:border-zinc-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Extra options: Remember me & Note */}
          <div className="flex items-center justify-between text-xs text-zinc-600 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 rounded-none cursor-pointer"
              />
              <span className="text-[12px] text-zinc-600">Ghi nhớ đăng nhập</span>
            </label>

            <span className="text-[12px] text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer">
              Quên mật khẩu?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>ĐĂNG NHẬP</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-zinc-400 tracking-wide pt-2">
          Dành riêng cho Quản trị viên và Nhân viên THE LUKI
        </p>
      </div>
    </div>
  );
}