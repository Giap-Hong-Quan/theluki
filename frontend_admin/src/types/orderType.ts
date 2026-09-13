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

export interface OrderItem {
  product: string;
  variantId?: string;
  sizeId?: string;
  name: string;
  color?: string;
  size?: string;
  sku?: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface OrderTimeline {
  type: "ORDER" | "PAYMENT" | "SHIPPING";
  status: string;
  note?: string;
  updatedBy?: string | null;
  updatedAt: string;
}

export interface OrderAdminItem {
  _id: string;
  orderCode: string;
  user: any;
  items: OrderItem[];
  shippingAddress: {
    receiverName: string;
    receiverPhone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    note?: string;
  };
  shippingInfo: {
    carrier: string;
    trackingCode?: string | null;
    status: ShippingStatus | string;
    shippingFee: number;
    codAmount: number;
    estimatedDeliveryDate?: string | null;
  };
  paymentInfo: {
    method: "COD" | "SEPAY" | "MOMO" | "VNPAY" | "ESCROW" | string;
    status: PaymentStatus;
    transactionId?: string | null;
    paidAt?: string | null;
  };
  financials: {
    itemsSubtotal: number;
    shippingFee: number;
    discountAmount: number;
    finalAmount: number;
  };
  coupon?: {
    code: string;
    discountAmount: number;
  };
  orderStatus: OrderStatus;
  timeline?: OrderTimeline[];
  note?: string;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetOrdersQueryParams {
  page?: number;
  limit?: number;
  sizePage?: number;
  status?: string;
  shippingStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  carrier?: string;
  province?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalPending: number;
  totalProcessing: number;
  totalShipping: number;
  totalDelivered: number;
  totalCancelled: number;
  totalRevenue: number;
}

export interface OrdersApiResponse {
  orders: OrderAdminItem[];
  total: number;
  page: number;
  limit: number;
  stats?: OrderStats;
}
