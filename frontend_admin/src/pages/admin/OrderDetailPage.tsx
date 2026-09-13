import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Skeleton,
  Select,
  Input,
  Button,
  Divider,
  Modal,
} from "antd";
import {
  ArrowLeft,
  Package,
  Printer,
  Copy,
  Check,
  Truck,
  CreditCard,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useGetOrderDetail, useUpdateOrderStatus } from "../../hook/useOrder";
import type {
  OrderAdminItem,
  OrderStatus,
  ShippingStatus,
  PaymentStatus,
} from "../../types/orderType";
import { formatPrice } from "../../utils/formatPrice";
import copyToClipboard from "../../utils/copyText";

// Cấu hình hiển thị trạng thái đơn hàng
const ORDER_STATUS_MAP: Record<
  OrderStatus,
  { label: string; color: string; bg: string; dot: string; desc: string }
> = {
  PENDING: {
    label: "CHỜ XÁC NHẬN",
    color: "#b45309",
    bg: "#fffbeb",
    dot: "#f59e0b",
    desc: "Đơn mới, cần kiểm tra và xác nhận",
  },
  PROCESSING: {
    label: "ĐANG XỬ LÝ / ĐÓNG GÓI",
    color: "#1d4ed8",
    bg: "#eff6ff",
    dot: "#3b82f6",
    desc: "Đang đóng gói kiện hàng",
  },
  SHIPPING: {
    label: "ĐANG VẬN CHUYỂN",
    color: "#7c3aed",
    bg: "#f5f3ff",
    dot: "#8b5cf6",
    desc: "Đã giao cho đơn vị vận chuyển",
  },
  DELIVERED: {
    label: "ĐÃ GIAO HÀNG",
    color: "#047857",
    bg: "#ecfdf5",
    dot: "#10b981",
    desc: "Bưu phẩm đã phát thành công",
  },
  COMPLETED: {
    label: "HOÀN TẤT",
    color: "#065f46",
    bg: "#d1fae5",
    dot: "#059669",
    desc: "Đơn hàng hoàn tất và khép lại",
  },
  CANCELLED: {
    label: "ĐÃ HỦY",
    color: "#b91c1c",
    bg: "#fef2f2",
    dot: "#ef4444",
    desc: "Đơn hàng đã bị hủy bỏ",
  },
  RETURNED: {
    label: "CHUYỂN HOÀN",
    color: "#4b5563",
    bg: "#f3f4f6",
    dot: "#9ca3af",
    desc: "Kiện hàng chuyển hoàn về shop",
  },
};

const SHIPPING_STATUS_MAP: Record<ShippingStatus, string> = {
  PENDING: "Chờ lấy hàng",
  CONFIRMED: "Đã tiếp nhận",
  PICKING: "Đang lấy hàng",
  SHIPPING: "Đang vận chuyển",
  DELIVERED: "Giao thành công",
  FAILED: "Giao thất bại",
  RETURNED: "Đã chuyển hoàn",
  CANCELLED: "Đã hủy vận đơn",
};

const PAYMENT_STATUS_MAP: Record<PaymentStatus, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Lấy chi tiết đơn hàng theo ID
  const { data: apiResponse, isLoading, refetch } = useGetOrderDetail(id);
  const order: OrderAdminItem | undefined = apiResponse;

  // Mutation cập nhật trạng thái
  const updateStatusMutation = useUpdateOrderStatus();

  // State form cập nhật trạng thái
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus | "">("");
  const [newShippingStatus, setNewShippingStatus] = useState<ShippingStatus | "">("");
  const [trackingCodeInput, setTrackingCodeInput] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");

  // Đồng bộ form khi có data
  useMemo(() => {
    if (order) {
      setNewOrderStatus(order.orderStatus);
      setNewShippingStatus((order.shippingInfo?.status as ShippingStatus) || "PENDING");
      setTrackingCodeInput(order.shippingInfo?.trackingCode || "");
      setAdminNote("");
    }
  }, [order]);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text);
    setCopiedCode(key);
    toast.success(`Đã sao chép: ${text}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdateStatus = () => {
    if (!id) return;

    const payload: {
      orderStatus?: string;
      shippingStatus?: string;
      trackingCode?: string;
      note?: string;
    } = {};

    if (newOrderStatus && newOrderStatus !== order?.orderStatus) {
      payload.orderStatus = newOrderStatus;
    }
    if (newShippingStatus && newShippingStatus !== order?.shippingInfo?.status) {
      payload.shippingStatus = newShippingStatus;
    }
    if (trackingCodeInput !== (order?.shippingInfo?.trackingCode || "")) {
      payload.trackingCode = trackingCodeInput.trim();
    }
    if (adminNote.trim()) {
      payload.note = adminNote.trim();
    }

    if (Object.keys(payload).length === 0) {
      toast("Không có thay đổi nào cần lưu!");
      return;
    }

    updateStatusMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          refetch();
          setAdminNote("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans p-2">
        <div className="flex items-center gap-3">
          <Skeleton.Button active style={{ width: 140, height: 36 }} />
          <Skeleton.Input active style={{ width: 280, height: 36 }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton active paragraph={{ rows: 8 }} className="p-6 bg-white border border-zinc-200" />
            <Skeleton active paragraph={{ rows: 6 }} className="p-6 bg-white border border-zinc-200" />
          </div>
          <div className="space-y-6">
            <Skeleton active paragraph={{ rows: 10 }} className="p-6 bg-white border border-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center bg-white border border-zinc-200 font-sans space-y-4">
        <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Không tìm thấy đơn hàng</h2>
        <p className="text-sm text-zinc-500 font-mono">
          Đơn hàng ({id}) không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 h-9 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_MAP[order.orderStatus] || ORDER_STATUS_MAP.PENDING;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* ================= 1. HEADER BAR & BACK LINK ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1.5">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>DANH SÁCH ĐƠN HÀNG</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 font-mono flex items-center gap-2">
              <span>#{order.orderCode}</span>
            </h1>

            <button
              type="button"
              onClick={() => handleCopy(order.orderCode, "code")}
              className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
              title="Sao chép mã đơn"
            >
              {copiedCode === "code" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Status Badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider border"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
                borderColor: statusConfig.color + "40",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusConfig.dot }}
              />
              {statusConfig.label}
            </span>

            {/* Payment Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-bold font-mono border ${
                order.paymentInfo?.status === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}
            >
              {order.paymentInfo?.method} ·{" "}
              {PAYMENT_STATUS_MAP[order.paymentInfo?.status as PaymentStatus] ||
                order.paymentInfo?.status}
            </span>
          </div>

          <p className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Đặt lúc: {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 font-mono">
          <button
            type="button"
            onClick={() => refetch()}
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
            <span>LÀM MỚI</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-600" />
            <span>IN PHIẾU ĐÓNG GÓI</span>
          </button>
        </div>
      </div>

      {/* ================= 2. MAIN 2-COLUMN LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT COLUMN: DETAILS (2 COLS) ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. DANH SÁCH SẢN PHẨM */}
          <div className="bg-white border border-black shadow-2xs">
            <div className="bg-zinc-100 px-4 py-3 border-b border-black flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-zinc-700" />
                <span>DANH SÁCH SẢN PHẨM TRONG ĐƠN ({order.items?.length || 0})</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                Tổng SL:{" "}
                <strong>
                  {order.items?.reduce((s, it) => s + it.quantity, 0) || 0}
                </strong>{" "}
                món
              </span>
            </div>

            <div className="divide-y divide-zinc-200">
              {order.items?.map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-16 h-20 object-cover border border-zinc-300 shrink-0 bg-zinc-100"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-zinc-100 border border-zinc-300 shrink-0 flex items-center justify-center text-zinc-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-sm text-zinc-900 leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-600">
                      <span>
                        SKU: <strong>{item.sku || "N/A"}</strong>
                      </span>
                      {item.color && (
                        <span>
                          Màu: <strong>{item.color}</strong>
                        </span>
                      )}
                      {item.size && (
                        <span>
                          Size: <strong>{item.size}</strong>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      Đơn giá: {formatPrice(item.price)} × Số lượng: <strong>{item.quantity}</strong>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-base font-black text-zinc-950">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal Footer */}
            <div className="bg-zinc-50 p-4 border-t border-zinc-200 flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500 uppercase">Tạm tính tiền hàng:</span>
              <span className="text-sm font-bold text-zinc-900">
                {formatPrice(order.financials?.itemsSubtotal)}
              </span>
            </div>
          </div>

          {/* B. THÔNG TIN GIAO HÀNG & ĐƠN VỊ VẬN CHUYỂN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Người nhận */}
            <div className="bg-white border border-black p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-200">
                <MapPin className="w-4 h-4 text-zinc-700" />
                <span>ĐỊA CHỈ NHẬN HÀNG</span>
              </h3>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm text-zinc-900">
                  {order.shippingAddress?.receiverName}
                </p>
                <p className="font-mono text-zinc-700 font-semibold flex items-center gap-1.5">
                  <span>{order.shippingAddress?.receiverPhone}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(order.shippingAddress?.receiverPhone || "", "phone")
                    }
                    className="text-zinc-400 hover:text-black cursor-pointer"
                  >
                    {copiedCode === "phone" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </p>
                <p className="text-zinc-600 leading-relaxed pt-1">
                  {order.shippingAddress?.detailAddress},{" "}
                  {order.shippingAddress?.ward},{" "}
                  {order.shippingAddress?.district},{" "}
                  {order.shippingAddress?.province}
                </p>

                {order.shippingAddress?.note && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900">
                    <strong className="block text-[11px] uppercase font-bold text-amber-800">
                      Ghi chú của khách:
                    </strong>
                    <span className="italic">{order.shippingAddress.note}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Đơn vị vận chuyển */}
            <div className="bg-white border border-black p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-200">
                <Truck className="w-4 h-4 text-zinc-700" />
                <span>ĐƠN VỊ GIAO VẬN</span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Đối tác vận chuyển:</span>
                  <span className="font-bold text-zinc-900 uppercase">
                    {order.shippingInfo?.carrier || "VIETTELPOST"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Trạng thái bưu kiện:</span>
                  <span className="font-bold text-blue-700">
                    {SHIPPING_STATUS_MAP[
                      order.shippingInfo?.status as ShippingStatus
                    ] || order.shippingInfo?.status || "Chờ lấy hàng"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-zinc-100">
                  <span className="text-zinc-500">Mã vận đơn:</span>
                  {order.shippingInfo?.trackingCode ? (
                    <span className="font-bold text-purple-700 flex items-center gap-1">
                      <span>{order.shippingInfo.trackingCode}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(order.shippingInfo.trackingCode || "", "tracking")
                        }
                        className="text-zinc-400 hover:text-black cursor-pointer"
                      >
                        {copiedCode === "tracking" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">Chưa tạo vận đơn</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Tiền thu hộ (COD):</span>
                  <span className="font-bold text-zinc-900">
                    {formatPrice(order.shippingInfo?.codAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* C. LỊCH SỬ TIMELINE CỦA ĐƠN HÀNG */}
          <div className="bg-white border border-black shadow-2xs p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Clock className="w-4 h-4 text-zinc-700" />
              <span>DÒNG THỜI GIAN ĐƠN HÀNG ({order.timeline?.length || 0} mốc)</span>
            </h3>

            {order.timeline && order.timeline.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 font-mono text-xs">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-black ring-4 ring-white" />
                    <div className="bg-zinc-50 p-2.5 border border-zinc-200 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-900 uppercase">
                          [{event.type || "HỆ THỐNG"}] {event.status}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {dayjs(event.updatedAt || (event as any).createdAt).format("DD/MM/YYYY HH:mm:ss")}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-zinc-600 text-xs font-sans mt-0.5">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic font-mono py-2">
                Chưa có sự kiện timeline nào được ghi nhận.
              </p>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: ACTIONS & FINANCIALS (1 COL) ================= */}
        <div className="space-y-6">
          {/* 1. KHỐI CẬP NHẬT TRẠNG THÁI (STATUS CONTROLLER) */}
          <div className="bg-white border-2 border-black p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2 pb-2 border-b border-black">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>ĐIỀU KHIỂN ĐƠN HÀNG</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1 font-mono">
                  Trạng thái đơn hàng:
                </label>
                <Select
                  value={newOrderStatus}
                  onChange={(v) => setNewOrderStatus(v)}
                  className="w-full !rounded-none font-mono"
                  options={[
                    { value: "PENDING", label: "⏳ Chờ xác nhận (PENDING)" },
                    { value: "PROCESSING", label: "📦 Đang xử lý / Đóng gói (PROCESSING)" },
                    { value: "SHIPPING", label: "🚚 Đang giao hàng (SHIPPING)" },
                    { value: "DELIVERED", label: "✅ Đã giao thành công (DELIVERED)" },
                    { value: "COMPLETED", label: "🎉 Hoàn tất đơn (COMPLETED)" },
                    { value: "CANCELLED", label: "❌ Đã hủy (CANCELLED)" },
                    { value: "RETURNED", label: "🔄 Chuyển hoàn (RETURNED)" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1 font-mono">
                  Trạng thái giao vận:
                </label>
                <Select
                  value={newShippingStatus}
                  onChange={(v) => setNewShippingStatus(v)}
                  className="w-full !rounded-none font-mono"
                  options={[
                    { value: "PENDING", label: "Chờ lấy hàng" },
                    { value: "CONFIRMED", label: "Đã tiếp nhận đơn" },
                    { value: "PICKING", label: "Đang lấy hàng tại kho" },
                    { value: "SHIPPING", label: "Đang trung chuyển / giao" },
                    { value: "DELIVERED", label: "Giao thành công" },
                    { value: "FAILED", label: "Giao thất bại" },
                    { value: "RETURNED", label: "Chuyển hoàn" },
                    { value: "CANCELLED", label: "Hủy vận đơn" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1 font-mono">
                  Mã vận đơn (Tracking code):
                </label>
                <Input
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="Nhập mã vận đơn bưu cục cấp..."
                  className="!rounded-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-zinc-600 mb-1 font-mono">
                  Ghi chú nội bộ cập nhật:
                </label>
                <Input.TextArea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ghi lý do đổi trạng thái hoặc dặn dò kho..."
                  rows={2}
                  className="!rounded-none"
                />
              </div>

              <Button
                type="primary"
                onClick={handleUpdateStatus}
                loading={updateStatusMutation.isPending}
                className="w-full !h-10 !bg-black hover:!bg-zinc-800 !text-white !font-bold !rounded-none !uppercase !tracking-wider !cursor-pointer mt-2"
              >
                LƯU CẬP NHẬT TRẠNG THÁI
              </Button>
            </div>
          </div>

          {/* 2. CHI TIẾT TÀI CHÍNH & THANH TOÁN */}
          <div className="bg-zinc-50 border border-black p-4 space-y-3 font-mono text-xs shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2 pb-2 border-b border-zinc-200 font-sans">
              <CreditCard className="w-4 h-4 text-zinc-700" />
              <span>CHI TIẾT TÀI CHÍNH</span>
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Hình thức thanh toán:</span>
                <strong className="uppercase font-bold text-zinc-900">
                  {order.paymentInfo?.method}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Trạng thái thanh toán:</span>
                <span
                  className={`font-bold ${
                    order.paymentInfo?.status === "PAID"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {PAYMENT_STATUS_MAP[order.paymentInfo?.status as PaymentStatus] ||
                    order.paymentInfo?.status}
                </span>
              </div>

              <Divider className="!my-2" />

              <div className="flex justify-between">
                <span className="text-zinc-500">Tiền hàng tạm tính:</span>
                <span className="font-bold text-zinc-900">
                  {formatPrice(order.financials?.itemsSubtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Cước vận chuyển:</span>
                <span className="font-bold text-zinc-900">
                  {order.financials?.shippingFee === 0
                    ? "0₫ (Miễn phí)"
                    : formatPrice(order.financials?.shippingFee)}
                </span>
              </div>

              {Number(order.financials?.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Mã giảm giá ({order.coupon?.code || "VOUCHER"}):</span>
                  <span>-{formatPrice(order.financials?.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t-2 border-black text-sm font-black">
                <span className="uppercase text-zinc-900">TỔNG THANH TOÁN:</span>
                <span className="text-base text-zinc-950">
                  {formatPrice(order.financials?.finalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* 3. THÔNG TIN KHÁCH HÀNG SNAPSHOT */}
          <div className="bg-white border border-black p-4 space-y-2 text-xs shadow-2xs font-mono">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2 pb-2 border-b border-zinc-200 font-sans">
              <User className="w-4 h-4 text-zinc-700" />
              <span>TÀI KHOẢN ĐẶT HÀNG</span>
            </h3>

            <div className="space-y-1 text-zinc-600">
              <p>
                Khách hàng:{" "}
                <strong className="text-zinc-900">
                  {order.shippingAddress?.receiverName}
                </strong>
              </p>
              <p>
                SĐT:{" "}
                <strong className="text-zinc-900">
                  {order.shippingAddress?.receiverPhone}
                </strong>
              </p>
              {order.user && (
                <p className="truncate text-[11px] text-zinc-400">
                  User ID: {typeof order.user === "string" ? order.user : (order.user as any)._id || (order.user as any).name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL IN PHIẾU GIAO HÀNG (PRINT MODAL) ================= */}
      <Modal
        open={isPrintModalOpen}
        onCancel={() => setIsPrintModalOpen(false)}
        footer={null}
        width={680}
        className="print-order-modal"
        centered
      >
        <div className="p-6 font-mono space-y-4 text-zinc-900 bg-white border border-zinc-200 text-xs">
          {/* Header phiếu */}
          <div className="text-center border-b-2 border-black pb-4 space-y-1">
            <h2 className="text-xl font-black tracking-wider uppercase font-sans">
              THE LUKI STORE
            </h2>
            <p className="text-zinc-500 text-[11px]">
              Thời trang đường phố cao cấp · Hotline: 0900.000.xxx
            </p>
            <p className="text-sm font-black uppercase tracking-widest pt-2">
              PHIẾU GIAO HÀNG & ĐÓNG GÓI
            </p>
            <p className="text-xs text-zinc-600">
              Mã đơn: <strong>#{order.orderCode}</strong> · Ngày:{" "}
              {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>

          {/* Người gửi - Người nhận */}
          <div className="grid grid-cols-2 gap-4 py-2 border-b border-dashed border-zinc-300">
            <div>
              <p className="font-bold uppercase text-zinc-500 text-[10px]">
                Người gửi:
              </p>
              <p className="font-bold">THE LUKI FASHION</p>
              <p className="text-[11px] text-zinc-600">
                Kho vận Bình Định, Việt Nam
              </p>
              <p className="text-[11px] text-zinc-600">SĐT: 0912.345.678</p>
            </div>
            <div>
              <p className="font-bold uppercase text-zinc-500 text-[10px]">
                Người nhận:
              </p>
              <p className="font-bold text-sm">
                {order.shippingAddress?.receiverName}
              </p>
              <p className="font-bold text-zinc-800">
                {order.shippingAddress?.receiverPhone}
              </p>
              <p className="text-[11px] text-zinc-600 leading-snug">
                {order.shippingAddress?.detailAddress},{" "}
                {order.shippingAddress?.ward},{" "}
                {order.shippingAddress?.district},{" "}
                {order.shippingAddress?.province}
              </p>
            </div>
          </div>

          {/* Bảng sản phẩm rút gọn cho phiếu in */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black text-[11px] uppercase font-bold">
                  <th className="py-1.5">Sản phẩm</th>
                  <th className="py-1.5 text-center">SL</th>
                  <th className="py-1.5 text-right">Đơn giá</th>
                  <th className="py-1.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {order.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <p className="font-bold">{it.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {it.color} / {it.size} · SKU: {it.sku || "N/A"}
                      </p>
                    </td>
                    <td className="py-2 text-center font-bold">x{it.quantity}</td>
                    <td className="py-2 text-right">{formatPrice(it.price)}</td>
                    <td className="py-2 text-right font-bold">
                      {formatPrice(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng kết tiền */}
          <div className="border-t-2 border-black pt-3 space-y-1 text-right">
            <p>
              Tiền hàng:{" "}
              <strong>{formatPrice(order.financials?.itemsSubtotal)}</strong>
            </p>
            <p>
              Phí ship:{" "}
              <strong>
                {order.financials?.shippingFee === 0
                  ? "Miễn phí"
                  : formatPrice(order.financials?.shippingFee)}
              </strong>
            </p>
            {Number(order.financials?.discountAmount) > 0 && (
              <p className="text-emerald-700">
                Giảm giá: -{formatPrice(order.financials?.discountAmount)}
              </p>
            )}
            <p className="text-base font-black pt-1 border-t border-zinc-200">
              TỔNG THU (COD):{" "}
              <span>
                {order.paymentInfo?.method === "COD"
                  ? formatPrice(order.financials?.finalAmount)
                  : "0₫ (ĐÃ THANH TOÁN TRƯỚC)"}
              </span>
            </p>
          </div>

          {/* Chữ ký */}
          <div className="grid grid-cols-2 text-center pt-6 pb-2 text-[11px]">
            <div>
              <p className="font-bold">Người giao hàng</p>
              <p className="italic text-zinc-400 mt-8">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold">Người nhận hàng</p>
              <p className="italic text-zinc-400 mt-8">(Ký và ghi rõ họ tên)</p>
            </div>
          </div>

          {/* Nút Print trigger */}
          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 print:hidden">
            <Button
              onClick={() => setIsPrintModalOpen(false)}
              className="!rounded-none"
            >
              Đóng
            </Button>
            <Button
              type="primary"
              onClick={() => window.print()}
              className="!bg-black hover:!bg-zinc-800 !rounded-none !font-bold"
            >
              In Phiếu Này
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
