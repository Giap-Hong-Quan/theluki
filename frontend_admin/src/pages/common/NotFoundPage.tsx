import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-[#faf9f6] text-black flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="max-w-md w-full bg-white border border-black p-8 sm:p-10 shadow-sm text-center space-y-6">
        {/* Mã lỗi */}
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Mã Lỗi Hệ Thống
          </span>
          <h1 className="font-mono text-7xl sm:text-8xl font-black tracking-tighter text-black">
            404
          </h1>
        </div>

        {/* Đường gạch phân cách */}
        <div className="h-[1px] w-16 bg-black mx-auto" />

        {/* Tiêu đề & mô tả */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
            Trang không tồn tại
          </h2>
          <p className="text-xs text-zinc-600 font-normal leading-relaxed">
            Đường dẫn bạn yêu cầu không tồn tại, đã bị xóa hoặc đã được di chuyển sang một liên kết khác.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 h-10 px-4 bg-white border border-black text-xs font-bold font-mono uppercase tracking-wider text-black rounded-none hover:bg-zinc-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 h-10 px-4 bg-black border border-black text-xs font-bold font-mono uppercase tracking-wider text-white rounded-none hover:bg-zinc-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>
        </div>
      </div>

      {/* Footer nhỏ */}
      <p className="mt-8 font-mono text-[11px] text-zinc-400 uppercase tracking-widest">
        THE LUKI ADMIN PORTAL
      </p>
    </div>
  );
}
