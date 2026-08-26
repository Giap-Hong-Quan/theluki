import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import { GetCategoriesParams } from "@/types/categoryType";

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
  list: (params?: GetCategoriesParams) => [...CATEGORY_KEYS.all, "list", params] as const,
};

/**
 * Hook lấy danh sách danh mục sản phẩm (Client)
 */
export const useCategories = (params?: GetCategoriesParams) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: () => categoryService.getCategories(params),
    select: (res) => res?.data?.categories || [],
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};
