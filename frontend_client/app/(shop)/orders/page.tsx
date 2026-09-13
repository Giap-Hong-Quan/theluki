"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useMyOrders, useCancelOrder } from "@/hooks/useOrder";
import {
  ORDER_STATUS_CONFIG,
  SHIPPING_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  OrderStatus,
} from "@/constants/orderStatus";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

// Các tab lọc trạng thái
const STATUS_TABS: { label: string; value: string; countKey?: string }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Đang đóng gói", value: "PROCESSING" },
  { label: "Đang vận chuyển", value: "SHIPPING" },
  { label: "Đã giao hàng", value: "DELIVERED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

// Các lý do hủy mẫu
const CANCEL_REASONS = [
  "Tôi muốn thay đổi địa chỉ nhận hàng",
  "Tôi muốn đổi sản phẩm / kích cỡ / màu sắc",
  "Tìm thấy giá tốt hơn ở nơi khác",
  "Thời gian giao hàng dự kiến quá lâu",
  "Đổi ý không còn nhu cầu mua nữa",
  "Lý do khác",
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal hủy đơn
  const [cancellingOrderCode, setCancellingOrderCode] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  const cancelMutation = useCancelOrder();

  // Gọi API lấy danh sách đơn hàng
  const { data: rawData, isLoading, isError, refetch } = useMyOrders({
    limit: 50,
    status: activeTab !== "ALL" ? activeTab : undefined,
  });

  // Trích xuất mảng orders từ response (hỗ trợ cả { data: { orders } } lẫn { orders })
  const orders = useMemo(() => {
    const list =
      (rawData as any)?.data?.orders ||
      (rawData as any)?.orders ||
      (Array.isArray((rawData as any)?.data) ? (rawData as any)?.data : []);
    return Array.isArray(list) ? list : [];
  }, [rawData]);

  // Lọc theo search query (mã đơn hàng hoặc tên sản phẩm)
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order: any) => {
      const matchCode = order.orderCode?.toLowerCase().includes(q);
      const matchProduct = order.items?.some((it: any) =>
        it.name?.toLowerCase().includes(q)
      );
      const matchReceiver = order.shippingAddress?.receiverName
        ?.toLowerCase()
        .includes(q);
      return matchCode || matchProduct || matchReceiver;
    });
  }, [orders, searchQuery]);

  // Copy mã đơn hàng
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Đã sao chép mã đơn #${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Xác nhận hủy đơn
  const handleConfirmCancel = () => {
    if (!cancellingOrderCode) return;
    const finalReason =
      cancelReason === "Lý do khác" && customReason.trim()
        ? customReason.trim()
        : cancelReason;

    cancelMutation.mutate(
      { orderCode: cancellingOrderCode, reason: finalReason },
      {
        onSuccess: () => {
          setCancellingOrderCode(null);
          setCustomReason("");
          refetch();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* HEADER TRANG */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                <Link href="/" className="hover:text-black transition-colors">
                  Trang chủ
                </Link>
                <span>/</span>
                <span className="text-zinc-900">Đơn hàng của tôi</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
                Quản Lý Đơn Hàng
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Theo dõi tiến trình vận chuyển và lịch sử mua sắm của bạn tại THE LUKI
              </p>
            </div>

            {/* Ô tìm kiếm đơn hàng */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn, tên sản phẩm..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-100 border border-transparent focus:border-black focus:bg-white text-xs outline-none transition-all placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-black uppercase font-bold"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          {/* TABS LỌC TRẠNG THÁI */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-100">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? "border-black text-black bg-zinc-50"
                      : "border-transparent text-zinc-500 hover:text-black hover:border-zinc-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-zinc-800" />
            <p className="text-xs font-semibold uppercase tracking-wider">
              Đang tải danh sách đơn hàng...
            </p>
          </div>
        ) : isError ? (
          <div className="py-16 bg-white border border-rose-200 p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-500 mb-2" />
            <p className="text-xs font-bold text-zinc-900 uppercase">
              Không thể tải danh sách đơn hàng
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng thử lại.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* TRẠNG THÁI TRỐNG */
          <div className="py-20 bg-white border border-zinc-200 text-center px-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery
                ? `Không tìm thấy đơn hàng nào khớp với "${searchQuery}".`
                : activeTab !== "ALL"
                ? `Bạn không có đơn hàng nào ở trạng thái "${
                    STATUS_TABS.find((t) => t.value === activeTab)?.label
                  }".`
                : "Bạn chưa có đơn hàng nào được tạo. Hãy khám phá ngay các thiết kế mới nhất của THE LUKI!"}
            </p>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm"
            >
              <span>Khám Phá Sản Phẩm Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* CARDS ĐƠN HÀNG */
          <div className="space-y-4">
            {filteredOrders.map((order: any) => {
              const statusCfg =
                ORDER_STATUS_CONFIG[order.orderStatus as OrderStatus] || {
                  label: order.orderStatus,
                  badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
                  dotClass: "bg-zinc-400",
                  description: "",
                };

              const shippingStatus = order.shippingInfo?.status;
              const shippingCfg = shippingStatus
                ? SHIPPING_STATUS_CONFIG[shippingStatus as keyof typeof SHIPPING_STATUS_CONFIG]
                : null;

              const paymentStatus = order.paymentInfo?.status;
              const paymentCfg = paymentStatus
                ? PAYMENT_STATUS_CONFIG[paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG]
                : null;

              const isCancellable =
                order.orderStatus === "PENDING" ||
                order.orderStatus === "PROCESSING";

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
                <div
                  key={order._id || order.orderCode}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 transition-all shadow-sm"
                >
                  {/* HEADER CARD */}
                  <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Mã đơn */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-zinc-900 uppercase">
                          #{order.orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(order.orderCode)}
                          className="text-zinc-400 hover:text-black transition-colors"
                          title="Sao chép mã đơn"
                        >
                          {copiedCode === order.orderCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <span className="text-zinc-300 text-xs hidden sm:inline">•</span>

                      {/* Ngày đặt */}
                      <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {orderDate}
                      </span>
                    </div>

                    {/* BADGES TRẠNG THÁI */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status chính */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${statusCfg.badgeClass}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                        />
                        <span>{statusCfg.label}</span>
                      </span>

                      {/* Status vận chuyển nếu có */}
                      {shippingCfg && (
                        <span
                          className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border ${shippingCfg.badgeClass}`}
                        >
                          <Truck className="w-3 h-3" />
                          <span>{shippingCfg.label}</span>
                        </span>
                      )}

                      {/* Status thanh toán */}
                      {paymentCfg && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border ${paymentCfg.badgeClass}`}
                        >
                          {paymentCfg.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
                  <div className="divide-y divide-zinc-100">
                    {order.items?.map((item: any, idx: number) => (
                      <div
                        key={item.variantId || idx}
                        className="p-4 sm:p-5 flex items-center gap-4"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-20 bg-zinc-100 flex-shrink-0 border border-zinc-200 overflow-hidden">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <Package className="w-6 h-6 stroke-[1.5]" />
                            </div>
                          )}
                        </div>

                        {/* Thông tin */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            {item.color && (
                              <span>
                                Màu: <strong className="text-zinc-700 font-medium">{item.color}</strong>
                              </span>
                            )}
                            {item.color && item.size && <span>•</span>}
                            {item.size && (
                              <span>
                                Size: <strong className="text-zinc-700 font-medium">{item.size}</strong>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Số lượng: {item.quantity}
                          </p>
                        </div>

                        {/* Đơn giá */}
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-mono font-bold text-zinc-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] font-mono text-zinc-400">
                              {formatPrice(item.price)} / món
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER CARD: ĐỊA CHỈ, TỔNG TIỀN & HÀNH ĐỘNG */}
                  <div className="p-4 sm:p-5 bg-zinc-50/70 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Tóm tắt người nhận & phương thức */}
                    <div className="text-xs text-zinc-600 space-y-0.5">
                      <p>
                        Người nhận:{" "}
                        <strong className="text-zinc-900 font-semibold">
                          {order.shippingAddress?.receiverName}
                        </strong>{" "}
                        ({order.shippingAddress?.receiverPhone})
                      </p>
                      <p className="text-zinc-500 truncate max-w-md">
                        Địa chỉ: {order.shippingAddress?.detailAddress},{" "}
                        {order.shippingAddress?.ward},{" "}
                        {order.shippingAddress?.province}
                      </p>
                      <p className="text-zinc-500">
                        Thanh toán:{" "}
                        <span className="font-semibold text-zinc-800 uppercase">
                          {order.paymentInfo?.method || "COD"}
                        </span>
                      </p>
                    </div>

                    {/* Tổng tiền & Nút bấm */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:self-end">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">
                          Tổng thanh toán ({order.items?.length || 0} món):
                        </span>
                        <span className="text-base sm:text-lg font-mono font-black text-zinc-900">
                          {formatPrice(order.financials?.finalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Nút hủy đơn nếu được phép */}
                        {isCancellable && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrderCode(order.orderCode);
                              setCancelReason(CANCEL_REASONS[0]);
                              setCustomReason("");
                            }}
                            className="px-3.5 py-2 border border-zinc-300 hover:border-rose-500 text-zinc-600 hover:text-rose-600 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Hủy đơn
                          </button>
                        )}

                        {/* Nút Xem chi tiết */}
                        <Link
                          href={`/orders/${order.orderCode}`}
                          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Xem chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN HỦY ĐƠN HÀNG */}
      {cancellingOrderCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full p-6 border border-zinc-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Xác nhận hủy đơn #{cancellingOrderCode}
              </h3>
              <button
                type="button"
                onClick={() => setCancellingOrderCode(null)}
                className="text-zinc-400 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Vui lòng chọn lý do hủy đơn hàng để THE LUKI cải thiện chất lượng phục vụ:
              </p>

              <div className="space-y-2">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 text-xs text-zinc-800 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-black"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {cancelReason === "Lý do khác" && (
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết của bạn..."
                  className="w-full p-2 border border-zinc-300 text-xs focus:border-black outline-none"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setCancellingOrderCode(null)}
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
