import {
  Package,
  Bell,
  Heart,
  Settings,
  MapPin,
  Ticket,
  LucideIcon,
} from "lucide-react";

export interface UserMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  hasDivider?: boolean;
}

export interface NavLinkItem {
  href: string;
  title: string;
}

export interface PriceRangeTag {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

// 1. Danh sách menu tài khoản người dùng
export const USER_MENU_ITEMS: UserMenuItem[] = [
  {
    href: "/orders",
    label: "Quản lý đơn hàng",
    icon: Package,
  },
  {
    href: "/notifications",
    label: "Thông báo",
    icon: Bell,
  },
  {
    href: "/wishlist",
    label: "Sản phẩm yêu thích",
    icon: Heart,
  },
  {
    href: "/profile",
    label: "Thông tin tài khoản",
    icon: Settings,
    hasDivider: true,
  },
  {
    href: "/addresses",
    label: "Sổ địa chỉ",
    icon: MapPin,
  },
  {
    href: "/vouchers",
    label: "Ví voucher",
    icon: Ticket,
  },
];

// 2. Danh sách trang trong menu Giới thiệu
export const INTRODUCE_LINKS: NavLinkItem[] = [
  { href: "/introduce/about-us", title: "About us" },
  { href: "/introduce/membership", title: "Membership" },
  { href: "/introduce/recruitment", title: "Tuyển dụng" },
  { href: "/introduce/faq", title: "FAQ" },
];

// 3. Danh sách các khoảng giá phổ biến cho Search Drawer
export const POPULAR_PRICE_RANGES: PriceRangeTag[] = [
  { label: "Dưới 300.000₫", maxPrice: 300000 },
  { label: "300.000₫ — 500.000₫", minPrice: 300000, maxPrice: 500000 },
  { label: "500.000₫ — 800.000₫", minPrice: 500000, maxPrice: 800000 },
  { label: "Trên 800.000₫", minPrice: 800000 },
];

// 4. Cấu hình các cột liên kết trong Footer
export const FOOTER_SECTIONS = [
  {
    title: "Sản phẩm & Bộ sưu tập",
    links: [
      { href: "/product", label: "Tất cả sản phẩm" },
      { href: "/collection", label: "Bộ sưu tập mới nhất" },
      { href: "/product?category=ao", label: "Áo thiết kế" },
      { href: "/product?category=quan", label: "Quần & Chân váy" },
      { href: "/product?category=dam", label: "Đầm & Váy cao cấp" },
      { href: "/sale", label: "Ưu đãi đặc biệt" },
    ],
  },
  {
    title: "Về THE LUKI",
    links: [
      { href: "/introduce/about-us", label: "Câu chuyện thương hiệu" },
      { href: "/introduce/membership", label: "Chính sách thành viên" },
      { href: "/introduce/recruitment", label: "Tuyển dụng & Sự nghiệp" },
      { href: "/introduce/faq", label: "Câu hỏi thường gặp" },
      { href: "/blog", label: "Tạp chí thời trang (Journal)" },
    ],
  },
  {
    title: "Chính sách & Dịch vụ",
    links: [
      { href: "/policies/sales", label: "Chính sách mua hàng" },
      { href: "/policies/shipping", label: "Vận chuyển & Giao nhận" },
      { href: "/policies/refund", label: "Đổi trả hàng trong 7 ngày" },
      { href: "/policies/privacy", label: "Bảo mật thông tin" },
      { href: "/policies/payment", label: "Hướng dẫn thanh toán" },
    ],
  },
];
