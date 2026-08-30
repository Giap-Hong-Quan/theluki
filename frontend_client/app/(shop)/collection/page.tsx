"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useCollections } from "@/hooks/useCollection";
import { ICollection } from "@/types/collectionType";

function CollectionPageContent() {
  const { data: collections = [], isLoading } = useCollections({
    isActive: true,
    isDeleted: false,
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900 pb-20">
      {/* Tiêu đề trang */}
      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.2em] text-center pt-8 pb-4 text-neutral-900 font-sans">
        BỘ SƯU TẬP
      </h1>

      {/* Breadcrumb điều hướng */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Bộ sưu tập" },
        ]}
      />

      {/* Danh sách Bộ sưu tập - Grid 2 Cột Vuông Vức Toàn Bộ */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-6">
          {Array.from({ length: 4 }).map((_, n) => (
            <div
              key={n}
              className="aspect-[16/10] bg-neutral-100 animate-pulse rounded-none"
            />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-6">
          {collections.map((col: ICollection) => {
            const imageUrl = col.thumbnail_url || col.banner_url;

            return (
              <Link
                key={col._id}
                href={`/collection/${col.slug}`}
                className="group block relative aspect-[16/10] overflow-hidden bg-neutral-100 border border-neutral-200 rounded-none shadow-sm"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={col.name}
                    fill
                    className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-white">
                    <span className="text-xl font-bold uppercase tracking-wider">{col.name}</span>
                  </div>
                )}

                {/* Lớp phủ mờ Gradient & Thông tin BST */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/25 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <div className="space-y-2">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold text-neutral-300">
                      LOOKBOOK
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white group-hover:text-amber-300 transition-colors drop-shadow-sm font-sans">
                      {col.name}
                    </h2>
                    {col.description && (
                      <p className="text-xs sm:text-sm text-neutral-200 font-light line-clamp-2 leading-relaxed">
                        {col.description}
                      </p>
                    )}
                    <div className="pt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-white group-hover:text-amber-300 transition-colors">
                      <span>Xem bộ sưu tập</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="w-full py-24 text-center border border-dashed border-neutral-200 mt-6 space-y-3">
          <Layers className="w-10 h-10 text-neutral-300 mx-auto" />
          <p className="text-base font-semibold text-neutral-800">Chưa có bộ sưu tập nào được công bố</p>
          <p className="text-xs text-neutral-400 font-light">Các bộ sưu tập mới sẽ sớm được cập nhật tại đây.</p>
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white pb-20 pt-8">
          <div className="w-48 h-10 bg-neutral-100 animate-pulse mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="aspect-[16/10] bg-neutral-100 animate-pulse rounded-none" />
            <div className="aspect-[16/10] bg-neutral-100 animate-pulse rounded-none" />
          </div>
        </div>
      }
    >
      <CollectionPageContent />
    </Suspense>
  );
}
