export const formatPrice = (price?: number | null) => {
  return new Intl.NumberFormat("vi-VN").format(price ?? 0) + "đ";
};