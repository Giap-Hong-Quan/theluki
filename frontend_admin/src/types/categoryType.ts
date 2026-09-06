export interface CategorySeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface CategoryItem {
  _id: string;
  name: string;
  noAccentName?: string;
  slug: string;
  image?: string | null;
  productCount?: number;
  seo?: CategorySeo;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCategoriesQueryParams {
  search?: string;
  isDeleted?: boolean;
  isActive?: boolean;
}

export interface GetCategoriesData {
  categories: CategoryItem[];
  totalCategory: number;
}

export interface CreateCategoryPayload {
  name: string;
  image?: string | null;
  seo?: CategorySeo;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  image?: string | null;
  seo?: CategorySeo;
  isActive?: boolean;
}
