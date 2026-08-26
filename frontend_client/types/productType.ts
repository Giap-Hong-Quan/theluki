export interface IProductSize {
  size: string;
  stock: number;
}

export interface IProductVariant {
  color: string;
  image?: string;
  sku?: string;
  sizes: IProductSize[];
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  original_price?: number;
  category: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
  } | string;
  collections?: Array<{
    _id: string;
    name: string;
    slug: string;
    image?: string;
  }>;
  description?: string;
  thumbnail?: string;
  images?: string[];
  attributes?: Array<{ name: string; value: string }>;
  size_chart?: string;
  variants?: IProductVariant[];
  stock?: number;
  sold?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProductsParams {
  page?: number;
  sizePage?: number;
  search?: string;
  category?: string; // Hỗ trợ truyền ObjectId hoặc Slug danh mục
  collection?: string; // Hỗ trợ truyền ObjectId hoặc Slug bộ sưu tập
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface GetProductsResponse {
  products: IProduct[];
  totalProduct: number;
  totalPage: number;
  currentPage: number;
  sizePage: number;
}
