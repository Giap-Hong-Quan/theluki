import { useQuery } from "@tanstack/react-query";
import { collectionService } from "@/services/collectionService";
import { GetCollectionsParams } from "@/types/collectionType";

export const COLLECTION_KEYS = {
  all: ["collections"] as const,
  list: (params?: GetCollectionsParams) => [...COLLECTION_KEYS.all, "list", params] as const,
  detail: (slug: string) => [...COLLECTION_KEYS.all, "detail", slug] as const,
  byId: (id: string) => [...COLLECTION_KEYS.all, "id", id] as const,
};

// Hook lấy danh sách bộ sưu tập (mặc định lấy các bộ sưu tập đang active)
export const useCollections = (params?: GetCollectionsParams) => {
  return useQuery({
    queryKey: COLLECTION_KEYS.list(params),
    queryFn: () => collectionService.getCollections(params),
    select: (res) => res?.data?.collections || [],
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

// Hook lấy chi tiết bộ sưu tập theo Slug
export const useCollectionBySlug = (slug: string) => {
  return useQuery({
    queryKey: COLLECTION_KEYS.detail(slug),
    queryFn: () => collectionService.getCollectionBySlug(slug),
    select: (res) => res?.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook lấy chi tiết bộ sưu tập theo ID
export const useCollectionById = (id: string) => {
  return useQuery({
    queryKey: COLLECTION_KEYS.byId(id),
    queryFn: () => collectionService.getCollectionById(id),
    select: (res) => res?.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
