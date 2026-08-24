// Khai báo tập trung toàn bộ đường dẫn API của Backend
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    PROFILE: "/auth/profile",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    GOOGLE: "/auth/google",
    FACEBOOK: "/auth/facebook",
  },
  PRODUCTS: {
    GET_ALL: "/product",
    GET_BY_SLUG: (slug: string) => `/product/slug/${slug}`,
    GET_BY_ID: (id: string) => `/product/${id}`,
  },
  CATEGORIES: {
    GET_ALL: "/category",
    GET_BY_ID: (id: string) => `/category/${id}`,
  },
  COLLECTIONS: {
    GET_ALL: "/collection",
    GET_BY_SLUG: (slug: string) => `/collection/slug/${slug}`,
    GET_BY_ID: (id: string) => `/collection/${id}`,
  },
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/items",
    UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`,
    CLEAR: "/cart/clear",
  },
  ORDERS: {
    CREATE: "/order",
    GET_MY_ORDERS: "/order/my-orders",
    GET_DETAIL: (id: string) => `/order/${id}`,
    CANCEL: (id: string) => `/order/${id}/cancel`,
  },
  USERS: {
    UPDATE_PROFILE: "/user/profile",
    GET_ADDRESSES: "/user/addresses",
  },
} as const;