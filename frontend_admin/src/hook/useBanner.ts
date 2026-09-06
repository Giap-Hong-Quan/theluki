import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "../service/bannerService";
import type {
  CreateBannerPayload,
  GetBannersQueryParams,
  UpdateBannerPayload,
} from "../types/bannerType";
import toast from "react-hot-toast";

// 1. Hook lấy danh sách banner (không phân trang, lọc position, isActive)
export const useGetAllBanners = (params?: GetBannersQueryParams) => {
  return useQuery({
    queryKey: ["allBanners", params],
    queryFn: () => bannerService.getAllBanners(params),
    select: (response) => response?.data,
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Hook lấy chi tiết banner theo ID
export const useGetBannerById = (id?: string) => {
  return useQuery({
    queryKey: ["banner", id],
    queryFn: () => bannerService.getBannerById(id!),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
};

// 3. Hook tạo mới banner
export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBannerPayload) =>
      bannerService.createBanner(payload),
    onSuccess: () => {
      toast.success("Tạo banner thành công");
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo banner thất bại");
    },
  });
};

// 4. Hook cập nhật banner theo ID
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBannerPayload;
    }) => bannerService.updateBanner(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật banner thành công");
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
      queryClient.invalidateQueries({ queryKey: ["banner"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật banner thất bại");
    },
  });
};

// 5. Hook bật / tắt trạng thái hiển thị của banner (Độc quyền mỗi loại 1 banner)
export const useToggleActiveBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannerService.toggleActiveBanner(id),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái hiển thị banner thành công");
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    },
  });
};

// 6. Hook xóa vĩnh viễn banner
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannerService.deleteBanner(id),
    onSuccess: () => {
      toast.success("Xóa banner thành công");
      queryClient.invalidateQueries({ queryKey: ["allBanners"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa banner thất bại");
    },
  });
};
