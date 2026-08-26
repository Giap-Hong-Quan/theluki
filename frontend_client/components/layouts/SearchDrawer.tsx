"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer, ConfigProvider, theme as antdTheme } from "antd";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const router = useRouter();
  const { theme } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    router.push(`/product?search=${encodeURIComponent(tag)}`);
    onClose();
    setSearchQuery("");
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorBgElevated: theme === "dark" ? "#09090b" : "#ffffff",
          colorText: theme === "dark" ? "#f4f4f5" : "#09090b",
          colorBorder: theme === "dark" ? "#27272a" : "#e4e4e7",
          borderRadius: 0,
        },
      }}
    >
      <Drawer
        title={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              TÌM KIẾM SẢN PHẨM
            </span>
          </div>
        }
        placement="right"
        size="default"
        styles={{ wrapper: { maxWidth: 420, width: "100%" } }}
        open={isOpen}
        onClose={onClose}
        className="[&_.ant-drawer-header]:!border-b [&_.ant-drawer-header]:!border-line [&_.ant-drawer-body]:!p-6"
      >
        <div className="space-y-6">
          {/* Form Input Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên sản phẩm cần tìm..."
              className="w-full h-12 pl-4 pr-12 text-sm bg-input border border-line focus:border-line-focus text-primary outline-none transition-colors rounded-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Tìm kiếm"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Gợi ý từ khóa tìm kiếm phổ biến */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tìm kiếm phổ biến</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Áo thun basic",
                "Áo sơ mi lụa",
                "Quần jean ống rộng",
                "Chân váy chữ A",
                "Summer 2026",
                "Áo khoác Blazer",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 bg-input hover:bg-line text-secondary hover:text-primary text-xs transition-colors rounded-none cursor-pointer border border-line"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Danh mục nổi bật */}
          <div className="pt-4 border-t border-line space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Danh mục nổi bật
            </p>
            <div className="space-y-2 text-xs font-medium text-secondary">
              <Link
                href="/product/ao"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 hover:bg-input hover:text-primary transition-colors"
              >
                <span>Áo nữ THE LUKI</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>
              <Link
                href="/product/quan"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 hover:bg-input hover:text-primary transition-colors"
              >
                <span>Quần thời trang</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>
              <Link
                href="/product/dam-vay"
                onClick={onClose}
                className="flex items-center justify-between py-2 px-3 hover:bg-input hover:text-primary transition-colors"
              >
                <span>Đầm & Váy thiết kế</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </Drawer>
    </ConfigProvider>
  );
}
