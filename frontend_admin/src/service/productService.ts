import { apiClient } from "./apiclient";
import type { ApiResponse } from "../types/apiResponseType";
import type {
  ProductItem,
  GetProductsQueryParams,
  GetProductsData,
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/productType";

export const productService = {
  // 1. Lấy danh sách sản phẩm (hỗ trợ phân trang, tìm kiếm, lọc theo category, collection, giá, nổi bật, v.v.)
  getAllProducts: (
    params?: GetProductsQueryParams
  ): Promise<ApiResponse<GetProductsData>> => {
    return apiClient.get("/product", { params });
  },

  // 2. Lấy chi tiết sản phẩm theo ID
  getProductById: (id: string): Promise<ApiResponse<ProductItem>> => {
    return apiClient.get(`/product/${id}`);
  },

  // 3. Lấy chi tiết sản phẩm theo Slug (cho SEO / trang chi tiết)
  getProductBySlug: (slug: string): Promise<ApiResponse<ProductItem>> => {
    return apiClient.get(`/product/slug/${slug}`);
  },

  // 4. Tạo mới sản phẩm
  createProduct: (
    payload: CreateProductPayload
  ): Promise<ApiResponse<ProductItem>> => {
    return apiClient.post("/product", payload);
  },

  // 5. Cập nhật thông tin sản phẩm theo ID
  updateProduct: (
    id: string,
    payload: UpdateProductPayload
  ): Promise<ApiResponse<ProductItem>> => {
    return apiClient.put(`/product/${id}`, payload);
  },

  // 6. Bật / Tắt trạng thái ẩn hiện sản phẩm (Active / Inactive)
  toggleActiveProduct: (id: string): Promise<ApiResponse<ProductItem>> => {
    return apiClient.patch(`/product/${id}/status`);
  },

  // 7. Xóa mềm sản phẩm (đưa vào thùng rác)
  deleteProduct: (id: string): Promise<ApiResponse<ProductItem>> => {
    return apiClient.delete(`/product/${id}`);
  },

  // 8. Khôi phục sản phẩm từ thùng rác
  restoreProduct: (id: string): Promise<ApiResponse<ProductItem>> => {
    return apiClient.put(`/product/${id}/restore`);
  },

  // 9. Xóa vĩnh viễn sản phẩm khỏi Database (Hard Delete)
  forceDeleteProduct: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/product/${id}/force`);
  },
};
