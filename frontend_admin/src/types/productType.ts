export interface IProductAttribute {
  name: string;
  value: string;
}

export interface IProductSize {
  _id?: string;
  size: string;
  stock: number;
}

export interface IColorVariant {
  _id?: string;
  color: string;
  image?: string | null;
  sku?: string;
  barcode?: string;
  price?: number;
  costPrice?: number;
  isActive?: boolean;
  sizes: IProductSize[];
}

export interface IProductRatings {
  average: number;
  count: number;
}

export interface IProductSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface IProductCategoryPopulated {
  _id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface IProductCollectionPopulated {
  _id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface ProductItem {
  _id: string;
  name: string;
  noAccentName?: string;
  slug: string;
  sku: string;
  description?: string;
  attributes?: IProductAttribute[];
  size_chart?: string | null;
  original_price?: number | null;
  price: number;
  category: IProductCategoryPopulated;
  collections?: IProductCollectionPopulated[];
  thumbnail?: string | null;
  images?: string[];
  stock: number;
  weight?: number;
  sold?: number;
  variants: IColorVariant[];
  ratings?: IProductRatings;
  isFeatured?: boolean;
  seo?: IProductSeo;
  isActive: boolean;
  deletedAt?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetProductsQueryParams {
  page?: number;
  sizePage?: number;
  search?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface GetProductsData {
  products: ProductItem[];
  totalProduct: number;
  totalActive?: number;
  totalInactive?: number;
  totalFeatured?: number;
  totalPage: number;
  currentPage: number;
  sizePage: number;
}

export interface CreateColorVariantPayload {
  color: string;
  image?: string | null;
  sku?: string;
  isActive?: boolean;
  sizes?: {
    size: string;
    stock: number;
  }[];
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  attributes?: IProductAttribute[];
  size_chart?: string | null;
  original_price?: number;
  price: number;
  category: string;
  collections?: string[];
  thumbnail?: string | null;
  images?: string[];
  weight?: number;
  variants?: CreateColorVariantPayload[];
  isFeatured?: boolean;
  isActive?: boolean;
  seo?: IProductSeo;
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  description?: string;
  attributes?: IProductAttribute[];
  size_chart?: string | null;
  original_price?: number;
  price?: number;
  category?: string;
  collections?: string[];
  thumbnail?: string | null;
  images?: string[];
  stock?: number;
  weight?: number;
  variants?: CreateColorVariantPayload[];
  isFeatured?: boolean;
  isActive?: boolean;
  seo?: IProductSeo;
}

