"use client";

import { useQuery } from "@tanstack/react-query";
import { bannerService } from "@/services/bannerService";
import { GetBannersParams, IBanner } from "@/types/bannerType";

export const BANNER_KEYS = {
  all: ["banners"] as const,
  active: () => [...BANNER_KEYS.all, "active"] as const,
  list: (params?: GetBannersParams) => [...BANNER_KEYS.all, "list", params] as const,
  byId: (id: string) => [...BANNER_KEYS.all, "id", id] as const,
};

// Hook lấy banner active (1 home_hero, 1 popup) cho Client
export const useActiveBanners = () => {
  return useQuery({
    queryKey: BANNER_KEYS.active(),
    queryFn: () => bannerService.getActiveBanners(),
    select: (res) => res?.data,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook lấy danh sách banner
export const useBanners = (params?: GetBannersParams) => {
  return useQuery({
    queryKey: BANNER_KEYS.list(params),
    queryFn: () => bannerService.getBanners(params),
    select: (res) => (res?.data?.banners || []) as IBanner[],
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

// Hook lấy chi tiết banner theo ID
export const useBannerById = (id: string) => {
  return useQuery({
    queryKey: BANNER_KEYS.byId(id),
    queryFn: () => bannerService.getBannerById(id),
    select: (res) => res?.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
