"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  Heart,
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollection";
import { useCategories } from "@/hooks/useCategory";
import SearchDrawer from "./SearchDrawer";
import CapybaraLoader from "@/src/components/common/CapybaraLoader";

interface DecodedToken {
  id?: string;
  role?: string;
  name?: string;
  email?: string;
}

// Danh sách các trang trong menu Giới thiệu
const INTRODUCE_LINKS = [
  { href: "/introduce/about-us", title: "About us" },
  { href: "/introduce/membership", title: "menbership" },
  { href: "/introduce/recruitment", title: "Tuyển dụng" },
  { href: "/introduce/faq", title: "faq" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();

  // Lấy danh sách bộ sưu tập từ Backend
  const { data: collections = [], isLoading: isCollectionsLoading } = useCollections({
    isActive: true,
    isDeleted: false,
  });

  // Lấy danh sách danh mục sản phẩm từ Backend
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories({
    isActive: true,
    isDeleted: false,
    sizePage: 0,
  });

  // State
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);
  const [cartCount, setCartCount] = useState<number>(1);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Đọc token từ Cookie
  useEffect(() => {
    function getCookie(name: string): string | null {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? decodeURIComponent(match[2]) : null;
    }

    const token = getCookie("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setCurrentUser(decoded);
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [pathname]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Overlay loader khi đang xử lý đăng xuất */}
      {logoutMutation.isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <CapybaraLoader />
          <p className="mt-4 text-sm font-semibold tracking-widest text-white uppercase animate-pulse">
            Đang đăng xuất...
          </p>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full bg-page/95 backdrop-blur-md border-b border-line transition-colors duration-200">
        {/* Container rộng thoáng, padding 2 bên cân đối */}
        <div className="max-w-[1550px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* ================= 1. TRÁI: LOGO ================= */}
            <div className="flex items-center gap-4">
              {/* Nút Mobile Menu */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-primary hover:text-secondary transition-colors"
                aria-label="Mở menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <Link href="/" className="inline-block">
                <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-primary uppercase font-mono select-none">
                  THE LUKI
                </span>
              </Link>
            </div>

            {/* ================= 2. GIỮA: NAVIGATION MENU (DESKTOP) ================= */}
            <nav className="hidden lg:flex items-center space-x-9 text-[15px] tracking-wide">
              {/* Trang chủ */}
              <Link
                href="/"
                className={`font-semibold transition-colors hover:text-primary ${
                  pathname === "/" ? "text-primary font-bold" : "text-secondary"
                }`}
              >
                Trang chủ
              </Link>

              {/* Collections */}
              <div
                className="relative group py-5"
                onMouseEnter={() => setActiveDropdown("collections")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href="/collection"
                  className={`flex items-center gap-1.5 font-semibold hover:text-primary transition-colors cursor-pointer ${
                    pathname.startsWith("/collection") ? "text-primary font-bold" : "text-secondary"
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div
                  className={`absolute left-0 top-full -mt-2 w-64 bg-card border border-line shadow-xl divide-y divide-line transition-all duration-200 ${
                    activeDropdown === "collections"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
                >
                  <Link
                    href="/collection"
                    className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-primary hover:bg-input transition-colors truncate"
                  >
                    Tất cả
                  </Link>

                  {isCollectionsLoading ? (
                    <div className="py-3.5 px-5 space-y-3">
                      <div className="h-4 bg-line animate-pulse"></div>
                      <div className="h-4 bg-line animate-pulse w-3/4"></div>
                    </div>
                  ) : collections && collections.length > 0 ? (
                    collections.map((col) => (
                      <Link
                        key={col._id}
                        href={`/collection/${col.slug}`}
                        className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-primary hover:bg-input transition-colors truncate"
                      >
                        {col.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-3.5 text-sm text-muted">
                      Chưa có bộ sưu tập
                    </p>
                  )}
                </div>
              </div>

              {/* Sản phẩm */}
              <div
                className="relative group py-5"
                onMouseEnter={() => setActiveDropdown("products")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href="/product"
                  className={`flex items-center gap-1.5 font-semibold hover:text-primary transition-colors cursor-pointer ${
                    pathname.startsWith("/product") ? "text-primary font-bold" : "text-secondary"
                  }`}
                >
                  <span>Sản phẩm</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div
                  className={`absolute left-0 top-full -mt-2 w-64 bg-card border border-line shadow-xl divide-y divide-line transition-all duration-200 ${
                    activeDropdown === "products"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
                >
                  <Link
                    href="/product"
                    className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-primary hover:bg-input transition-colors truncate"
                  >
                    Tất cả
                  </Link>

                  {isCategoriesLoading ? (
                    <div className="py-3.5 px-5 space-y-3">
                      <div className="h-4 bg-line animate-pulse"></div>
                      <div className="h-4 bg-line animate-pulse w-3/4"></div>
                    </div>
                  ) : categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={`/product/${cat.slug}`}
                        className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-primary hover:bg-input transition-colors truncate"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-3.5 text-sm text-muted">
                      Chưa có danh mục
                    </p>
                  )}
                </div>
              </div>

              {/* Sale */}
              <Link
                href="/sale"
                className="font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Sale
              </Link>

              {/* Giới thiệu */}
              <div
                className="relative group py-5"
                onMouseEnter={() => setActiveDropdown("about")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href="/introduce/about-us"
                  className={`flex items-center gap-1.5 font-semibold hover:text-primary transition-colors cursor-pointer ${
                    pathname.startsWith("/introduce") ? "text-primary font-bold" : "text-secondary"
                  }`}
                >
                  <span>Giới thiệu</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div
                  className={`absolute left-0 top-full -mt-2 w-64 bg-card border border-line shadow-xl divide-y divide-line transition-all duration-200 ${
                    activeDropdown === "about"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
                >
                  {INTRODUCE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-primary hover:bg-input transition-colors truncate"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* ================= 3. PHẢI: ACTIONS (SEARCH, CART, USER PILL) ================= */}
            <div className="flex items-center space-x-4 sm:space-x-5">
              {/* Nút Tìm kiếm (Mở Drawer bên phải) */}
              <button
                type="button"
                onClick={() => setIsSearchDrawerOpen(true)}
                className="p-1.5 text-secondary hover:text-primary transition-colors cursor-pointer"
                aria-label="Tìm kiếm"
                title="Tìm kiếm sản phẩm"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Nút Giỏ hàng cao cấp */}
              <Link
                href="/cart"
                className="relative p-1.5 text-secondary hover:text-primary transition-colors cursor-pointer block group"
                aria-label="Giỏ hàng"
              >
                <svg
                  className="w-5 h-5 stroke-current fill-none stroke-[1.75] transition-transform group-hover:scale-105"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 min-w-[16px] h-4 px-1 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center pointer-events-none shadow-sm font-mono">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Nút User Pill */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 h-9 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-sm border border-zinc-700 active:scale-[0.98]"
                  >
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                    <span className="max-w-[110px] truncate tracking-wide">
                      {currentUser.name || "Quan Giap"}
                    </span>
                  </button>

                  {/* Dropdown User Profile */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-line shadow-box p-2 space-y-1 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-line">
                        <p className="text-xs font-bold text-primary truncate">
                          {currentUser.name || "Quan Giap"}
                        </p>
                        <p className="text-[11px] text-muted truncate">
                          {currentUser.email || "quangiap@gmail.com"}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary hover:text-primary hover:bg-input transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Tài khoản của tôi</span>
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary hover:text-primary hover:bg-input transition-colors"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Đơn mua</span>
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary hover:text-primary hover:bg-input transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Sản phẩm yêu thích</span>
                      </Link>

                      {currentUser.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-indigo-500 hover:bg-input transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Trang Quản trị Admin</span>
                        </Link>
                      )}

                      <div className="pt-1 border-t border-line">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-wider rounded-full transition-all cursor-pointer border border-zinc-700 shadow-sm active:scale-[0.98]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>ĐĂNG NHẬP</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ================= 4. MOBILE MENU DRAWER ================= */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-line bg-card px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-secondary">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-primary py-1"
              >
                Trang chủ
              </Link>
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-primary py-1"
              >
                Collections
              </Link>
              <Link
                href="/product"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-primary py-1"
              >
                Sản phẩm
              </Link>
              <Link
                href="/sale"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-red-500 font-bold py-1"
              >
                Sale
              </Link>
              <Link
                href="/introduce/about-us"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-primary py-1"
              >
                Giới thiệu
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ================= 5. SEARCH DRAWER COMPONENT ================= */}
      <SearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={() => setIsSearchDrawerOpen(false)}
      />
    </>
  );
}