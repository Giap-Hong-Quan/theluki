export interface IBanner {
  _id: string;
  image: string;
  position: "home_hero" | "popup";
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IActiveBanners {
  home_hero: IBanner | null;
  popup: IBanner | null;
}

export interface GetBannersParams {
  position?: "home_hero" | "popup";
  isActive?: boolean;
}

export interface GetBannersResponse {
  banners: IBanner[];
  totalBanner: number;
  totalHomeHero: number;
  totalPopup: number;
}
