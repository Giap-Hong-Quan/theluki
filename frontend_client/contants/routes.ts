/**
 * Cấu hình đường dẫn và phân quyền (Routing Config)
 */
export const ROUTE_CONFIG = {
  // Trang Auth: Chỉ cho khách chưa đăng nhập (đã login -> về trang chủ '/')
  AUTH_ROUTES: [
    "/login",
    "/register",
    "/forgot-password",
  ],

  // Trang Private: Yêu cầu bắt buộc đăng nhập (chưa login -> về '/login')
  PRIVATE_ROUTES: [
    "/profile",
    "/checkout",
    "/orders",
    "/wishlist",
    "/settings",
  ],

  // Trang Admin: Yêu cầu đăng nhập và có role 'admin'
  ADMIN_ROUTES: [
    "/admin",
  ],

  // Đường dẫn điều hướng mặc định
  DEFAULT_LOGIN_REDIRECT: "/",
  LOGIN_PATH: "/login",
};
