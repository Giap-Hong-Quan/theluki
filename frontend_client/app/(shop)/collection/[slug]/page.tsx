"use client";

import React, { use, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProductFilterBar from "@/components/product/ProductFilterBar";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import Pagination from "@/components/common/Pagination";
import { useCollectionBySlug } from "@/hooks/useCollection";
import { useProductsByCollection } from "@/hooks/useProduct";

const PAGE_SIZE = 20;

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

function CollectionDetailContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();

  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page")) || 1;

  // 1. Lấy thông tin chi tiết của Bộ sưu tập (Banner, Tên, Mô tả)
  const { data: collection, isLoading: isCollectionLoading } = useCollectionBySlug(slug);

  // 2. Lấy danh sách sản phẩm thuộc Bộ sưu tập này
  const { data: productData, isLoading: isProductsLoading } = useProductsByCollection(slug, {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search,
    page,
    sizePage: PAGE_SIZE,
  });

  const products = productData?.products || [];
  const totalProduct = productData?.totalProduct || 0;

  return (
    <div className="pb-16 text-neutral-900">
      {/* 1. HERO BANNER BỘ SƯU TẬP (Phong cách vuông vức Luxury) */}
      <div className="relative w-full aspect-[16/7] sm:aspect-[21/9] bg-neutral-100 overflow-hidden border border-neutral-200 rounded-none shadow-md mt-4">
        {isCollectionLoading ? (
          <div className="w-full h-full bg-neutral-200 animate-pulse rounded-none" />
        ) : collection ? (
          <>
            {collection.banner_url || collection.thumbnail_url ? (
              <Image
                src={collection.banner_url || collection.thumbnail_url || ""}
                alt={collection.name}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              <div className="w-full h-full bg-neutral-900" />
            )}

            {/* Lớp phủ mờ & Text thông tin BST */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
              <div className="space-y-3 max-w-3xl">
                <span className="text-[11px] uppercase tracking-[0.35em] text-neutral-300 font-bold">
                  COLLECTION LOOKBOOK
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-sm font-sans">
                  {collection.name}
                </h1>
                {collection.description && (
                  <p className="text-xs sm:text-base text-neutral-200 font-light leading-relaxed max-w-2xl">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* 2. Breadcrumb điều hướng */}
      <div className="mt-6">
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Bộ sưu tập", href: "/collection" },
            { label: collection?.name || slug },
          ]}
        />
      </div>

      {/* 3. Thanh Lọc theo Khoảng giá & Tổng số lượng sản phẩm */}
      <ProductFilterBar totalProducts={totalProduct} />

      {/* 4. Lưới danh sách sản phẩm */}
      {isProductsLoading ? (
        <div className="w-full mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="w-full mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>

          {/* Thanh phân trang vuông vức */}
          <Pagination
            currentPage={page}
            totalItems={totalProduct}
            pageSize={PAGE_SIZE}
          />
        </>
      ) : (
        <div className="w-full py-20 text-center text-neutral-400 font-mono text-sm border border-dashed border-neutral-200 mt-6">
          Chưa có sản phẩm nào trong bộ sưu tập này.
        </div>
      )}
    </div>
  );
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <div className="pb-16 pt-4">
          <div className="w-full aspect-[21/9] bg-neutral-100 animate-pulse" />
          <div className="w-full mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        </div>
      }
    >
      <CollectionDetailContent slug={resolvedParams.slug} />
    </Suspense>
  );
}
