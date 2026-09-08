"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  X,
  ChevronRight,
  Flame,
  Layers,
} from "lucide-react";
import { useActiveBanners } from "@/hooks/useBanner";
import { useCollections } from "@/hooks/useCollection";
import { useProducts } from "@/hooks/useProduct";
import ProductCard from "@/components/product/ProductCard";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "featured">("new");

  // 1. Data hooks
  const { data: activeBanners, isLoading: isBannerLoading } = useActiveBanners();
  const { data: collections = [], isLoading: isColLoading } = useCollections({
    isActive: true,
  });
  const { data: newArrivalsData, isLoading: isNewLoading } = useProducts({
    sizePage: 8,
    sort: "-createdAt",
  });
  const { data: featuredData, isLoading: isFeaturedLoading } = useProducts({
    sizePage: 8,
    isFeatured: true,
  });

  const heroBanner = activeBanners?.home_hero;
  const popupBanner = activeBanners?.popup;

  // 2. Popup handler (chỉ hiện 1 lần mỗi phiên)
  useEffect(() => {
    if (popupBanner?.image && popupBanner?.isActive) {
      const hasClosedPopup = sessionStorage.getItem("luki_popup_closed");
      if (!hasClosedPopup) {
        setShowPopup(true);
      }
    }
  }, [popupBanner]);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("luki_popup_closed", "true");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClosePopup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const newProducts = newArrivalsData?.products || [];
  const featuredProducts = featuredData?.products || [];

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-6">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative w-full overflow-hidden border border-neutral-900 bg-neutral-100">
        <Link href="/product" className="block w-full">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full">
            <img
              src={
                heroBanner?.image ||
                "https://theciu.vn/_next/image?url=https%3A%2F%2Fminio.theciu.vn%2Ftheciu-beta%2F2500%2Fimages%2FltPBJMYAyZ67ltZxFE8V0KTFzy0oc9JjACFRb1ez.jpg%3Fv%3D1778063804&w=1920&q=75"
              }
              alt="The Luki Campaign"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </Link>
      </section>

      {/* 2. CHÍNH SÁCH THƯƠNG HIỆU (VALUE PROPOSITIONS) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 border-y border-neutral-200 py-6 sm:py-8">
        <div className="flex items-start gap-3 p-2">
          <Truck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
              GIAO HÀNG TOÀN QUỐC
            </h4>
            <p className="text-[11px] text-neutral-500 font-sans">
              Đồng kiểm khi nhận, miễn phí từ 500k
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <RotateCcw className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
              ĐỔI TRẢ 7 NGÀY
            </h4>
            <p className="text-[11px] text-neutral-500 font-sans">
              Hỗ trợ đổi size nhanh chóng, tiện lợi
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <ShieldCheck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
              100% CHÍNH HÃNG
            </h4>
            <p className="text-[11px] text-neutral-500 font-sans">
              Thiết kế & hoàn thiện chuẩn The Luki
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-2">
          <Headphones className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 font-sans">
              HỖ TRỢ TẬN TÂM
            </h4>
            <p className="text-[11px] text-neutral-500 font-sans">
              Tư vấn phong cách & size 24/7
            </p>
          </div>
        </div>
      </section>

      {/* 3. SẢN PHẨM: TABS CHUYỂN ĐỔI MỚI VỀ / NỔI BẬT */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-200 gap-4 pb-0">
          {/* Cụm Tabs */}
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`pb-3 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === "new"
                  ? "text-neutral-950 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-neutral-950 font-black"
                  : "text-neutral-400 hover:text-neutral-700 font-medium"
              }`}
            >
              <Flame
                className={`w-4 h-4 transition-colors ${
                  activeTab === "new" ? "text-red-500" : "text-neutral-300"
                }`}
              />
              <span>SẢN PHẨM MỚI VỀ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("featured")}
              className={`pb-3 text-sm sm:text-base font-bold uppercase tracking-wider transition-all relative cursor-pointer flex items-center gap-1.5 ${
                activeTab === "featured"
                  ? "text-neutral-950 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-neutral-950 font-black"
                  : "text-neutral-400 hover:text-neutral-700 font-medium"
              }`}
            >
              <Sparkles
                className={`w-4 h-4 transition-colors ${
                  activeTab === "featured" ? "text-amber-500" : "text-neutral-300"
                }`}
              />
              <span>SẢN PHẨM NỔI BẬT</span>
            </button>
          </div>

          {/* Link Xem tất cả tương ứng */}
          <Link
            href={
              activeTab === "new"
                ? "/product?sort=-createdAt"
                : "/product?isFeatured=true"
            }
            className="text-xs font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 font-mono uppercase tracking-wider pb-3"
          >
            <span>
              {activeTab === "new" ? "Tất cả sản phẩm mới" : "Tất cả nổi bật"}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Lưới sản phẩm */}
        {(activeTab === "new" ? isNewLoading : isFeaturedLoading) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square bg-neutral-200" />
                <div className="h-4 bg-neutral-200 w-3/4" />
                <div className="h-4 bg-neutral-200 w-1/3" />
              </div>
            ))}
          </div>
        ) : (activeTab === "new" ? newProducts : featuredProducts).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {(activeTab === "new" ? newProducts : featuredProducts).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400 text-xs font-mono">
            {activeTab === "new"
              ? "Đang cập nhật sản phẩm mới..."
              : "Đang cập nhật sản phẩm nổi bật..."}
          </div>
        )}
      </section>

      {/* 5. BỘ SƯU TẬP TIÊU BIỂU (COLLECTIONS SPOTLIGHT) */}
      {collections.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-neutral-200 pb-3">
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400 block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-neutral-700" />
                SIGNATURE LOOKBOOK
              </span>
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-neutral-900 font-sans">
                BỘ SƯU TẬP ĐỘC QUYỀN
              </h3>
            </div>
            <Link
              href="/collection"
              className="text-xs font-bold text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <span>Tất cả BST</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.slice(0, 3).map((col) => (
              <Link
                key={col._id}
                href={`/collection/${col.slug}`}
                className="group relative overflow-hidden aspect-[4/5] bg-neutral-900 border border-neutral-800 flex flex-col justify-end p-6"
              >
                <img
                  src={
                    col.banner_url ||
                    col.thumbnail_url ||
                    "https://theciu.vn/_next/image?url=https%3A%2F%2Fminio.theciu.vn%2Ftheciu-beta%2F350%2Fimages%2Fj5Ujcr9cQrxFp0Hz2X7nhA6q4fP9bhng956A5ykD.png%3Fv%3D58151&w=1920&q=75"
                  }
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 space-y-2 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-300">
                    COLLECTION
                  </span>
                  <h4 className="text-xl font-bold uppercase tracking-tight font-sans">
                    {col.name}
                  </h4>
                  {col.description && (
                    <p className="text-xs text-neutral-300 line-clamp-2 font-sans">
                      {col.description}
                    </p>
                  )}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider uppercase underline underline-offset-4 group-hover:translate-x-1 transition-transform">
                      Khám phá ngay
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}



      {/* 7. INSTAGRAM / LOOKBOOK COMMUNITY BANNER */}
      <section className="border border-neutral-900 bg-neutral-950 text-white p-8 sm:p-12 text-center space-y-4">
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-neutral-400 block">
          #THELUKISTUDIO ON INSTAGRAM
        </span>
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-sans">
          JOIN OUR FASHION COMMUNITY
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto font-sans">
          Chia sẻ phong cách thời trang cùng hashtag #TheLuki để có cơ hội xuất hiện trên trang chính thức của chúng tôi.
        </p>
        <div className="pt-2">
          <Link
            href="/product"
            className="inline-block px-6 py-3 bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-widest font-mono transition-colors"
          >
            KHÁM PHÁ CỬA HÀNG
          </Link>
        </div>
      </section>

      {/* 8. FLOATING PROMO WIDGET (NẾU CÓ BANNER POPUP ACTIVE) */}
      {showPopup && popupBanner?.image && (
        <aside
          aria-label="Khuyến mãi đặc biệt"
          className="fixed bottom-6 right-6 z-50 max-w-[220px] sm:max-w-[260px] bg-white border border-neutral-900 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 hidden md:block"
        >
          <button
            type="button"
            onClick={handleClosePopup}
            className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/80 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <Link href="/product" className="block w-full aspect-[4/5] bg-neutral-100 group">
            <img
              src={popupBanner.image}
              alt="Promotion"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
          <div className="p-2.5 bg-black text-center">
            <Link
              href="/product"
              className="block w-full text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono hover:text-neutral-300 transition-colors"
            >
              KHÁM PHÁ NGAY →
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}