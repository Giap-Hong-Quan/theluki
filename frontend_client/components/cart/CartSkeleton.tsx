import React from "react";

export default function CartSkeleton() {
  return (
    <div className="py-8 md:py-12 max-w-4xl mx-auto animate-pulse">
      {/* Nút quay lại mua sắm */}
      <div className="mb-6">
        <div className="h-9 w-36 bg-zinc-200" />
      </div>

      {/* Tiêu đề trang */}
      <div className="mb-6 pb-4 border-b border-zinc-200">
        <div className="h-8 w-40 bg-zinc-200 mb-2" />
        <div className="h-4 w-52 bg-zinc-100" />
      </div>

      {/* Danh sách sản phẩm Skeleton */}
      <div className="space-y-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-zinc-50 border border-zinc-200 p-4 md:p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Nhóm bên trái: Checkbox + Ảnh + Thông tin */}
              <div className="flex items-center gap-3 md:gap-4 flex-1">
                {/* Checkbox */}
                <div className="w-5 h-5 bg-zinc-200 shrink-0" />

                {/* Thumbnail */}
                <div className="w-18 h-18 md:w-22 md:h-22 bg-zinc-200 shrink-0" />

                {/* Info */}
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-3/4 max-w-[240px] bg-zinc-200" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-zinc-200" />
                    <div className="h-5 w-14 bg-zinc-200" />
                  </div>
                </div>
              </div>

              {/* Nhóm bên phải: Stepper số lượng + Giá */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200">
                {/* Stepper */}
                <div className="w-24 h-7 bg-zinc-200" />

                {/* Price */}
                <div className="h-5 w-20 bg-zinc-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chọn tất cả Skeleton */}
      <div className="flex items-center justify-between py-3.5 px-1 mb-6 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-zinc-200" />
          <div className="h-4 w-20 bg-zinc-200" />
        </div>
        <div className="h-4 w-28 bg-zinc-100" />
      </div>

      {/* 2 nút hành động dưới cùng */}
      <div className="space-y-3">
        <div className="h-11 w-full bg-zinc-200" />
        <div className="h-12 w-full bg-zinc-300" />
      </div>
    </div>
  );
}
