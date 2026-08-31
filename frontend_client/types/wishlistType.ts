import { IProduct } from "./productType";

export interface IToggleWishlistResponse {
  isFavorite: boolean;
  productId: string;
  totalWishlist: number;
}

export interface IWishlistState {
  items: IProduct[];
  total: number;
}
