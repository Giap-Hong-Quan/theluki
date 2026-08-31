"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Drawer, ConfigProvider } from "antd";
import {
  Search,
  ArrowRight,
  History,
  X,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { POPULAR_PRICE_RANGES, PriceRangeTag } from "@/contants/navigation";
import { useProducts } from "@/hooks/useProduct";
import { formatPrice } from "@/utils/formatPrice";
import { IProduct } from "@/types/productType";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY_ITEMS = 5;

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRangeTag | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 1. Tải lịch sử tìm kiếm từ localStorage (tối đa 5 mục)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSearchHistory(parsed.slice(0, MAX_HISTORY_ITEMS));
          }
        }
      } catch (err) {
        console.error("Failed to load search history", err);
      }
    }
  }, [isOpen]);

  // 2. Debounce query để tránh gọi API liên tục khi đang gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 3. Kiểm tra xem có đang tìm kiếm (theo tên HOẶC theo giá HOẶC cả 2)
  const isFiltering = debouncedQuery !== "" || selectedPriceRange !== null;

  // 4. Gọi API tìm kiếm sản phẩm kết hợp COMBO Tên + Khoảng giá trực tiếp tại Modal
  const { data: searchResult, isLoading } = useProducts({
    search: debouncedQuery || undefined,
    minPrice: selectedPriceRange?.minPrice,
    maxPrice: selectedPriceRange?.maxPrice,
    sizePage: 5,
    isActive: true,
    isDeleted: false,
  });

  const products: IProduct[] = searchResult?.products || [];
  const totalFound: number = searchResult?.totalProduct || 0;

  // 5. Hàm lưu từ khóa vào lịch sử (Tối đa 5 mục gần nhất)
  const saveToHistory = (keyword: string) => {
    const clean = keyword.trim();
    if (!clean) return;

    try {
      const updated = [clean, ...searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      setSearchHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save search history", err);
    }
  };

  // 6. Xóa toàn bộ lịch sử tìm kiếm
  const handleClearAllHistory = () => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (err) {
      console.error("Failed to clear search history", err);
    }
  };

  // 7. Xóa 1 từ khóa cụ thể trong lịch sử
  const handleRemoveHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    try {
      const updated = searchHistory.filter((item) => item !== itemToRemove);
      setSearchHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to remove history item", err);
    }
  };

  // 8. Chuyển hướng sang trang sản phẩm với đầy đủ filter đang chọn
  const navigateToProductPage = () => {
    const params = new URLSearchParams();

    if (debouncedQuery) {
      params.set("search", debouncedQuery);
      saveToHistory(debouncedQuery);
    }

    if (selectedPriceRange?.minPrice !== undefined) {
      params.set("minPrice", selectedPriceRange.minPrice.toString());
    }

    if (selectedPriceRange?.maxPrice !== undefined) {
      params.set("maxPrice", selectedPriceRange.maxPrice.toString());
    }

    const queryStr = params.toString();
    router.push(`/product${queryStr ? `?${queryStr}` : ""}`);
    onClose();
  };

  // 9. Xử lý khi Submit form input
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isFiltering) {
      navigateToProductPage();
    }
  };

  // 10. Khi click chọn/bỏ chọn khoảng giá phổ biến (Lọc ngay trong Modal)
  const handleTogglePriceRange = (range: PriceRangeTag) => {
    if (selectedPriceRange?.label === range.label) {
      setSelectedPriceRange(null); // Bỏ chọn nếu bấm lại
    } else {
      setSelectedPriceRange(range);
    }
  };

  // 11. Khi click vào 1 từ khóa trong Lịch sử
  const handleHistoryClick = (item: string) => {
    setSearchQuery(item);
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
            <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-900 font-sans">
              TÌM KIẾM SẢN PHẨM
            </span>
          </div>
        }
        placement="right"
        size="default"
        styles={{ wrapper: { maxWidth: 440, width: "100%" } }}
        open={isOpen}
        onClose={onClose}
        className="[&_.ant-drawer-header]:!border-b [&_.ant-drawer-header]:!border-neutral-200 [&_.ant-drawer-body]:!p-4 sm:[&_.ant-drawer-body]:!p-5"
      >
        <div className="flex flex-col h-full space-y-4">
          {/* ================= 1. FORM INPUT TÌM KIẾM ================= */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center shrink-0">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập tên sản phẩm cần tìm..."
              className="w-full h-11 pl-3.5 pr-11 text-xs sm:text-sm bg-neutral-50 border border-neutral-300 focus:border-neutral-900 text-neutral-900 outline-none transition-colors rounded-none placeholder:text-neutral-400 font-sans"
            />
            {isLoading ? (
              <div className="absolute right-3.5 top-0 bottom-0 flex items-center justify-center text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
                title="Tìm kiếm"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* ================= 2. KHOẢNG GIÁ PHỔ BIẾN (LỌC TRỰC TIẾP TRONG MODAL) ================= */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 font-sans">
                <ArrowUpDown className="w-3 h-3" />
                <span>Khoảng giá phổ biến</span>
              </p>
              {selectedPriceRange && (
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange(null)}
                  className="text-[10px] uppercase font-bold text-[#A3663A] hover:underline cursor-pointer tracking-wider"
                >
                  Bỏ lọc giá
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {POPULAR_PRICE_RANGES.map((range, idx) => {
                const isSelected = selectedPriceRange?.label === range.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTogglePriceRange(range)}
                    className={`py-1.5 px-2 text-[11px] font-semibold border transition-all rounded-none cursor-pointer text-center font-mono ${
                      isSelected
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                        : "bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200"
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= 3. LỊCH SỬ TÌM KIẾM (HIỆN KHI CHƯA GÕ TỪ KHÓA) ================= */}
          {!debouncedQuery && searchHistory.length > 0 && (
            <div className="space-y-2 shrink-0 pt-1 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 font-sans">
                  <History className="w-3 h-3" />
                  <span>Lịch sử tìm kiếm</span>
                </p>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="text-[10px] text-[#A3663A] hover:underline cursor-pointer font-bold uppercase tracking-wider"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {searchHistory.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleHistoryClick(item)}
                    className="group inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-[11px] font-medium border border-neutral-200 hover:border-neutral-900 transition-colors rounded-none cursor-pointer"
                  >
                    <span className="truncate max-w-[140px]">{item}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveHistoryItem(e, item)}
                      className="text-neutral-400 hover:text-neutral-900 leading-none"
                      title="Xóa"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. HIỂN THỊ DANH SÁCH SẢN PHẨM TÌM ĐƯỢC (GỌN GÀNG, KHÔNG BỊ CAO) ================= */}
          {isFiltering && (
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 border-t border-neutral-100 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-1">
                <span>KẾT QUẢ PHÙ HỢP</span>
                <span className="font-mono">({totalFound} SẢN PHẨM)</span>
              </div>

              {isLoading ? (
                /* Skeleton Loading */
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-2.5 items-center p-1.5 bg-neutral-50 animate-pulse rounded-none">
                      <div className="w-11 h-14 bg-neutral-200 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-3/4 h-2.5 bg-neutral-200" />
                        <div className="w-1/3 h-2.5 bg-neutral-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                /* Danh sách sản phẩm gọn gàng, thanh mảnh */
                <div className="space-y-1.5 divide-y divide-neutral-100">
                  {products.map((prod) => (
                    <Link
                      key={prod._id}
                      href={`/product/${prod.slug}`}
                      onClick={() => {
                        if (debouncedQuery) saveToHistory(debouncedQuery);
                        onClose();
                      }}
                      className="group flex items-center gap-3 py-1.5 first:pt-0 hover:bg-neutral-50 px-1.5 transition-colors rounded-none"
                    >
                      {/* Ảnh sản phẩm gọn gàng tỷ lệ chuẩn 3:4 */}
                      <div className="relative w-11 h-14 bg-neutral-100 shrink-0 overflow-hidden border border-neutral-200 rounded-none">
                        {prod.thumbnail || (prod.images && prod.images[0]) ? (
                          <Image
                            src={prod.thumbnail || prod.images![0]}
                            alt={prod.name}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            sizes="44px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400">
                            No Img
                          </div>
                        )}
                      </div>

                      {/* Tên & Giá sản phẩm */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-[11px] sm:text-xs font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors uppercase tracking-tight line-clamp-1 leading-snug">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] sm:text-xs font-bold text-neutral-900 font-mono">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.original_price && prod.original_price > prod.price && (
                            <span className="text-[10px] text-neutral-400 line-through font-mono">
                              {formatPrice(prod.original_price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* NÚT XEM THÊM GỌN GÀNG VUÔNG VỨC */}
                  <div className="pt-3 pb-1 text-center">
                    <button
                      type="button"
                      onClick={navigateToProductPage}
                      className="w-full py-2.5 bg-white border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 text-[11px] font-bold uppercase tracking-[0.2em] transition-all rounded-none cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      XEM THÊM ({totalFound} SẢN PHẨM)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-neutral-400 text-xs font-mono border border-dashed border-neutral-200">
                  Không tìm thấy sản phẩm phù hợp.
                </div>
              )}
            </div>
          )}
        </div>
      </Drawer>
    </ConfigProvider>
  );
}
