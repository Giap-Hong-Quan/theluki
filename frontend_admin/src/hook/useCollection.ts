import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionService } from "../service/collectionService";
import type {
  CreateCollectionPayload,
  GetCollectionsQueryParams,
  UpdateCollectionPayload,
} from "../types/collectionType";
import toast from "react-hot-toast";

// 1. Hook lấy danh sách bộ sưu tập (hỗ trợ phân trang, tìm kiếm, lọc thùng rác, lọc active, lọc nổi bật)
export const useGetAllCollections = (params?: GetCollectionsQueryParams) => {
  return useQuery({
    queryKey: ["allCollections", params],
    queryFn: () => collectionService.getAllCollections(params),
    select: (response) => response?.data,
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Hook lấy chi tiết bộ sưu tập theo ID
export const useGetCollectionById = (id?: string) => {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: () => collectionService.getCollectionById(id!),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
};

// 3. Hook tạo mới bộ sưu tập
export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCollectionPayload) =>
      collectionService.createCollection(payload),
    onSuccess: () => {
      toast.success("Tạo bộ sưu tập thành công");
      queryClient.invalidateQueries({ queryKey: ["allCollections"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo bộ sưu tập thất bại");
    },
  });
};

// 4. Hook cập nhật thông tin bộ sưu tập theo ID
export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCollectionPayload;
    }) => collectionService.updateCollection(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật bộ sưu tập thành công");
      queryClient.invalidateQueries({ queryKey: ["allCollections"] });
      queryClient.invalidateQueries({ queryKey: ["collection"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật bộ sưu tập thất bại");
    },
  });
};

// 5. Hook bật / tắt trạng thái hoạt động của bộ sưu tập
export const useToggleActiveCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionService.toggleActiveCollection(id),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái bộ sưu tập thành công");
      queryClient.invalidateQueries({ queryKey: ["allCollections"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    },
  });
};

// 6. Hook xóa mềm bộ sưu tập (đưa vào thùng rác)
export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionService.deleteCollection(id),
    onSuccess: () => {
      toast.success("Chuyển bộ sưu tập vào thùng rác thành công");
      queryClient.invalidateQueries({ queryKey: ["allCollections"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa bộ sưu tập thất bại");
    },
  });
};

// 7. Hook khôi phục bộ sưu tập từ thùng rác
export const useRestoreCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionService.restoreCollection(id),
    onSuccess: () => {
      toast.success("Khôi phục bộ sưu tập thành công");
      queryClient.invalidateQueries({ queryKey: ["allCollections"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Khôi phục bộ sưu tập thất bại"
      );
    },
  });
};

// 8. Hook xóa vĩnh viễn bộ sưu tập khỏi Database
export const useForceDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionService.forceDeleteCollection(id),
    onSuccess: () => {
      toast.success("Xóa vĩnh viễn bộ sưu tập thành công");
      queryClient.invalidateQueries({ queryKey: ["allCollections"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xóa vĩnh viễn bộ sưu tập thất bại"
      );
    },
  });
};
