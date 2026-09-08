import { IProduct } from "./productType";

export interface ICartItem {
  _id: string;
  product: IProduct | { _id: string; slug?: string; name?: string; images?: string[]; variants?: any[] } | string;
  name: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  price: number;
  thumbnail?: string;
  isSelected: boolean;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  selectedItems: number;
  selectedTotalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
