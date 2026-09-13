"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Phone,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useOrderDetail, useCancelOrder } from "@/hooks/useOrder";
import {
  ORDER_STATUS_CONFIG,
  SHIPPING_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  OrderStatus,
} from "@/constants/orderStatus";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

const PROGRESS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "PENDING", label: "Đặt hàng", desc: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đóng gói", desc: "Shop chuẩn bị hàng" },
  { key: "SHIPPING", label: "Vận chuyển", desc: "Bưu tá đang giao" },
  { key: "DELIVERED", label: "Đã giao", desc: "Hoàn tất đơn hàng" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = String(params?.orderCode || "").toUpperCase();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Đổi ý không còn nhu cầu mua nữa");

  const { data: rawData, isLoading, isError, refetch } = useOrderDetail(orderCode);
  const cancelMutation = useCancelOrder();

  // Trích xuất order object từ response (hỗ trợ cả { data } lẫn object trực tiếp)
  const order = (rawData as any)?.data || rawData;

  const handleCopy = (text: string, type: "code" | "tracking") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      toast.success("Đã sao chép mã đơn hàng");
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedTracking(true);
      toast.success("Đã sao chép mã vận đơn");
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleConfirmCancel = () => {
    if (!orderCode) return;
    cancelMutation.mutate(
      { orderCode, reason: cancelReason },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
          refetch();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center py-20 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-zinc-900" />
        <p className="text-xs font-semibold uppercase tracking-wider">
          Đang tải thông tin đơn hàng #{orderCode}...
        </p>
      </div>
    );
  }

  if (isError || !order || !order.orderCode) {
    return (
      <div className="min-h-screen bg-zinc-50 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white border border-zinc-200 p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
            Không tìm thấy đơn hàng #{orderCode}
          </h2>
          <p className="text-xs text-zinc-500 mt-2 mb-6">
            Đơn hàng không tồn tại hoặc bạn không có quyền truy cập vào đơn hàng này.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/orders"
              className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
            >
              Về Danh Sách Đơn Hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderStatus = (order.orderStatus as OrderStatus) || "PENDING";
  const statusCfg = ORDER_STATUS_CONFIG[orderStatus] || {
    label: orderStatus,
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dotClass: "bg-zinc-400",
    description: "",
    stepIndex: 1,
  };

  const shippingStatus = order.shippingInfo?.status;
  const shippingCfg = shippingStatus
    ? SHIPPING_STATUS_CONFIG[shippingStatus as keyof typeof SHIPPING_STATUS_CONFIG]
    : null;

  const paymentStatus = order.paymentInfo?.status;
  const paymentCfg = paymentStatus
    ? PAYMENT_STATUS_CONFIG[paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG]
    : null;

  const isCancelled = orderStatus === "CANCELLED";
  const isCancellable = orderStatus === "PENDING" || orderStatus === "PROCESSING";

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* HEADER ĐIỀU HƯỚNG */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Danh sách đơn hàng</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-900 uppercase">
              #{order.orderCode}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(order.orderCode, "code")}
              className="text-zinc-400 hover:text-black transition-colors"
              title="Sao chép mã"
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* BANNER THÔNG TIN TRẠNG THÁI */}
        <div className="bg-white border border-zinc-200 p-5 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Trạng thái đơn:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider border ${statusCfg.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                  <span>{statusCfg.label}</span>
                </span>
                {shippingCfg && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold border ${shippingCfg.badgeClass}`}
                  >
                    <Truck className="w-3 h-3" />
                    <span>{shippingCfg.label}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {isCancelled
                  ? `Đơn hàng đã hủy. Lý do: ${order.cancelReason || "Người mua hủy đơn"}`
                  : statusCfg.description}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">
                Ngày đặt hàng
              </span>
              <span className="text-xs font-medium text-zinc-700">{orderDate}</span>
            </div>
          </div>

          {/* STEPPER TIẾN TRÌNH ĐƠN HÀNG (NẾU KHÔNG BỊ HỦY) */}
          {!isCancelled ? (
            <div className="pt-6">
              <div className="grid grid-cols-4 gap-2 relative">
                {PROGRESS_STEPS.map((step, idx) => {
                  const currentIdx = statusCfg.stepIndex || 1;
                  const isDone = currentIdx > idx + 1;
                  const isCurrent = currentIdx === idx + 1;

                  return (
                    <div key={step.key} className="text-center relative">
                      {/* Circle icon */}
                      <div
                        className={`w-9 h-9 mx-auto rounded-none flex items-center justify-center text-xs font-bold transition-all border ${
                          isDone
                            ? "bg-black text-white border-black"
                            : isCurrent
                            ? "bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-400 ring-offset-2"
                            : "bg-zinc-100 text-zinc-400 border-zinc-200"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <p
                        className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                          isCurrent || isDone ? "text-zinc-900" : "text-zinc-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-zinc-500 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* BANNER ĐÃ HỦY */
            <div className="mt-5 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong className="block font-bold uppercase">Đơn hàng đã được hủy</strong>
                <p className="mt-0.5 text-rose-700">
                  Lý do hủy: {order.cancelReason || "Không có thông tin lý do"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* NỘI DUNG CHÍNH: 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT TRÁI (2/3): DANH SÁCH SẢN PHẨM & TIMELINE */}
          <div className="lg:col-span-2 space-y-6">
            {/* DANH SÁCH SẢN PHẨM */}
            <div className="bg-white border border-zinc-200 shadow-sm">
              <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Sản phẩm trong kiện ({order.items?.length || 0})</span>
                </h3>
              </div>

              <div className="divide-y divide-zinc-100">
                {order.items?.map((item: any, idx: number) => (
                  <div
                    key={item.variantId || idx}
                    className="p-4 sm:p-5 flex items-center gap-4"
                  >
                    <div className="w-16 h-20 bg-zinc-100 flex-shrink-0 border border-zinc-200 overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        {item.color && (
                          <span>
                            Màu: <strong className="text-zinc-700">{item.color}</strong>
                          </span>
                        )}
                        {item.color && item.size && <span>•</span>}
                        {item.size && (
                          <span>
                            Size: <strong className="text-zinc-700">{item.size}</strong>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Số lượng: x{item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-mono font-bold text-zinc-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] font-mono text-zinc-400">
                          {formatPrice(item.price)} / cái
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LỊCH SỬ THAY ĐỔI TRẠNG THÁI (TIMELINE) */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white border border-zinc-200 p-5 sm:p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Nhật ký đơn hàng</span>
                </h3>

                <div className="relative pl-6 border-l border-zinc-200 space-y-4 text-xs">
                  {order.timeline.map((evt: any, idx: number) => {
                    const evtDate = evt.updatedAt
                      ? new Date(evt.updatedAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "";

                    return (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-zinc-900">
                            {evt.status}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {evtDate}
                          </span>
                        </div>
                        {evt.note && (
                          <p className="text-zinc-600 mt-0.5">{evt.note}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (1/3): ĐỊA CHỈ, VẬN CHUYỂN & THANH TOÁN */}
          <div className="space-y-6">
            {/* THÔNG TIN NHẬN HÀNG */}
            <div className="bg-white border border-zinc-200 p-5 shadow-sm text-xs">
              <h3 className="font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100">
                <MapPin className="w-4 h-4" />
                <span>Địa chỉ nhận hàng</span>
              </h3>

              <div className="space-y-2">
                <p className="font-bold text-zinc-900 text-sm">
                  {order.shippingAddress?.receiverName}
                </p>
                <p className="font-mono text-zinc-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  {order.shippingAddress?.receiverPhone}
                </p>
                <p className="text-zinc-600 leading-relaxed">
                  {order.shippingAddress?.detailAddress},{" "}
                  {order.shippingAddress?.ward},{" "}
                  {order.shippingAddress?.district},{" "}
                  {order.shippingAddress?.province}
                </p>
                {order.shippingAddress?.note && (
                  <p className="text-amber-700 bg-amber-50 p-2 border border-amber-200 mt-2">
                    <strong>Ghi chú:</strong> {order.shippingAddress.note}
                  </p>
                )}
              </div>

              {/* VẬN CHUYỂN */}
              <div className="mt-4 pt-3 border-t border-zinc-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Đơn vị vận chuyển
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900">
                    {order.shippingInfo?.carrier || "ViettelPost"}
                  </span>
                  {shippingCfg && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${shippingCfg.badgeClass}`}
                    >
                      {shippingCfg.label}
                    </span>
                  )}
                </div>

                {/* MÃ VẬN ĐƠN NẾU CÓ */}
                {order.shippingInfo?.trackingCode && (
                  <div className="mt-2.5 p-2 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase block font-semibold">
                        Mã vận đơn ViettelPost:
                      </span>
                      <span className="font-mono font-bold text-zinc-900">
                        {order.shippingInfo.trackingCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(order.shippingInfo.trackingCode!, "tracking")
                      }
                      className="p-1 text-zinc-500 hover:text-black transition-colors"
                      title="Sao chép"
                    >
                      {copiedTracking ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* THÔNG TIN THANH TOÁN */}
            <div className="bg-white border border-zinc-200 p-5 shadow-sm text-xs">
              <h3 className="font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100">
                <CreditCard className="w-4 h-4" />
                <span>Phương thức thanh toán</span>
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase text-zinc-900 block">
                    {order.paymentInfo?.method === "COD"
                      ? "Thanh toán khi nhận hàng (COD)"
                      : order.paymentInfo?.method}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {order.paymentInfo?.method === "COD"
                      ? "Thu tiền mặt khi bưu tá giao hàng"
                      : "Thanh toán trực tuyến"}
                  </span>
                </div>

                {paymentCfg && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${paymentCfg.badgeClass}`}
                  >
                    {paymentCfg.label}
                  </span>
                )}
              </div>
            </div>

            {/* BẢNG TÍNH TIỀN */}
            <div className="bg-white border border-zinc-200 p-5 shadow-sm text-xs space-y-2.5">
              <h3 className="font-bold uppercase tracking-wider text-zinc-900 pb-3 mb-3 border-b border-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Chi tiết thanh toán</span>
              </h3>

              <div className="flex justify-between text-zinc-600">
                <span>Tiền hàng tạm tính:</span>
                <span className="font-mono">
                  {formatPrice(order.financials?.itemsSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Phí vận chuyển:</span>
                <span className="font-mono">
                  {order.financials?.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase">
                      Miễn phí
                    </span>
                  ) : (
                    formatPrice(order.financials?.shippingFee)
                  )}
                </span>
              </div>

              {Number(order.financials?.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>
                    Giảm giá {order.coupon?.code ? `(${order.coupon.code})` : ""}:
                  </span>
                  <span className="font-mono">
                    -{formatPrice(order.financials?.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-zinc-200 text-sm font-bold">
                <span className="uppercase text-zinc-900">Tổng thanh toán:</span>
                <span className="font-mono text-base text-zinc-900">
                  {formatPrice(order.financials?.finalAmount)}
                </span>
              </div>
            </div>

            {/* HÀNH ĐỘNG */}
            <div className="space-y-2">
              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full py-2.5 border border-rose-300 hover:border-rose-600 text-rose-600 hover:text-rose-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Hủy đơn hàng này
                </button>
              )}

              <Link
                href="/product"
                className="w-full block py-2.5 bg-black hover:bg-zinc-800 text-white text-center text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL HỦY ĐƠN HÀNG */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full p-6 border border-zinc-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Hủy đơn #{order.orderCode}
              </h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-zinc-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-zinc-600">
                Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi hủy không thể khôi phục lại đơn hàng.
              </p>

              <div>
                <label className="block font-semibold uppercase text-zinc-600 mb-1">
                  Lý do hủy:
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2 border border-zinc-300 focus:border-black outline-none"
                  placeholder="Nhập lý do hủy..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 border border-zinc-300 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:border-black transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancelMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Xác nhận hủy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
