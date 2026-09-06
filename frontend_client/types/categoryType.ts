export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string | null;
  order?: number;
  isActive?: boolean;
  productCount?: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetCategoriesParams {
  search?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface GetCategoriesResponse {
  categories: ICategory[];
  totalCategory: number;
}
