export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED";

export type ShippingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKING"
  | "SHIPPING"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    description: string;
    stepIndex: number;
  }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
    description: "Đơn hàng đã được đặt và đang chờ hệ thống xử lý",
    stepIndex: 1,
  },
  PROCESSING: {
    label: "Đang đóng gói",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    description: "Shop đang kiểm tra tồn kho và đóng gói kiện hàng",
    stepIndex: 2,
  },
  SHIPPING: {
    label: "Đang giao hàng",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    dotClass: "bg-purple-500",
    description: "Bưu tá ViettelPost đang vận chuyển kiện hàng đến bạn",
    stepIndex: 3,
  },
  DELIVERED: {
    label: "Đã giao hàng",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    description: "Kiện hàng đã được giao thành công tới người nhận",
    stepIndex: 4,
  },
  COMPLETED: {
    label: "Hoàn tất",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dotClass: "bg-emerald-600",
    description: "Đơn hàng hoàn tất và khép lại",
    stepIndex: 5,
  },
  CANCELLED: {
    label: "Đã hủy",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-500",
    description: "Đơn hàng đã bị hủy",
    stepIndex: 0,
  },
  RETURNED: {
    label: "Chuyển hoàn",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dotClass: "bg-zinc-400",
    description: "Kiện hàng được chuyển hoàn về kho của shop",
    stepIndex: 0,
  },
};

export const SHIPPING_STATUS_CONFIG: Record<
  ShippingStatus,
  {
    label: string;
    badgeClass: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Chờ lấy hàng",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    description: "Đang chuẩn bị kiện hàng cho bưu tá",
  },
  CONFIRMED: {
    label: "Đã tiếp nhận",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "ViettelPost đã tiếp nhận thông tin bưu gửi",
  },
  PICKING: {
    label: "Đang lấy hàng",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Bưu tá đang di chuyển tới kho shop để nhận hàng",
  },
  SHIPPING: {
    label: "Đang vận chuyển",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Kiện hàng đang luân chuyển qua các trung tâm khai thác",
  },
  DELIVERED: {
    label: "Giao thành công",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Bưu tá đã phát bưu gửi thành công",
  },
  FAILED: {
    label: "Giao thất bại",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Không liên lạc được người nhận hoặc hẹn lại ngày giao",
  },
  RETURNED: {
    label: "Đã chuyển hoàn",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    description: "Gói hàng đã trả lại về kho shop",
  },
  CANCELLED: {
    label: "Đã hủy vận đơn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Vận đơn bưu phẩm đã hủy",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    badgeClass: string;
  }
> = {
  PENDING: {
    label: "Chưa thanh toán",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Đã thanh toán",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  FAILED: {
    label: "Thanh toán lỗi",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
};
