"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { IProduct } from "@/types/productType";
import { formatPrice } from "@/utils/formatPrice";
import { useToggleWishlist, useIsFavorite } from "@/hooks/useWishList";

interface ProductCardProps {
  product?: Partial<IProduct> & {
    image?: string;
    tag?: string;
  };
}

export default function ProductCard({ product: propProduct }: ProductCardProps) {
  const productId = propProduct?._id;
  const isFavorite = useIsFavorite(productId);
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  // Dữ liệu mẫu (hoặc lấy từ props)
  const product = {
    _id: propProduct?._id || "1",
    name: propProduct?.name || "Áo khoác dạ oversize LUKI 01",
    slug: propProduct?.slug || "ao-khoac-da-oversize-luki-01",
    price: propProduct?.price ?? 1890000,
    original_price: propProduct?.original_price,
    image:
      propProduct?.thumbnail ||
      propProduct?.image ||
      "https://theciu.vn/_next/image?url=https%3A%2F%2Fminio.theciu.vn%2Ftheciu-beta%2F350%2Fimages%2Fj5Ujcr9cQrxFp0Hz2X7nhA6q4fP9bhng956A5ykD.png%3Fv%3D58151&w=1920&q=75",
    tag: propProduct?.tag || "MỚI",
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (productId) {
      toggleWishlist(productId);
    }
  };

  return (
    <div className="w-full flex flex-col bg-white border border-zinc-600 group transition-all">
      {/* 1. KHỐI ẢNH SẢN PHẨM (HÌNH VUÔNG 1:1) */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f3f2ef]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Tag ở góc trên bên trái: MỚI, -22%, BÁN CHẠY, LIMITED */}
        {product.tag && (
          <span className="absolute top-0 left-0 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 font-mono select-none">
            {product.tag}
          </span>
        )}

        {/* Nút Trái tim Wishlist ở góc trên bên phải */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={isPending}
          className="absolute top-0 right-0 w-7 h-7 sm:w-7 sm:h-7 bg-white border border-black flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-50 active:scale-90 disabled:opacity-50"
          title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-black hover:text-red-500"
            }`}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* 2. THÔNG TIN & NÚT MUA HÀNG */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Tên sản phẩm */}
          <Link
            href={`/product/${product.slug}`}
            className="block text-xs truncate sm:text-sm font-medium text-zinc-900 hover:text-[#A3663A] line-clamp-1 transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Giá tiền */}
          <p className="text-sm sm:text-base font-bold text-zinc-900">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Cụm 2 nút xếp dọc: Mua ngay (trên) & Thêm vào giỏ (dưới) - Style vuông vức */}
        <div className="flex flex-col gap-2 pt-1 w-full text-[11px] font-bold uppercase tracking-wider font-mono">
          <button
            type="button"
            className="w-full py-2.5 px-3 bg-black hover:bg-zinc-800 text-white transition-colors cursor-pointer text-center rounded-none"
          >
            Mua ngay
          </button>
          <button
            type="button"
            className="w-full py-2.5 px-3 bg-white border border-black text-black hover:bg-zinc-100 transition-colors cursor-pointer text-center rounded-none"
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
