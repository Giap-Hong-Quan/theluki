export interface ICollection {
  _id: string;
  name: string;
  slug: string;
  noAccentName?: string;
  description?: string;
  banner_url?: string;
  thumbnail_url?: string;
  products?: any[];
  order?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCollectionsParams {
  page?: number;
  sizePage?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
}

export interface GetCollectionsResponse {
  collections: ICollection[];
  totalCollection: number;
  totalPage: number;
  currentPage: number;
  sizePage: number;
}
