"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useLogout, useProfile } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollection";
import { useCategories } from "@/hooks/useCategory";
import { USER_MENU_ITEMS, INTRODUCE_LINKS } from "@/contants/navigation";
import SearchDrawer from "./SearchDrawer";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: userProfile } = useProfile();

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
  const [cartCount, setCartCount] = useState<number>(1);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-colors duration-200">
        {/* Container rộng thoáng, padding 2 bên cân đối */}
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* ================= 1. TRÁI: LOGO ================= */}
            <div className="flex items-center gap-4">
              {/* Nút Mobile Menu */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-900 hover:text-zinc-600 transition-colors"
                aria-label="Mở menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <Link href="/" className="inline-flex items-center">
                <img
                  src="/logo.png"
                  alt="THE LUKI Logo"
                  className="h-8 sm:h-9 w-auto object-contain select-none"
                />
              </Link>
            </div>

            {/* ================= 2. GIỮA: NAVIGATION MENU (DESKTOP) ================= */}
            <nav className="hidden lg:flex items-center space-x-9 text-[14px] tracking-wide">
              {/* Trang chủ */}
              <Link
                href="/"
                className={`font-semibold transition-colors hover:text-zinc-900 ${pathname === "/" ? "text-zinc-900 font-bold" : "text-zinc-600"
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
                  className={`flex items-center gap-1.5 font-semibold hover:text-zinc-900 transition-colors cursor-pointer ${pathname.startsWith("/collection") ? "text-zinc-900 font-bold" : "text-zinc-600"
                    }`}
                >
                  <span>Bộ sưu tập</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div
                  className={`absolute left-0 top-full -mt-2 w-64 bg-white border border-zinc-200 shadow-xl divide-y divide-zinc-100 transition-all duration-200 ${activeDropdown === "collections"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                    }`}
                >
                  <Link
                    href="/collection"
                    className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 transition-colors truncate"
                  >
                    Tất cả
                  </Link>

                  {isCollectionsLoading ? (
                    <div className="py-3.5 px-5 space-y-3">
                      <div className="h-4 bg-zinc-200 animate-pulse"></div>
                      <div className="h-4 bg-zinc-200 animate-pulse w-3/4"></div>
                    </div>
                  ) : collections && collections.length > 0 ? (
                    collections.map((col) => (
                      <Link
                        key={col._id}
                        href={`/collection/${col.slug}`}
                        className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 transition-colors truncate"
                      >
                        {col.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-3.5 text-sm text-zinc-400">
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
                  className={`flex items-center gap-1.5 font-semibold hover:text-zinc-900 transition-colors cursor-pointer ${pathname.startsWith("/product") ? "text-zinc-900 font-bold" : "text-zinc-600"
                    }`}
                >
                  <span>Sản phẩm</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div
                  className={`absolute left-0 top-full -mt-2 w-64 bg-white border border-zinc-200 shadow-xl divide-y divide-zinc-100 transition-all duration-200 ${activeDropdown === "products"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                    }`}
                >
                  <Link
                    href="/product"
                    className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 transition-colors truncate"
                  >
                    Tất cả
                  </Link>

                  {isCategoriesLoading ? (
                    <div className="py-3.5 px-5 space-y-3">
                      <div className="h-4 bg-zinc-200 animate-pulse"></div>
                      <div className="h-4 bg-zinc-200 animate-pulse w-3/4"></div>
                    </div>
                  ) : categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={`/product?category=${cat.slug}`}
                        className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 transition-colors truncate"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-3.5 text-sm text-zinc-400">
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
                  className={`flex items-center gap-1.5 font-semibold hover:text-zinc-900 transition-colors cursor-pointer ${pathname.startsWith("/introduce") ? "text-zinc-900 font-bold" : "text-zinc-600"
                    }`}
                >
                  <span>Giới thiệu</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div
                  className={`absolute left-0 top-full -mt-2 w-64 bg-white border border-zinc-200 shadow-xl divide-y divide-zinc-100 transition-all duration-200 ${activeDropdown === "about"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2 pointer-events-none"
                    }`}
                >
                  {INTRODUCE_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-3.5 text-sm font-medium uppercase tracking-wider text-zinc-900 hover:bg-zinc-50 transition-colors truncate"
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
                className="p-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Tìm kiếm"
                title="Tìm kiếm sản phẩm"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Nút Giỏ hàng */}
              <Link
                href="/cart"
                className="relative p-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer block group"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8] transition-transform group-hover:scale-105" />

                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 min-w-[16px] h-4 px-1 bg-red-600 text-white font-bold text-[10px] rounded-none flex items-center justify-center pointer-events-none shadow-sm font-mono">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Nút User Pill (Vuông vức, sắc sảo) */}
              {userProfile ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 h-9 px-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-none transition-all cursor-pointer shadow-sm border border-zinc-700 active:scale-[0.98]"
                  >
                    <div className="w-5 h-5 rounded-none bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {userProfile.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt={userProfile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5 text-zinc-300" />
                      )}
                    </div>
                    <span className="max-w-[110px] truncate tracking-wider uppercase text-[11px] font-bold">
                      {userProfile.full_name || userProfile.email?.split("@")[0] || "Tài khoản"}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {/* Dropdown User Profile (Style đồng bộ 100% với Collections / Sản phẩm) */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 shadow-xl divide-y divide-zinc-200 z-50 rounded-none animate-in fade-in-50 zoom-in-95 duration-150">
                      {USER_MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3.5 px-5 py-3.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-zinc-600 stroke-[1.8] shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}

                      {/* Nút Đăng xuất */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 stroke-[1.8] shrink-0" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-none transition-all cursor-pointer border border-zinc-900 shadow-sm active:scale-[0.98]"
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
          <div className="lg:hidden border-t border-zinc-200 bg-white px-5 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-zinc-600">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-zinc-900 py-1"
              >
                Trang chủ
              </Link>
              <Link
                href="/collection"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-zinc-900 py-1"
              >
                Bộ sưu tập
              </Link>
              <Link
                href="/product"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-zinc-900 py-1"
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
                className="hover:text-zinc-900 py-1"
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