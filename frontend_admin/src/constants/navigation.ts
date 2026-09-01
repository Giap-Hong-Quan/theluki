export interface MenuItem {
  title: string;
  path: string;
  badge?: number | string;
  exact?: boolean;
}
export interface MenuGroup {
  groupTitle: string;
  items: MenuItem[];
}
export const SIDEBAR_MENU: MenuGroup[] = [
  {
    groupTitle: "TỔNG QUAN",
    items: [
      { title: "Bảng điều khiển", path: "/", exact: true },
      { title: "Báo cáo & Excel", path: "/reports" },
    ],
  },
  {
    groupTitle: "BÁN HÀNG",
    items: [
      { title: "Đơn hàng", path: "/orders", badge: 18 },
    //   { title: "Chi tiết đơn hàng", path: "/orders/detail" },
    { title: "Bán tại quầy (POS)", path: "/pos" },
      { title: "Đổi trả & hoàn tiền", path: "/returns", badge: 6 },
    ],
  },
  {
    groupTitle: "KHÁCH HÀNG",
    items: [
      { title: "Danh sách khách hàng", path: "/customers" },
    //   { title: "Chi tiết khách hàng", path: "/customers/detail" },
      { title: "Hộp thư CSKH", path: "/cskh", badge: 12 },
    ],
  },
  {
    groupTitle: "SẢN PHẨM",
    items: [
      { title: "Sản phẩm & biến thể", path: "/products" },
      // { title: "Sửa sản phẩm", path: "/products/edit" },
      { title: "Bộ sưu tập", path: "/collections" },
      { title: "Danh mục", path: "/categories" },
      { title: "Tồn kho & nhập hàng", path: "/inventory", badge: 42 },
      { title: "Đánh giá & bình luận", path: "/reviews", badge: 34 },
    ],
  },
  {
    groupTitle: "MARKETING",
    items: [
      { title: "Mã giảm giá", path: "/coupons" },
      { title: "Chiến dịch khuyến mãi", path: "/campaigns" },
      { title: "Email Marketing", path: "/email-marketing" },
      { title: "Banner", path: "/banners" },
      { title: "Bài viết", path: "/blogs" },
      { title: "Tự động hóa", path: "/automation" },
    ],
  },
  {
    groupTitle: "CẤU HÌNH HỆ THỐNG",
    items: [
      { title: "Cài đặt", path: "/settings" },
      { title: "Quản lý người dùng", path: "/users" },
      { title: "Quản lý vai trò", path: "/roles" },
      { title: "Nhật ký hệ thống", path: "/logs" },
    ],
  },
];