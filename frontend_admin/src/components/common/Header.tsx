import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { SIDEBAR_MENU } from "../../constants/navigation";

const Header: React.FC = () => {
  const location = useLocation();

  // Tìm kiếm group và item tương ứng từ SIDEBAR_MENU dựa vào pathname
  let groupTitle = "";
  let pageTitle = "";

  for (const group of SIDEBAR_MENU) {
    const matchedItem = group.items.find((item) => {
      if (item.exact) return location.pathname === item.path;
      return location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
    });

    if (matchedItem) {
      groupTitle = group.groupTitle;
      pageTitle = matchedItem.title;
      break;
    }
  }

  return (
    <header className="h-16 min-h-16 bg-[#f2f1ee] border-b border-[#dedbd5] px-6 flex items-center justify-between select-none text-zinc-800 rounded-none">
      {/* 1. Breadcrumb dạng Steps Chevron Ribbon mũi tên */}
      <nav aria-label="Breadcrumb" className="flex items-center drop-shadow-2xs">
        {/* Step 1: Nhóm danh mục cha (Nền trắng viền xám) */}
        <div
          className="h-8 px-3 pr-6 bg-white border-y border-l border-[#d4d1c9] text-zinc-700 text-xs font-semibold uppercase tracking-wider flex items-center"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
          }}
        >
          {groupTitle}
        </div>

        {/* Step 2: Trang hiện tại (Nền đen mũi tên chữ trắng) */}
        <div
          className="-ml-2.5 h-8 pl-5 pr-6 bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)",
          }}
        >
          {pageTitle}
        </div>
      </nav>

      {/* 2. Các nút chức năng bên phải */}
      <div className="flex items-center gap-2.5">
        {/* Ô tìm kiếm */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Tìm đơn hàng, sản phẩm, khách hàng... (⌘K)"
            className="w-72 sm:w-80 h-9 pl-3 pr-8 bg-white border border-[#c8c5be] text-xs text-zinc-900 placeholder:text-[#9e9a91] rounded-none focus:outline-none focus:border-zinc-900 transition-colors shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 text-[#9e9a91] pointer-events-none" />
        </div>

        {/* Nút thông báo */}
        <button
          type="button"
          className="h-9 px-3 bg-white border border-[#c8c5be] text-xs flex items-center gap-1.5 text-zinc-800 hover:bg-zinc-50 transition-colors rounded-none cursor-pointer shadow-2xs"
          title="Thông báo hệ thống"
        >
          <Bell className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-mono font-bold text-xs">7</span>
        </button>

        {/* Khối thông tin tài khoản đăng nhập */}
        <div className="h-9 px-3 bg-white border border-[#c8c5be] flex items-center gap-2.5 rounded-none cursor-pointer hover:bg-zinc-50 transition-colors shadow-2xs">
          {/* Avatar vuông */}
          <div className="w-6 h-6 bg-[#b84a26] text-white flex items-center justify-center font-bold text-[10px] tracking-wider rounded-none shrink-0 shadow-inner">
            TL
          </div>
          {/* Tên & Role */}
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-zinc-900">Trần Lâm</span>
            <span className="text-[9px] font-mono tracking-wider text-[#8a857b] uppercase mt-0.5">
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
