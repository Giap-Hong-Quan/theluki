import axiosClient from "@/services/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";
import { ICart } from "@/types/cartType";

export interface AddToCartPayload {
  productId: string;
  variantId: string;
  sizeId: string;
  quantity: number;
}

export interface UpdateQuantityPayload {
  itemId: string;
  quantity: number;
}

export interface ToggleSelectPayload {
  itemId?: string;
  isSelected?: boolean;
  selectAll?: boolean;
}

export interface RemoveItemPayload {
  itemId: string;
}

export const cartService = {
  getCart: async () => {
    return axiosClient.get<{ data: ICart }>(API_ENDPOINTS.CART.GET);
  },
  addToCart: async (payload: AddToCartPayload) => {
    return axiosClient.post(API_ENDPOINTS.CART.ADD, payload);
  },
  updateQuantity: async (payload: UpdateQuantityPayload) => {
    return axiosClient.put(API_ENDPOINTS.CART.UPDATE_QUANTITY, payload);
  },
  toggleSelect: async (payload: ToggleSelectPayload) => {
    return axiosClient.put(API_ENDPOINTS.CART.TOGGLE_SELECT, payload);
  },
  removeItem: async (payload: RemoveItemPayload) => {
    return axiosClient.delete(API_ENDPOINTS.CART.REMOVE, { data: payload });
  },
  clearCart: async () => {
    return axiosClient.delete(API_ENDPOINTS.CART.CLEAR);
  },
};
