import axiosClient from "@/services/axios-client";

export interface CreatePaymentPayload {
  orderCode: string;
  paymentMethod: "VNPAY" | "MOMO" | "SEPAY" | "COD";
  bankCode?: string;
}

export interface PaymentResponse {
  paymentMethod: "VNPAY" | "MOMO" | "SEPAY" | "COD";
  actionType: "REDIRECT" | "QR_MODAL" | "NONE";
  paymentUrl?: string;
  shortLink?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  orderCode: string;
  amount: number;
  transactionId?: string;
  expireDate?: string;
  qrInfo?: {
    qrUrl: string;
    backupQrUrl: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: string;
  };
  message?: string;
}

export const paymentService = {
  createPayment: (
    payload: CreatePaymentPayload
  ): Promise<{ success: boolean; data: PaymentResponse; message?: string }> => {
    return axiosClient.post("/payment/create", payload);
  },

  verifyVnpayReturn: (params: Record<string, any>) => {
    return axiosClient.get("/payment/vnpay/return", { params });
  },
};

export default paymentService;
