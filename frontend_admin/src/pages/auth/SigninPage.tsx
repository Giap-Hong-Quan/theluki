import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { authService } from "../../service/auth";

export default function SigninPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      await authService.loginAdmin({ email: email.trim(), password });
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4 py-8">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950"></div>

      <div className="relative w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 text-white mb-2 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-zinc-300" />
          </div>
          <h1 className="text-2xl font-black tracking-[0.2em] uppercase font-mono text-white">
            THE LUKI
          </h1>
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
            Cổng Quản Trị Hệ Thống
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-in fade-in duration-200">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Email Quản Trị
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@theluki.vn"
                className="w-full h-11 pl-10 pr-4 bg-zinc-800/60 border border-zinc-700/80 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Mật Khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 bg-zinc-800/60 border border-zinc-700/80 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <span>ĐĂNG NHẬP ADMIN</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-zinc-500">
          Chỉ dành riêng cho Quản trị viên và Nhân viên có thẩm quyền.
        </p>
      </div>
    </div>
  );
}