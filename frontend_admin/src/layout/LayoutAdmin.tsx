import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Layers,
  ShoppingBag,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { authService } from "../service/auth";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    title: "Tổng quan (Dashboard)",
    path: "/",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Quản lý Sản phẩm",
    path: "/products",
    icon: <Shirt className="w-5 h-5" />,
  },
  {
    title: "Quản lý Danh mục",
    path: "/categories",
    icon: <FolderTree className="w-5 h-5" />,
  },
  {
    title: "Quản lý Bộ sưu tập",
    path: "/collections",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    title: "Quản lý Đơn hàng",
    path: "/orders",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    title: "Quản lý Người dùng",
    path: "/users",
    icon: <Users className="w-5 h-5" />,
  },
];

export default function LayoutAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Lấy thông tin admin từ localStorage
  const adminUser = (() => {
    try {
      const raw = localStorage.getItem("admin_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = async () => {
    await authService.logoutAdmin();
    navigate("/signin");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`flex flex-col border-r border-zinc-800 bg-zinc-900/90 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-black tracking-[0.2em] text-white font-mono uppercase">
                THE LUKI
              </span>
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 font-semibold rounded">
                Admin
              </span>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mx-auto"
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? item.title : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout at Bottom */}
        <div className="p-3 border-t border-zinc-800">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-800/50 border border-zinc-800 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-200 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">
                  {adminUser?.name || "Admin"}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {adminUser?.email || "admin@theluki.vn"}
                </p>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-950">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-semibold text-zinc-200">
              Cổng Quản Trị Hệ Thống
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Máy chủ Backend Online
            </span>
          </div>
        </header>

        {/* Body Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
