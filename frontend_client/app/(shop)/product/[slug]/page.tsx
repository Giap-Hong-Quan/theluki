"use client";

import React, { use, useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {Heart,ShoppingBag,Check,Copy,Ruler,Truck,ShieldCheck,RotateCcw,Share2,ChevronDown,ChevronUp,Minus,Plus,ChevronLeft,ChevronRight,Info,X,Sparkles,ArrowRight,Eye,Layers} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { useProductBySlug, useProductsByCategorySlug, useProducts } from "@/hooks/useProduct";
import { useIsFavorite, useToggleWishlist } from "@/hooks/useWishList";
import { useAddToCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import copyToClipboard from "@/utils/copyText";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function ProductDetailContent({ slug }: { slug: string }) {
  const router = useRouter();

  // 1. Fetch chi tiết sản phẩm theo slug
  const { data: product, isLoading, isError } = useProductBySlug(slug);

  // 2. State quản lý Biến thể, Size, Ảnh, Số lượng
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);

  // Accordion toggle states
  const [openAccordions, setOpenAccordions] = useState<{
    desc: boolean;
    specs: boolean;
    shipping: boolean;
  }>({
    desc: true,
    specs: true,
    shipping: false,
  });

  const toggleAccordion = (key: "desc" | "specs" | "shipping") => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Wishlist & Cart hooks
  const isFavorite = useIsFavorite(product?._id);
  const { mutate: toggleWishlist, isPending: isWishlistPending } = useToggleWishlist();
  const { mutate: addToCart, isPending: isCartPending } = useAddToCart();

  // 3. Tập hợp toàn bộ danh sách ảnh Gallery + Biến thể (deduplicated)
  const allImages = useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();

    if (product.thumbnail) set.add(product.thumbnail);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => img && set.add(img));
    }
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => v.image && set.add(v.image));
    }

    return Array.from(set).filter(Boolean);
  }, [product]);

  // Cập nhật ảnh mặc định & size mặc định khi product load xong
  useEffect(() => {
    if (product) {
      if (allImages.length > 0) {
        setSelectedImage(allImages[0]);
      }
      if (product.variants && product.variants.length > 0) {
        setSelectedVariantIndex(0);
        const firstVariantSizes = product.variants[0].sizes || [];
        const firstAvailable =
          firstVariantSizes.find((s) => s.stock > 0) || firstVariantSizes[0];
        if (firstAvailable) {
          setSelectedSize(firstAvailable.size);
        }
      }
    }
  }, [product, allImages]);

  // Variant hiện tại
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants[selectedVariantIndex] || product.variants[0];
  }, [product, selectedVariantIndex]);

  // Danh sách size của variant hiện tại
  const currentSizes = useMemo(() => {
    return currentVariant?.sizes || [];
  }, [currentVariant]);

  // Tồn kho của size đang chọn
  const currentStock = useMemo(() => {
    if (currentSizes.length > 0 && selectedSize) {
      const found = currentSizes.find((s) => s.size === selectedSize);
      return found ? found.stock : 0;
    }
    return product?.stock ?? 0;
  }, [currentSizes, selectedSize, product]);
  const isOutOfStock = currentStock <= 0;

  // Khi người dùng bấm đổi màu
  const handleSelectVariant = (index: number) => {
    setSelectedVariantIndex(index);
    const newVariant = product?.variants?.[index];
    if (newVariant?.image) {
      setSelectedImage(newVariant.image);
    }
    // Tự động chọn size khả dụng trong màu mới
    const sizes = newVariant?.sizes || [];
    const exists = sizes.find((s) => s.size === selectedSize && s.stock > 0);
    if (exists) {
      // Giữ nguyên size nếu còn hàng
    } else {
      const firstAvailable = sizes.find((s) => s.stock > 0) || sizes[0];
      if (firstAvailable) {
        setSelectedSize(firstAvailable.size);
      }
    }
    setQuantity(1);
  };

  // Lấy sản phẩm gợi ý / cùng danh mục
  const categorySlug =
    typeof product?.category === "object" ? product.category.slug : undefined;
  const { data: relatedProductsData } = useProductsByCategorySlug(
    categorySlug || "",
    { sizePage: 8 }
  );

  const relatedProducts = useMemo(() => {
    const list = Array.isArray(relatedProductsData) ? relatedProductsData : [];
    return list.filter((p) => p._id !== product?._id).slice(0, 4);
  }, [relatedProductsData, product]);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (redirectAfterAdd = false) => {
    if (!product) return;

    if (isOutOfStock) {
      toast.error("Kích thước này hiện đã hết hàng, vui lòng chọn size khác!");
      return;
    }

    if (currentSizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn kích thước (Size) trước khi thêm vào giỏ!");
      return;
    }

    const selectedSizeObj = (currentVariant?.sizes as any)?.find(
      (s: any) => s.size === selectedSize
    );
    const variantId = (currentVariant as any)?._id;
    const sizeId = selectedSizeObj?._id;

    addToCart(
      {
        productId: product._id,
        variantId,
        sizeId,
        quantity,
      },
      {
        onSuccess: () => {
          if (redirectAfterAdd) {
            router.push("/cart");
          }
        },
      }
    );
  };

  // Sao chép SKU
  const handleCopySku = () => {
    if (product?.sku) {
      copyToClipboard(product.sku, "Đã sao chép mã SKU!");
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  // Chia sẻ sản phẩm
  const handleShare = () => {
    if (typeof window !== "undefined") {
      copyToClipboard(window.location.href, "Đã sao chép liên kết sản phẩm!");
    }
  };

  // ==================== LOADING SKELETON ====================
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse font-sans">
        <div className="h-4 bg-neutral-200 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full aspect-[4/5] bg-neutral-200 border border-neutral-300" />
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-square bg-neutral-200 border border-neutral-300" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 bg-neutral-200 w-32" />
            <div className="h-10 bg-neutral-200 w-full" />
            <div className="h-8 bg-neutral-200 w-48" />
            <div className="h-20 bg-neutral-200 w-full" />
            <div className="h-12 bg-neutral-200 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ==================== ERROR / NOT FOUND ====================
  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 font-sans">
        <div className="w-16 h-16 border-2 border-black mx-auto flex items-center justify-center bg-white shadow-2xs">
          <ShoppingBag className="w-8 h-8 text-neutral-800" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-950">
            KHÔNG TÌM THẤY SẢN PHẨM
          </h1>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            Sản phẩm có thể đã ngừng bán, bị gỡ bỏ hoặc đường dẫn không chính xác ({slug}).
          </p>
        </div>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            Về Trang Chủ
          </Link>
          <Link
            href="/product"
            className="px-6 py-3 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-100 transition-colors"
          >
            Khám Phá Cửa Hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-neutral-900 pb-20 font-sans">
      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="border-b border-neutral-200 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/product" },
              ...(typeof product.category === "object" && product.category
                ? [
                    {
                      label: product.category.name,
                      href: `/product?category=${product.category.slug}`,
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      {/* 2. KHU VỰC CHI TIẾT CHÍNH (2 CỘT) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* CỘT TRÁI (GALLERY HÌNH ẢNH) - CHIẾM 7 CỘT */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            {/* Ảnh chính lớn */}
            <div className="relative aspect-[4/5] sm:aspect-square w-full bg-[#f6f6f4] border border-neutral-300 overflow-hidden group select-none shadow-2xs">
              <img
                src={selectedImage || product.thumbnail || "https://placehold.co/800x1000?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Tag nhãn đặc quyền */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.isFeatured && (
                  <span className="bg-black text-white text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1 shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    NỔI BẬT
                  </span>
                )}
                {isOutOfStock && (
                  <span className="bg-neutral-800 text-neutral-300 text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1">
                    HẾT HÀNG
                  </span>
                )}
              </div>

              {/* Nút lướt ảnh nhanh trước / sau */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = allImages.indexOf(selectedImage);
                      const prevIdx = idx > 0 ? idx - 1 : allImages.length - 1;
                      setSelectedImage(allImages[prevIdx]);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-black hover:text-white border border-neutral-300 flex items-center justify-center text-neutral-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const idx = allImages.indexOf(selectedImage);
                      const nextIdx = idx < allImages.length - 1 ? idx + 1 : 0;
                      setSelectedImage(allImages[nextIdx]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-black hover:text-white border border-neutral-300 flex items-center justify-center text-neutral-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-xs"
                    title="Ảnh tiếp theo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Góc zoom hint */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 text-[10px] font-mono tracking-widest uppercase backdrop-blur-xs flex items-center gap-1 select-none">
                <Eye className="w-3 h-3" />
                THE LUKI STUDIO
              </div>
            </div>

            {/* Dải thumbnail cuộn ngang */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {allImages.map((imgUrl, i) => {
                  const isSelected = imgUrl === selectedImage;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-18 sm:w-20 aspect-square shrink-0 bg-[#f6f6f4] border-2 transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? "border-black shadow-xs ring-1 ring-black"
                          : "border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CỘT PHẢI (THÔNG TIN SẢN PHẨM & MUA HÀNG) - CHIẾM 5 CỘT */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 1. Header: Danh mục & Tên sản phẩm */}
            <div className="space-y-1.5 border-b border-neutral-200 pb-3.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                {typeof product.category === "object" && product.category?.name ? (
                  <Link
                    href={`/product?category=${product.category.slug}`}
                    className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold hover:text-black transition-colors"
                  >
                    {product.category.name}
                  </Link>
                ) : (
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
                    THE LUKI COLLECTION
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-neutral-400 hover:text-black transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono"
                    title="Chia sẻ sản phẩm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    CHIA SẺ
                  </button>
                </div>
              </div>

              <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-neutral-900 font-sans leading-snug">
                {product.name}
              </h1>

              {/* Meta: SKU, Rating, Đã bán */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-600">
                {product.sku && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-neutral-400">MÃ SKU:</span>
                    <span className="font-bold text-neutral-800">{product.sku}</span>
                    <button
                      type="button"
                      onClick={handleCopySku}
                      className="text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      title="Sao chép SKU"
                    >
                      {copiedSku ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {product.sku && <span className="text-neutral-300">•</span>}

                {/* Đã bán */}
                <div className="text-xs text-neutral-500 font-sans">
                  Đã bán: <strong className="text-neutral-900">{product.sold || 0}</strong>
                </div>
              </div>
            </div>

            {/* 2. Giá tiền */}
            <div>
              <span className="text-base sm:text-lg font-bold text-neutral-900 font-sans tracking-tight">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* 3. Lựa chọn màu sắc (Variants) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans uppercase text-neutral-900 tracking-wider">
                    MÀU SẮC:{" "}
                    <span className="font-normal text-neutral-600 normal-case">
                      {currentVariant?.color}
                    </span>
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {product.variants.length} màu khả dụng
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, idx) => {
                    const isSelected = idx === selectedVariantIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`px-3 py-2 text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-black bg-black text-white shadow-xs"
                            : "border-neutral-300 bg-white text-neutral-800 hover:border-black"
                        }`}
                      >
                        {v.image && (
                          <span className="w-4 h-4 rounded-full overflow-hidden border border-neutral-300 shrink-0 inline-block">
                            <img
                              src={v.image}
                              alt={v.color}
                              className="w-full h-full object-cover"
                            />
                          </span>
                        )}
                        <span>{v.color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Lựa chọn Size (Kích thước) */}
            {currentSizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans uppercase text-neutral-900 tracking-wider">
                    KÍCH THƯỚC (SIZE):{" "}
                    <span className="font-bold text-black">{selectedSize || "Chưa chọn"}</span>
                  </span>

                  {/* Nút mở Bảng size */}
                  <button
                    type="button"
                    onClick={() => setIsSizeModalOpen(true)}
                    className="text-xs font-medium text-neutral-600 hover:text-black underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Bảng quy đổi size
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {currentSizes.map((s, sIdx) => {
                    const isSelected = s.size === selectedSize;
                    const isOut = s.stock <= 0;

                    return (
                      <button
                        key={sIdx}
                        type="button"
                        disabled={isOut}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setQuantity(1);
                        }}
                        className={`h-9 border text-center relative flex flex-col items-center justify-center transition-all ${
                          isOut
                            ? "border-dashed border-neutral-200 bg-neutral-100/70 text-neutral-400 cursor-not-allowed line-through"
                            : isSelected
                            ? "border-black bg-black text-white font-bold shadow-2xs"
                            : "border-neutral-300 bg-white text-neutral-900 hover:border-black font-semibold cursor-pointer"
                        }`}
                      >
                        <span className="text-xs font-mono">{s.size}</span>
                        {!isOut && s.stock <= 5 && (
                          <span
                            className={`text-[8px] font-mono block ${
                              isSelected ? "text-amber-300" : "text-amber-600"
                            }`}
                          >
                            Còn {s.stock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tình trạng tồn kho theo size */}
                <div className="text-xs font-mono pt-1">
                  {isOutOfStock ? (
                    <span className="text-red-600 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                      Tạm hết hàng kích thước này
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      Còn hàng ({currentStock} sản phẩm có sẵn tại kho)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 5. Bộ chọn Số lượng & Nút Mua / Thêm giỏ hàng */}
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <div className="flex items-center gap-3">
                {/* Selector Số lượng */}
                <div className="flex items-center border border-neutral-300 bg-white h-10">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-full flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs sm:text-sm font-sans select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="w-9 h-full flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Nút Yêu thích */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product._id)}
                  disabled={isWishlistPending}
                  className={`h-10 w-10 border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isFavorite
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-neutral-300 bg-white text-neutral-600 hover:border-black hover:text-black"
                  }`}
                  title={isFavorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-red-600 text-red-600" : ""}`}
                  />
                </button>
              </div>

              {/* 2 Nút chính: Thêm giỏ & Mua ngay */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock || isCartPending}
                  className="h-10 sm:h-11 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isCartPending ? "ĐANG THÊM..." : "THÊM VÀO GIỎ HÀNG"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock || isCartPending}
                  className="h-10 sm:h-11 border border-black bg-white hover:bg-black hover:text-white disabled:border-neutral-300 disabled:text-neutral-400 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>MUA NGAY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 6. Khối cam kết dịch vụ (Trust Badges) */}
            <div className="grid grid-cols-2 gap-3 p-4 border border-neutral-200 bg-neutral-50/50 text-xs text-neutral-700">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-bold">Giao hàng toàn quốc</strong>
                  <span className="text-[11px] text-neutral-500">Đồng kiểm khi nhận hàng</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-bold">Đổi trả trong 7 ngày</strong>
                  <span className="text-[11px] text-neutral-500">Nếu lỗi hoặc không vừa size</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-bold">100% Chính hãng</strong>
                  <span className="text-[11px] text-neutral-500">Thiết kế chuẩn THE LUKI</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-neutral-900 font-bold">Chất lượng cao cấp</strong>
                  <span className="text-[11px] text-neutral-500">Vải may tiêu chuẩn xuất khẩu</span>
                </div>
              </div>
            </div>

            {/* 7. Accordion Thông tin & Mô tả & Thông số */}
            <div className="border-t border-neutral-200 divide-y divide-neutral-200 pt-2">
              
              {/* Accordion 1: Mô tả sản phẩm */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => toggleAccordion("desc")}
                  className="w-full flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
                >
                  <span>MÔ TẢ SẢN PHẨM</span>
                  {openAccordions.desc ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
                {openAccordions.desc && (
                  <div className="pt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-2 whitespace-pre-line font-sans">
                    {product.description ||
                      "Sản phẩm thời trang cao cấp từ THE LUKI với thiết kế hiện đại, chất liệu chọn lọc mang lại trải nghiệm thoải mái và phong cách vượt trội."}
                  </div>
                )}
              </div>

              {/* Accordion 2: Thuộc tính & Thông số kỹ thuật */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("specs")}
                    className="w-full flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
                  >
                    <span>THÔNG SỐ & CHẤT LIỆU CHI TIẾT</span>
                    {openAccordions.specs ? (
                      <ChevronUp className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                  {openAccordions.specs && (
                    <div className="pt-3 space-y-2">
                      <div className="border border-neutral-200 divide-y divide-neutral-200 text-xs">
                        {product.attributes.map((attr, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex items-center justify-between p-2.5 bg-white even:bg-neutral-50"
                          >
                            <span className="font-bold text-neutral-600 font-sans uppercase">
                              {attr.name}
                            </span>
                            <span className="text-neutral-900 font-medium font-sans">
                              {attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 3: Chính sách đổi trả & Giao nhận */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex items-center justify-between text-left text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
                >
                  <span>CHÍNH SÁCH GIAO HÀNG & BẢO HÀNH</span>
                  {openAccordions.shipping ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </button>
                {openAccordions.shipping && (
                  <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed font-sans">
                    <p>• <strong>Thời gian giao hàng:</strong> 1 - 2 ngày trong nội thành, 2 - 4 ngày với các tỉnh thành khác.</p>
                    <p>• <strong>Đổi hàng:</strong> Hỗ trợ đổi size hoặc đổi mẫu trong 7 ngày kể từ khi nhận hàng với điều kiện sản phẩm còn nguyên tem mác, chưa qua giặt ủi.</p>
                    <p>• <strong>Bảo hành:</strong> Đổi mới nếu phát hiện lỗi từ nhà sản xuất (đường may, chất liệu vải, phụ liệu).</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 3. SẢN PHẨM TƯƠNG TỰ / CÙNG BỘ SƯU TẬP (RELATED PRODUCTS) */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-neutral-200 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-bold block mb-1">
                  YOU MAY ALSO LIKE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950 font-sans">
                  SẢN PHẨM CÙNG DANH MỤC
                </h2>
              </div>
              <Link
                href="/product"
                className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
              >
                <span>XEM TẤT CẢ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL BẢNG QUY ĐỔI SIZE (SIZE CHART) */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-black max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-neutral-900" />
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-950">
                  BẢNG QUY ĐỔI KÍCH CỠ (SIZE CHART)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="p-1 hover:bg-neutral-100 text-neutral-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nếu sản phẩm có ảnh size_chart riêng */}
            {product.size_chart ? (
              <div className="space-y-3">
                <div className="border border-neutral-300 bg-neutral-50 overflow-hidden">
                  <img
                    src={product.size_chart}
                    alt="Bảng size sản phẩm"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <p className="text-xs text-neutral-500 text-center font-mono">
                  * Thông số chi tiết đo đạc trực tiếp từ mẫu áo thực tế của THE LUKI.
                </p>
              </div>
            ) : (
              /* Bảng size tiêu chuẩn */
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border border-neutral-300">
                    <thead className="bg-neutral-900 text-white font-mono uppercase">
                      <tr>
                        <th className="py-2.5 px-3 border border-neutral-700">Size</th>
                        <th className="py-2.5 px-3 border border-neutral-700">Chiều cao (cm)</th>
                        <th className="py-2.5 px-3 border border-neutral-700">Cân nặng (kg)</th>
                        <th className="py-2.5 px-3 border border-neutral-700">Dài áo (cm)</th>
                        <th className="py-2.5 px-3 border border-neutral-700">Rộng ngực (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 font-sans">
                      <tr className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-black bg-neutral-100">S</td>
                        <td className="py-2 px-3">150 - 165</td>
                        <td className="py-2 px-3">45 - 55</td>
                        <td className="py-2 px-3">68</td>
                        <td className="py-2 px-3">54</td>
                      </tr>
                      <tr className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-black bg-neutral-100">M</td>
                        <td className="py-2 px-3">160 - 172</td>
                        <td className="py-2 px-3">55 - 65</td>
                        <td className="py-2 px-3">71</td>
                        <td className="py-2 px-3">57</td>
                      </tr>
                      <tr className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-black bg-neutral-100">L</td>
                        <td className="py-2 px-3">168 - 178</td>
                        <td className="py-2 px-3">65 - 75</td>
                        <td className="py-2 px-3">74</td>
                        <td className="py-2 px-3">60</td>
                      </tr>
                      <tr className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-black bg-neutral-100">XL</td>
                        <td className="py-2 px-3">175 - 185</td>
                        <td className="py-2 px-3">75 - 85</td>
                        <td className="py-2 px-3">77</td>
                        <td className="py-2 px-3">63</td>
                      </tr>
                      <tr className="hover:bg-neutral-50">
                        <td className="py-2 px-3 font-black bg-neutral-100">2XL</td>
                        <td className="py-2 px-3">&gt; 180</td>
                        <td className="py-2 px-3">&gt; 85</td>
                        <td className="py-2 px-3">80</td>
                        <td className="py-2 px-3">66</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-neutral-50 p-3 border border-neutral-200 text-xs text-neutral-600 space-y-1">
                  <p className="font-bold text-neutral-900">• Lưu ý chọn size:</p>
                  <p>- Nếu số đo nằm giữa hai size, hãy chọn size lớn hơn nếu bạn thích mặc form rộng thoải mái (Oversize).</p>
                  <p>- Bảng size mang tính chất tham khảo, độ co giãn thực tế tùy thuộc vào từng chất liệu vải.</p>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ĐÃ HIỂU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse font-sans">
          <div className="h-4 bg-neutral-200 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 aspect-square bg-neutral-200" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-8 bg-neutral-200 w-3/4" />
              <div className="h-6 bg-neutral-200 w-1/3" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetailContent slug={resolvedParams.slug} />
    </Suspense>
  );
}