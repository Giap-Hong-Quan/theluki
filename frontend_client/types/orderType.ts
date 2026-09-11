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
  serviceCode: "STANDARD" | "VTK" | "VCN" | string;
  serviceName: string;
  fee: number;
  deliveryTime: string;
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

export interface OrderResponse {
  _id: string;
  orderCode: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddressInput;
  shippingInfo: {
    carrier: string;
    shippingFee: number;
    codAmount: number;
    serviceCode: string;
  };
  financials: {
    itemsSubtotal: number;
    shippingFee: number;
    discountAmount: number;
    finalAmount: number;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}
