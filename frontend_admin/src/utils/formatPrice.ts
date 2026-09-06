export const formatPrice = (
  price?: number | null,
  showCurrency: boolean = true
): string => {
  if (!showCurrency) {
    return new Intl.NumberFormat("vi-VN").format(price ?? 0);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price ?? 0);
};

export default formatPrice;