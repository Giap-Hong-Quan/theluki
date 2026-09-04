"use client";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import CategoryTabs from "@/components/product/CategoryTabs";
import ProductFilterBar from "@/components/product/ProductFilterBar";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import Pagination from "@/components/common/Pagination";
import { useProducts } from "@/hooks/useProduct";

const PAGE_SIZE = 20;

export default function ProductPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page")) || 1;

  const { data: productData, isLoading } = useProducts({
    category: category !== "all" ? category : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    search,
    page,
    sizePage: PAGE_SIZE,
    isActive: true,
    isDeleted: false,
  });
  const products = productData?.products || [];
  const totalProduct = productData?.totalProduct || 0;
  return (
    <div className="pb-16">
      <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-[0.2em] text-center pt-8 pb-4 text-zinc-900 font-sans">
        SẢN PHẨM
      </h1>
      <Breadcrumb
        items={[
          {
            label: "Trang chủ",
            href: "/",
          },
          {
            label: "Sản phẩm",
          },
        ]}
      />
      <CategoryTabs />
      <ProductFilterBar totalProducts={totalProduct} />
      {isLoading ? (
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
          <Pagination
            currentPage={page}
            totalItems={totalProduct}
            pageSize={PAGE_SIZE}
          />
        </>
      ) : (
        <div className="w-full py-16 text-center text-zinc-400 font-mono text-sm">
          Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
        </div>
      )}
    </div>
  );
}
