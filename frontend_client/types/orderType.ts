export interface ShippingAddressInput {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
  note?: string;
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddressInput;
  paymentMethod: "COD" | "SEPAY" | "MOMO" | "VNPAY";
  shippingService?: "STANDARD" | "VCN" | "VTK" | string;
  couponCode?: string;
  note?: string;
}

export interface CalculateFeePayload {
  shippingAddress: {
    province: string;
    district: string;
    ward: string;
    detailAddress?: string;
  };
  weight?: number;
  productPrice?: number;
  codAmount?: number;
}

export interface ShippingFeeOption {
  fee: number;
  isSameProvince?: boolean;
  serviceCode?: string;
  serviceName?: string;
  deliveryTime?: string;
}

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
  updatedAt: string;
}

export interface OrderResponse {
  _id: string;
  orderCode: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddressInput;
  shippingInfo: {
    carrier: string;
    trackingCode?: string | null;
    status: string;
    shippingFee: number;
    codAmount: number;
    estimatedDeliveryDate?: string | null;
  };
  paymentInfo: {
    method: "COD" | "SEPAY" | "MOMO" | "VNPAY" | "ESCROW" | string;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
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
  orderStatus:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "RETURNED"
    | string;
  timeline?: OrderTimeline[];
  note?: string;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyOrdersResponse {
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}
