import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "../service/productService";
import type {
  CreateProductPayload,
  GetProductsQueryParams,
  UpdateProductPayload,
} from "../types/productType";
import toast from "react-hot-toast";

// 1. Hook lấy danh sách sản phẩm (hỗ trợ phân trang, tìm kiếm, lọc theo danh mục, bộ sưu tập, giá, v.v.)
export const useGetAllProducts = (params?: GetProductsQueryParams) => {
  return useQuery({
    queryKey: ["allProducts", params],
    queryFn: () => productService.getAllProducts(params),
    select: (response) => response?.data,
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Hook lấy chi tiết sản phẩm theo ID
export const useGetProductById = (id?: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id!),
    enabled: Boolean(id),
    select: (response) => response?.data,
  });
};

// 3. Hook lấy chi tiết sản phẩm theo Slug (SEO / Client)
export const useGetProductBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ["productSlug", slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: Boolean(slug),
    select: (response) => response?.data,
  });
};

// 4. Hook tạo mới sản phẩm
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productService.createProduct(payload),
    onSuccess: () => {
      toast.success("Tạo sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo sản phẩm thất bại");
    },
  });
};

// 5. Hook cập nhật thông tin sản phẩm theo ID
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProductPayload;
    }) => productService.updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Cập nhật sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật sản phẩm thất bại");
    },
  });
};

// 6. Hook bật / tắt trạng thái hiển thị của sản phẩm
export const useToggleActiveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.toggleActiveProduct(id),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
       queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    },
  });
};

// 7. Hook xóa mềm sản phẩm (chuyển vào thùng rác)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success("Chuyển sản phẩm vào thùng rác thành công");
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa sản phẩm thất bại");
    },
  });
};

// 8. Hook khôi phục sản phẩm từ thùng rác
export const useRestoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.restoreProduct(id),
    onSuccess: () => {
      toast.success("Khôi phục sản phẩm thành công");
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Khôi phục sản phẩm thất bại"
      );
    },
  });
};

// 9. Hook xóa vĩnh viễn sản phẩm khỏi hệ thống (Hard Delete)
export const useForceDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.forceDeleteProduct(id),
    onSuccess: () => {
      toast.success("Đã xóa vĩnh viễn sản phẩm");
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xóa vĩnh viễn sản phẩm thất bại"
      );
    },
  });
};
