export interface CollectionSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface CollectionItem {
  _id: string;
  name: string;
  noAccentName?: string;
  slug: string;
  description?: string;
  banner_url?: string | null;
  thumbnail_url?: string | null;
  productCount?: number;
  isFeatured?: boolean;
  isActive: boolean;
  seo?: CollectionSeo;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCollectionsQueryParams {
  page?: number;
  sizePage?: number;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface GetCollectionsData {
  collections: CollectionItem[];
  totalCollection: number;
  totalActive?: number;
  totalInactive?: number;
  totalFeatured?: number;
  totalPage: number;
  currentPage: number;
  sizePage: number;
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  banner_url?: string | null;
  thumbnail_url?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  seo?: CollectionSeo;
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  banner_url?: string | null;
  thumbnail_url?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  seo?: CollectionSeo;
}
