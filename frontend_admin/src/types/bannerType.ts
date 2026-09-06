export interface BannerItem {
  _id: string;
  image: string;
  position: "home_hero" | "popup";
  isActive: boolean;
  createdBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  } | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetBannersQueryParams {
  position?: "home_hero" | "popup";
  isActive?: boolean;
}

export interface GetBannersData {
  banners: BannerItem[];
  totalBanner: number;
  totalHomeHero: number;
  totalPopup: number;
}

export interface CreateBannerPayload {
  image: string;
  position: "home_hero" | "popup";
  isActive?: boolean;
}

export interface UpdateBannerPayload {
  image?: string;
  position?: "home_hero" | "popup";
  isActive?: boolean;
}
