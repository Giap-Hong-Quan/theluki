"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer, ConfigProvider } from "antd";
import { TrendingUp, ArrowRight } from "lucide-react";

import { POPULAR_SEARCH_TAGS, FEATURED_SEARCH_CATEGORIES } from "@/contants/navigation";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const router = useRouter();
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
        token: {
          colorBgElevated: "#ffffff",
          colorText: "#09090b",
          colorBorder: "#e4e4e7",
          borderRadius: 0,
        },
      }}
    >
      <Drawer
        title={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
              TÌM KIẾM SẢN PHẨM
            </span>
          </div>
        }
        placement="right"
        size="default"
        styles={{ wrapper: { maxWidth: 420, width: "100%" } }}
        open={isOpen}
        onClose={onClose}
        className="[&_.ant-drawer-header]:!border-b [&_.ant-drawer-header]:!border-zinc-200 [&_.ant-drawer-body]:!p-6"
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
              className="w-full h-12 pl-4 pr-12 text-sm bg-zinc-50 border border-zinc-200 focus:border-zinc-900 text-zinc-900 outline-none transition-colors rounded-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Tìm kiếm"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Gợi ý từ khóa tìm kiếm phổ biến */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tìm kiếm phổ biến</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-xs transition-colors rounded-none cursor-pointer border border-zinc-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Danh mục nổi bật */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Danh mục nổi bật
            </p>
            <div className="space-y-2 text-xs font-medium text-zinc-600">
              {FEATURED_SEARCH_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-3 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <span>{cat.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </ConfigProvider>
  );
}
