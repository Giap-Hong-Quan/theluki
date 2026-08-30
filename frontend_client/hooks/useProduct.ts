import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { GetProductsParams } from "@/types/productType";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  list: (params?: GetProductsParams) => [...PRODUCT_KEYS.all, "list", params] as const,
  byCategorySlug: (categorySlug: string, params?: Omit<GetProductsParams, "category">) =>
    [...PRODUCT_KEYS.all, "byCategorySlug", categorySlug, params] as const,
  byCollectionSlug: (collectionSlug: string, params?: Omit<GetProductsParams, "collection">) =>
    [...PRODUCT_KEYS.all, "byCollectionSlug", collectionSlug, params] as const,
};

/**
 * Hook lấy danh sách sản phẩm theo Slug danh mục (Client)
 */
export const useProductsByCategorySlug = (
  categorySlug: string,
  params?: Omit<GetProductsParams, "category">
) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.byCategorySlug(categorySlug, params),
    queryFn: () => productService.getProductsByCategorySlug(categorySlug, params),
    select: (res) => res?.data?.products || [],
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

/**
 * Hook lấy danh sách sản phẩm theo Slug bộ sưu tập (Collection)
 */
export const useProductsByCollection = (
  collectionSlug: string,
  params?: Omit<GetProductsParams, "collection">
) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.byCollectionSlug(collectionSlug, params),
    queryFn: () =>
      productService.getProducts({
        ...params,
        collection: collectionSlug,
        isActive: true,
        isDeleted: false,
      }),
    select: (res) => res?.data,
    enabled: !!collectionSlug,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook lấy danh sách sản phẩm chung (hỗ trợ phân trang, lọc, tìm kiếm)
 */
export const useProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productService.getProducts(params),
    select: (res) => res?.data,
    staleTime: 5 * 60 * 1000,
  });
};
