import axiosClient from "@/services/axios-client";
import { API_ENDPOINTS } from "@/contants/api-endpoint";

export interface AddToCartPayload {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export const cartService = {
  getCart: async () => {
    return axiosClient.get(API_ENDPOINTS.CART.GET);
  },
  addToCart: async (payload: AddToCartPayload) => {
    return axiosClient.post("/cart/add", payload);
  },
};
