"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowUpDown, X } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

interface ProductFilterBarProps {
  totalProducts?: number;
}

interface PriceFilterFormValues {
  minPrice: string;
  maxPrice: string;
}

export default function ProductFilterBar({ totalProducts = 0 }: ProductFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // Khởi tạo React Hook Form
  const { register, handleSubmit, reset } = useForm<PriceFilterFormValues>({
    defaultValues: {
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
    },
  });

  // Tự động đồng bộ form khi tham số URL thay đổi (Back / Forward / Reset)
  useEffect(() => {
    reset({
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    });
  }, [searchParams, reset]);

  // Xử lý Submit lọc giá với React Hook Form
  const onSubmit = (data: PriceFilterFormValues) => {
    const params = new URLSearchParams(searchParams.toString());

    const numMin = data.minPrice.trim() !== "" ? Number(data.minPrice.replace(/\D/g, "")) : NaN;
    const numMax = data.maxPrice.trim() !== "" ? Number(data.maxPrice.replace(/\D/g, "")) : NaN;

    if (!isNaN(numMin) && numMin >= 0) {
      params.set("minPrice", numMin.toString());
    } else {
      params.delete("minPrice");
    }

    if (!isNaN(numMax) && numMax >= 0) {
      params.set("maxPrice", numMax.toString());
    } else {
      params.delete("maxPrice");
    }

    params.delete("page"); // Reset về trang 1 khi lọc

    const queryString = params.toString();
    router.push(`/product${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Xử lý xóa lọc giá
  const handleClearPriceFilter = () => {
    reset({ minPrice: "", maxPrice: "" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    const queryString = params.toString();
    router.push(`/product${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Kiểm tra xem có đang lọc giá thực tế hay không
  const hasPriceFilter = currentMinPrice !== "" || currentMaxPrice !== "";
  const filterLabel = hasPriceFilter
    ? `${currentMinPrice ? formatPrice(Number(currentMinPrice)) : "0₫"} — ${
        currentMaxPrice ? formatPrice(Number(currentMaxPrice)) : "Tối đa"
      }`
    : "";

  return (
    <div className="w-full flex flex-col">
      {/* 1. HÀNG NHẬP KHOẢNG GIÁ & SỐ LƯỢNG SẢN PHẨM */}
      <div className="w-full border-b border-zinc-200 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-wrap items-center gap-3 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-1.5 text-zinc-900 font-semibold whitespace-nowrap">
            <ArrowUpDown className="w-4 h-4 text-zinc-600" />
            <span>Khoảng giá</span>
          </div>

          {/* Input Giá thấp nhất - React Hook Form */}
          <input
            type="text"
            inputMode="numeric"
            placeholder="Giá thấp nhất"
            {...register("minPrice")}
            className="w-36 sm:w-44 px-3.5 py-2 bg-white border border-zinc-300 focus:border-zinc-900 focus:outline-none rounded-none text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 font-mono transition-colors"
          />

          <span className="text-zinc-400 font-medium">—</span>

          {/* Input Giá cao nhất - React Hook Form */}
          <input
            type="text"
            inputMode="numeric"
            placeholder="Giá cao nhất"
            {...register("maxPrice")}
            className="w-36 sm:w-44 px-3.5 py-2 bg-white border border-zinc-300 focus:border-zinc-900 focus:outline-none rounded-none text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 font-mono transition-colors"
          />

          <span className="text-zinc-500 font-mono text-xs font-medium">VNĐ</span>

          {/* Nút Áp dụng */}
          <button
            type="submit"
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-none transition-colors cursor-pointer"
          >
            Áp dụng
          </button>
        </form>

        {/* Tổng số lượng sản phẩm */}
        <div className="text-xs sm:text-sm font-mono tracking-wider text-zinc-500 whitespace-nowrap uppercase">
          {totalProducts} SẢN PHẨM
        </div>
      </div>

      {/* 2. HÀNG HIỂN THỊ TRẠNG THÁI "ĐANG LỌC" (CHỈ HIỆN KHI NGƯỜI DÙNG CÓ LỌC GIÁ) */}
      {hasPriceFilter && (
        <div className="w-full flex items-center justify-between py-2.5 text-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 font-mono">
              ĐANG LỌC:
            </span>

            {/* Tag khoảng giá đang lọc */}
            <div className="flex items-center gap-1.5 border border-zinc-900 bg-white px-2.5 py-1 text-[10px] sm:text-[11px] text-zinc-900 font-mono rounded-none shadow-sm">
              <span>{filterLabel}</span>
              <button
                type="button"
                onClick={handleClearPriceFilter}
                className="text-zinc-400 hover:text-zinc-900 cursor-pointer ml-1 leading-none flex items-center"
                title="Xóa lọc giá"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Nút Xoá tất cả bên phải */}
          <button
            type="button"
            onClick={handleClearPriceFilter}
            className="text-[10px] sm:text-[11px] text-[#A3663A] hover:underline cursor-pointer font-medium whitespace-nowrap uppercase tracking-wider"
          >
            Xoá tất cả
          </button>
        </div>
      )}
    </div>
  );
}
