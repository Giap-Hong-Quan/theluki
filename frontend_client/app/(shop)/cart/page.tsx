"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  X,
  Check,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import {
  useCart,
  useUpdateCartQuantity,
  useToggleSelectCartItem,
  useRemoveCartItem,
} from "@/hooks/useCart";
import { useProfile } from "@/hooks/useAuth";
import { formatPrice } from "@/utils/formatPrice";
import { ICartItem } from "@/types/cartType";
import CartSkeleton from "@/components/cart/CartSkeleton";

export default function CartPage() {
  const router = useRouter();
  const { data: profile, isLoading: isAuthLoading } = useProfile();
  const { data: cart, isLoading: isCartLoading } = useCart();

  const updateQuantityMutation = useUpdateCartQuantity();
  const toggleSelectMutation = useToggleSelectCartItem();
  const removeItemMutation = useRemoveCartItem();

  const items = cart?.items || [];
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // All selected status
  const isAllSelected = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((item) => item.isSelected);
  }, [items]);

  const selectedItems = useMemo(() => {
    return items.filter((item) => item.isSelected);
  }, [items]);

  const selectedCount = selectedItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const selectedTotalPrice = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [selectedItems]);

  const handleToggleSelectAll = () => {
    toggleSelectMutation.mutate({ selectAll: !isAllSelected });
  };

  const handleToggleItem = (itemId: string, currentStatus: boolean) => {
    toggleSelectMutation.mutate({ itemId, isSelected: !currentStatus });
  };

  const handleUpdateQuantity = (item: ICartItem, newQty: number) => {
    if (newQty < 1) return;
    updateQuantityMutation.mutate({ itemId: item._id, quantity: newQty });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate({ itemId });
  };

  // Loading state với Skeleton mượt mà
  if (isAuthLoading || isCartLoading) {
    return <CartSkeleton />;
  }

  // Guest state (not logged in)
  if (!profile) {
    return (
      <div className="py-16 md:py-24 max-w-xl mx-auto text-center px-4">
        <div className="border border-zinc-200 bg-white p-8 md:p-12 rounded-none">
          <div className="w-14 h-14 border border-zinc-200 bg-zinc-50 flex items-center justify-center mx-auto mb-6 text-zinc-700 rounded-none">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 uppercase mb-3">
            Giỏ hàng của bạn
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-light mb-8 leading-relaxed">
            Vui lòng đăng nhập tài khoản để xem và quản lý các sản phẩm trong giỏ hàng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none text-center"
            >
              Đăng nhập ngay
            </Link>
            <Link
              href="/product"
              className="w-full sm:w-auto px-8 py-3.5 border border-zinc-300 text-zinc-800 text-xs font-semibold tracking-widest uppercase hover:border-black transition-colors rounded-none text-center"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="py-12 md:py-20 max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.push("/product")}
            className="inline-flex items-center gap-2 border border-zinc-300 hover:border-black text-zinc-900 text-xs font-medium tracking-wider uppercase px-4 py-2.5 rounded-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </button>
        </div>

        <div className="border border-zinc-200 bg-zinc-50/60 p-10 md:p-16 text-center rounded-none">
          <div className="w-16 h-16 border border-zinc-200 bg-white flex items-center justify-center mx-auto mb-6 text-zinc-400 rounded-none">
            <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 uppercase mb-2">
            Giỏ hàng trống
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 font-light mb-8 max-w-md mx-auto leading-relaxed">
            Hiện tại bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các bộ sưu tập mới nhất từ The Luki!
          </p>
          <Link
            href="/product"
            className="inline-block px-8 py-3.5 bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 max-w-4xl mx-auto">
      {/* Top back button */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/product")}
          className="inline-flex items-center gap-2 border border-zinc-300 hover:border-black text-zinc-900 text-xs font-medium tracking-wider uppercase px-4 py-2.5 rounded-none transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Tiếp tục mua sắm
        </button>
      </div>

      {/* Heading */}
      <div className="mb-6 pb-4 border-b border-zinc-200">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 uppercase mb-1">
          Giỏ hàng
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 font-light">
          Có{" "}
          <span className="font-semibold text-zinc-900">
            {totalItemsCount}
          </span>{" "}
          sản phẩm trong giỏ hàng
        </p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const productObj: any =
            typeof item.product === "object" ? item.product : null;
          const productSlug = productObj?.slug || "";
          const productHref = productSlug ? `/product/${productSlug}` : "#";

          return (
            <div
              key={item._id}
              className="bg-zinc-50/70 hover:bg-zinc-50 border border-zinc-200 p-4 md:p-5 transition-colors relative rounded-none"
            >
              {/* Delete Button (top-right) */}
              <button
                type="button"
                onClick={() => handleRemoveItem(item._id)}
                aria-label="Xóa sản phẩm"
                className="absolute top-3.5 right-3.5 text-zinc-400 hover:text-black p-1 transition-colors rounded-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left group: Checkbox + Thumbnail + Details */}
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-8 md:pr-0">
                  {/* Square Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item._id, item.isSelected)}
                    className={`w-5 h-5 rounded-none flex items-center justify-center shrink-0 transition-colors border ${
                      item.isSelected
                        ? "bg-black border-black text-white"
                        : "border-zinc-300 hover:border-black bg-white"
                    }`}
                  >
                    {item.isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>

                  {/* Thumbnail */}
                  <Link
                    href={productHref}
                    className="relative w-18 h-18 md:w-22 md:h-22 rounded-none overflow-hidden bg-zinc-200 shrink-0 border border-zinc-200"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 72px, 88px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <ShoppingBag className="w-6 h-6 stroke-1" />
                      </div>
                    )}
                  </Link>

                  {/* Info: Name & Variant tags */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={productHref}
                      className="font-medium text-sm md:text-base text-zinc-900 hover:underline line-clamp-1 transition-colors block mb-1.5"
                    >
                      {item.name}
                    </Link>

                    {/* Variant dropdown tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                      {item.color && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-zinc-500 font-light text-xs">Màu sắc:</span>
                          <span className="inline-flex items-center gap-1 border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 rounded-none">
                            {item.color}
                            <ChevronDown className="w-3 h-3 text-zinc-400" />
                          </span>
                        </div>
                      )}

                      {item.size && (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-zinc-500 font-light text-xs">Size:</span>
                          <span className="inline-flex items-center gap-1 border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 rounded-none">
                            {item.size}
                            <ChevronDown className="w-3 h-3 text-zinc-400" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right group: Quantity Stepper + Price */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200">
                  {/* Square Quantity Stepper */}
                  <div className="inline-flex items-center border border-zinc-300 bg-white rounded-none">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        handleUpdateQuantity(item, item.quantity - 1)
                      }
                      className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-black disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors rounded-none"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-xs md:text-sm font-mono font-semibold text-zinc-900 border-x border-zinc-200">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateQuantity(item, item.quantity + 1)
                      }
                      className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-black transition-colors rounded-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[100px]">
                    <span className="font-mono font-bold text-sm md:text-base text-zinc-900 tracking-tight">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Select All Checkbox */}
      <div className="flex items-center justify-between py-3.5 px-1 mb-6 border-b border-zinc-200">
        <button
          type="button"
          onClick={handleToggleSelectAll}
          className="inline-flex items-center gap-2.5 text-xs md:text-sm font-medium text-zinc-900 cursor-pointer select-none"
        >
          <span
            className={`w-5 h-5 rounded-none flex items-center justify-center transition-colors border ${
              isAllSelected
                ? "bg-black border-black text-white"
                : "border-zinc-300 hover:border-black bg-white"
            }`}
          >
            {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </span>
          Chọn tất cả
        </button>

        {selectedCount > 0 && (
          <span className="text-xs md:text-sm text-zinc-500 font-light">
            Đã chọn <strong className="font-semibold text-zinc-900">{selectedCount}</strong> sản phẩm
          </span>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="space-y-3">
        {/* Choose more products button */}
        <Link
          href="/product"
          className="w-full block py-3.5 text-center text-xs font-semibold tracking-widest uppercase text-zinc-900 border border-zinc-300 hover:border-black rounded-none transition-colors bg-white"
        >
          Chọn thêm sản phẩm
        </Link>

        {/* Checkout button */}
        <Link
          href={selectedCount > 0 ? "/checkout" : "#"}
          onClick={(e) => {
            if (selectedCount === 0) {
              e.preventDefault();
            }
          }}
          className={`w-full py-4 text-center text-xs font-semibold tracking-widest uppercase rounded-none transition-colors flex items-center justify-center gap-2 ${
            selectedCount > 0
              ? "bg-black hover:bg-zinc-800 text-white cursor-pointer"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          <span>Thanh toán</span>
          {selectedCount > 0 && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="font-mono font-bold text-white tracking-normal text-sm">
                {formatPrice(selectedTotalPrice)}
              </span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}