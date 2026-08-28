import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="w-full flex flex-col bg-white border border-zinc-200 animate-pulse">
      {/* 1. Khối ảnh sản phẩm hình vuông 1:1 */}
      <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
        {/* Placeholder cho tag góc trái */}
        <div className="absolute top-0 left-0 w-12 h-5 bg-zinc-200" />
        {/* Placeholder cho nút wishlist góc phải */}
        <div className="absolute top-0 right-0 w-7 h-7 bg-zinc-200 border-b border-l border-zinc-200" />
      </div>

      {/* 2. Phần thông tin & nút */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          {/* Tên sản phẩm */}
          <div className="h-4 bg-zinc-200 w-4/5 rounded-none" />
          {/* Giá tiền */}
          <div className="h-5 bg-zinc-200 w-2/5 rounded-none" />
        </div>

        {/* 2 Nút hành động */}
        <div className="flex flex-col gap-2 pt-1 w-full">
          <div className="w-full h-9 bg-zinc-300 rounded-none" />
          <div className="w-full h-9 bg-zinc-100 border border-zinc-200 rounded-none" />
        </div>
      </div>
    </div>
  );
}
