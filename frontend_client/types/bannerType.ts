import { ICollection } from "./collectionType";

export interface IBanner {
  _id: string;
  title: string;
  subtitle?: string;
  collection_id: ICollection;
  custom_image?: string | null;
  position: "home_hero" | "home_sub" | "popup";
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBannersParams {
  page?: number;
  sizePage?: number;
  position?: "home_hero" | "home_sub" | "popup";
  isActive?: boolean;
  search?: string;
}

export interface GetBannersResponse {
  banners: IBanner[];
  totalBanner: number;
  totalPage: number;
  currentPage: number;
  sizePage: number;
}
