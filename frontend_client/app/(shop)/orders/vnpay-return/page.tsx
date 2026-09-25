"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

function VnpayReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<{
    isSuccess: boolean;
    orderCode: string;
    amount: number;
    transactionNo: string;
    bankCode: string;
    responseCode: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode") || "";
    const orderCode = searchParams.get("vnp_TxnRef") || "";
    const rawAmount = searchParams.get("vnp_Amount") || "0";
    const transactionNo = searchParams.get("vnp_TransactionNo") || "";
    const bankCode = searchParams.get("vnp_BankCode") || "";

    const isSuccess = responseCode === "00";
    const amount = Number(rawAmount) / 100;

    let message = "Giao dịch thành công";
    if (!isSuccess) {
      if (responseCode === "24") {
        message = "Giao dịch bị hủy bởi khách hàng";
      } else if (responseCode === "51") {
        message = "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch";
      } else {
        message = `Giao dịch không thành công (Mã lỗi: ${responseCode})`;
      }
    }

    setResult({
      isSuccess,
      orderCode,
      amount,
      transactionNo,
      bankCode,
      responseCode,
      message,
    });
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading || !result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 font-mono text-xs">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-600">Đang đối soát kết quả thanh toán từ VNPAY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white border border-zinc-200 shadow-xl p-6 md:p-8 space-y-6">
        {/* Header trạng thái */}
        <div className="text-center space-y-3">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              result.isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            }`}
          >
            {result.isSuccess ? (
              <CheckCircle2 className="w-9 h-9 stroke-[2]" />
            ) : (
              <AlertCircle className="w-9 h-9 stroke-[2]" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-lg font-black uppercase tracking-tight text-zinc-900 font-sans">
              {result.isSuccess ? "Thanh Toán VNPAY Thành Công!" : "Thanh Toán Không Thành Công"}
            </h1>
            <p className="text-xs text-zinc-500 font-sans">{result.message}</p>
          </div>
        </div>

        {/* Bảng chi tiết hóa đơn */}
        <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between pb-2 border-b border-zinc-200">
            <span className="text-zinc-500 uppercase">Mã đơn hàng:</span>
            <span className="font-bold text-zinc-900">{result.orderCode || "N/A"}</span>
          </div>

          <div className="flex justify-between pb-2 border-b border-zinc-200">
            <span className="text-zinc-500 uppercase">Cổng thanh toán:</span>
            <span className="font-bold text-zinc-800">VNPAY {result.bankCode ? `(${result.bankCode})` : ""}</span>
          </div>

          {result.transactionNo && (
            <div className="flex justify-between pb-2 border-b border-zinc-200">
              <span className="text-zinc-500 uppercase">Mã GD VNPAY:</span>
              <span className="text-zinc-700">{result.transactionNo}</span>
            </div>
          )}

          <div className="flex justify-between pt-1">
            <span className="text-zinc-500 uppercase font-bold">Số tiền:</span>
            <span className="font-bold text-base text-zinc-950">{formatPrice(result.amount)}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="space-y-2.5 pt-2">
          {result.orderCode && (
            <Link
              href={`/orders/${result.orderCode}`}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Xem Chi Tiết Đơn Hàng</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/orders"
            className="w-full py-2.5 border border-zinc-300 hover:border-black text-zinc-800 hover:bg-zinc-50 text-center text-xs font-bold uppercase tracking-wider block transition-colors cursor-pointer"
          >
            Quản Lý Danh Sách Đơn Hàng
          </Link>

          <Link
            href="/"
            className="w-full py-2 text-center text-[11px] font-semibold text-zinc-500 hover:text-black uppercase tracking-wider block transition-colors"
          >
            Tiếp Tục Mua Sắm
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-mono pt-2 border-t border-zinc-100">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
          <span>Giao dịch được bảo vệ và mã hóa 256-bit SSL</span>
        </div>
      </div>
    </div>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-xs">
          Đang tải dữ liệu kết quả...
        </div>
      }
    >
      <VnpayReturnContent />
    </Suspense>
  );
}
