import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../service/categoryService";
import type {
  CreateCategoryPayload,
  GetCategoriesQueryParams,
  UpdateCategoryPayload,
} from "../types/categoryType";
import toast from "react-hot-toast";

// 1. Hook lấy danh sách danh mục (hỗ trợ phân trang, tìm kiếm, lọc thùng rác, lọc active)
export const useGetAllCategories = (params?: GetCategoriesQueryParams) => {
  return useQuery({
    queryKey: ["allCategories", params],
    queryFn: () => categoryService.getAllCategories(params),
    select: (response) => response?.data,
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Hook lấy chi tiết danh mục theo ID
export const useGetCategoryById = (id?: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryService.getCategoryById(id!),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
};

// 3. Hook tạo mới danh mục
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoryService.createCategory(payload),
    onSuccess: () => {
      toast.success("Tạo danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo danh mục thất bại");
    },
  });
};

// 5. Hook cập nhật thông tin danh mục theo ID
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => categoryService.updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
      queryClient.invalidateQueries({ queryKey: ["category"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật danh mục thất bại");
    },
  });
};

// 6. Hook bật / tắt trạng thái hoạt động của danh mục
export const useToggleActiveCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.toggleActiveCategory(id),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    },
  });
};

// 8. Hook xóa mềm danh mục (đưa vào thùng rác)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Chuyển danh mục vào thùng rác thành công");
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa danh mục thất bại");
    },
  });
};

// 9. Hook khôi phục danh mục từ thùng rác
export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.restoreCategory(id),
    onSuccess: () => {
      toast.success("Khôi phục danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Khôi phục danh mục thất bại"
      );
    },
  });
};

// 10. Hook xóa vĩnh viễn danh mục khỏi Database
export const useForceDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.forceDeleteCategory(id),
    onSuccess: () => {
      toast.success("Xóa vĩnh viễn danh mục thành công");
      queryClient.invalidateQueries({ queryKey: ["allCategories"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xóa vĩnh viễn danh mục thất bại"
      );
    },
  });
};
