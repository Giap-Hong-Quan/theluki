import { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  ConfigProvider,
  Modal,
  Tooltip,
  DatePicker,
} from "antd";
import {
  Package,
  Search,
  RotateCcw,
  Eye,
  Printer,
  Copy,
  Check,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { useGetAllOrders } from "../../hook/useOrder";
import type {
  OrderAdminItem,
  OrderStatus,
  GetOrdersQueryParams,
} from "../../types/orderType";
import { formatPrice } from "../../utils/formatPrice";
import copyToClipboard from "../../utils/copyText";
import toast from "react-hot-toast";
import { socket } from "../../config/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const { RangePicker } = DatePicker;

// Cấu hình hiển thị trạng thái đơn hàng (Đồng bộ phong cách Admin THE LUKI)
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
    label: "ĐANG ĐÓNG GÓI",
    color: "#1d4ed8",
    bg: "#eff6ff",
    dot: "#3b82f6",
    desc: "Kho đang chuẩn bị hàng",
  },
  SHIPPING: {
    label: "ĐANG GIAO HÀNG",
    color: "#7e22ce",
    bg: "#faf5ff",
    dot: "#a855f7",
    desc: "Đã bàn giao bưu tá ViettelPost",
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

export { ORDER_STATUS_MAP };

const STATUS_TABS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ xác nhận", value: "PENDING" },
  { label: "Đang đóng gói", value: "PROCESSING" },
  { label: "Đang giao", value: "SHIPPING" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Chuyển hoàn", value: "RETURNED" },
];

export default function OrderPage() {
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<GetOrdersQueryParams>({
    page: 1,
    sizePage: 20,
    sortBy: "createdAt_desc",
  });
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  // In phiếu nhanh
  const [selectedOrder, setSelectedOrder] = useState<OrderAdminItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Gọi API backend
  const {
    data: apiResult,
    isLoading,
    refetch,
  } = useGetAllOrders({
    ...filter,
    status: activeTab !== "ALL" ? activeTab : filter.status,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewOrder = (data: any) => {
      console.log("📢 [OrderPage] Nhận tín hiệu new_order qua socket:", data);
      toast.success(
        data?.orderCode
          ? `🔔 Có đơn hàng mới #${data.orderCode} vừa được đặt!`
          : "🔔 Có đơn hàng mới vừa được đặt!"
      );
      // Đánh dấu stale và tự động kéo dữ liệu mới nhất
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      refetch(); 
    };

    socket.on("new_order", handleNewOrder);

    // Dọn dẹp khi rời trang
    return () => {
      socket.off("new_order", handleNewOrder);
    };
  }, [queryClient, refetch]);

  // Danh sách đơn hàng từ API Backend
  const ordersList: OrderAdminItem[] = useMemo(() => {
    const rawOrders = (apiResult as any)?.orders || (apiResult as any)?.data?.orders;
    return Array.isArray(rawOrders) ? rawOrders : [];
  }, [apiResult]);

  // Thống kê metrics cho hàng thẻ CardItem (Đọc trực tiếp từ API backend)
  const stats = useMemo(() => {
    const backendStats = (apiResult as any)?.stats || (apiResult as any)?.data?.stats;
    if (backendStats) {
      return {
        totalOrders: backendStats.totalOrders ?? 0,
        totalPending: backendStats.totalPending ?? 0,
        totalProcessing: (backendStats.totalProcessing ?? 0) + (backendStats.totalShipping ?? 0),
        totalRevenue: backendStats.totalRevenue ?? 0,
      };
    }
    const rawOrders = (apiResult as any)?.orders || (apiResult as any)?.data?.orders || [];
    return {
      totalOrders: (apiResult as any)?.total ?? rawOrders.length,
      totalPending: rawOrders.filter((o: any) => o.orderStatus === "PENDING").length,
      totalProcessing: rawOrders.filter((o: any) => o.orderStatus === "PROCESSING" || o.orderStatus === "SHIPPING").length,
      totalRevenue: rawOrders.filter((o: any) => o.orderStatus !== "CANCELLED").reduce((s: number, o: any) => s + (o.financials?.finalAmount || 0), 0),
    };
  }, [apiResult]);

  // Handler Lọc form
  const handleValuesChange = (_: any, allValues: any) => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (allValues.dateRange && allValues.dateRange.length === 2) {
      startDate = allValues.dateRange[0]?.toISOString();
      endDate = allValues.dateRange[1]?.toISOString();
    }

    setFilter((prev) => ({
      ...prev,
      page: 1,
      search: allValues.search?.trim() || undefined,
      status: allValues.orderStatus || undefined,
      shippingStatus: allValues.shippingStatus || undefined,
      paymentMethod: allValues.paymentMethod || undefined,
      paymentStatus: allValues.paymentStatus || undefined,
      carrier: allValues.carrier || undefined,
      province: allValues.province || undefined,
      minAmount: allValues.minAmount !== undefined && allValues.minAmount !== null ? Number(allValues.minAmount) : undefined,
      maxAmount: allValues.maxAmount !== undefined && allValues.maxAmount !== null ? Number(allValues.maxAmount) : undefined,
      startDate,
      endDate,
      sortBy: allValues.sortBy || "createdAt_desc",
    }));
  };

  const handleResetFilter = () => {
    form.resetFields();
    setActiveTab("ALL");
    setFilter({ page: 1, sizePage: 20, sortBy: "createdAt_desc" });
  };

  // Columns cho bảng Table tiêu chuẩn
  const columns: ColumnType<OrderAdminItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => {
        const page = filter.page ?? 1;
        const sizePage = filter.sizePage ?? 20;
        const stt = (page - 1) * sizePage + index + 1;
        return (
          <span className="font-mono text-xs font-bold text-zinc-500">
            #{String(stt).padStart(2, "0")}
          </span>
        );
      },
    },
    {
      key: "orderCode",
      title: "MÃ ĐƠN HÀNG",
      width: 170,
      align: "left",
      render: (_, record) => (
        <div className="flex items-center gap-1.5 font-mono">
          <button
            type="button"
            onClick={() => navigate(`/orders/${record._id}`)}
            className="font-bold text-zinc-950 text-xs tracking-tight hover:underline hover:text-blue-600 transition-colors cursor-pointer text-left"
            title="Bấm để xem chi tiết đơn hàng"
          >
            #{record.orderCode}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(record.orderCode, `Đã sao chép mã đơn #${record.orderCode}`);
              setCopiedCode(record.orderCode);
              setTimeout(() => setCopiedCode(null), 2000);
            }}
            className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
            title="Sao chép mã"
          >
            {copiedCode === record.orderCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "customer",
      title: "KHÁCH HÀNG & LIÊN HỆ",
      width: 220,
      align: "left",
      render: (_, record) => (
        <div className="space-y-0.5">
          <div className="font-bold text-zinc-950 text-xs truncate max-w-[200px]">
            {record.shippingAddress?.receiverName || "Khách hàng"}
          </div>
          <div className="font-mono text-[11px] text-zinc-600">
            {record.shippingAddress?.receiverPhone}
          </div>
          <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">
            {record.shippingAddress?.province}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      title: "SẢN PHẨM MUA",
      width: 230,
      align: "left",
      render: (_, record) => (
        <div className="flex items-center gap-2.5">
          {record.items?.[0]?.thumbnail ? (
            <img
              src={record.items[0].thumbnail}
              alt={record.items[0].name}
              className="w-10 h-12 object-cover border border-zinc-200 shrink-0 bg-zinc-100"
            />
          ) : (
            <div className="w-10 h-12 border border-zinc-200 bg-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
              <Package className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-900 truncate max-w-[160px]">
              {record.items?.[0]?.name}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              {record.items?.length > 1
                ? `và ${record.items.length - 1} món khác (${record.items.reduce((s, i) => s + i.quantity, 0)} cái)`
                : `${record.items?.[0]?.color || ""} • ${record.items?.[0]?.size || ""} x${record.items?.[0]?.quantity || 1}`}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "finalAmount",
      title: "TỔNG TIỀN",
      width: 140,
      align: "right",
      render: (_, record) => (
        <span className="font-mono font-bold text-sm text-zinc-950">
          {formatPrice(record.financials?.finalAmount)}
        </span>
      ),
    },
    {
      key: "payment",
      title: "THANH TOÁN",
      width: 140,
      align: "center",
      render: (_, record) => {
        const isPaid = record.paymentInfo?.status === "PAID";
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-800 font-mono">
              {record.paymentInfo?.method || "COD"}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                isPaid ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isPaid ? "● Đã thanh toán" : "○ Chưa thanh toán"}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "TRẠNG THÁI ĐƠN",
      width: 160,
      align: "center",
      render: (_, record) => {
        const cfg =
          ORDER_STATUS_MAP[record.orderStatus] ||
          ORDER_STATUS_MAP.PENDING;
        return (
          <div className="flex flex-col items-center gap-1">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-none"
              style={{
                color: cfg.color,
                backgroundColor: cfg.bg,
                borderColor: `${cfg.color}33`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cfg.dot }}
              />
              <span>{cfg.label}</span>
            </span>

            {record.shippingInfo?.trackingCode && (
              <span className="font-mono text-[9px] text-purple-800 bg-purple-50 px-1 border border-purple-200">
                {record.shippingInfo.trackingCode}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      title: "THỜI GIAN ĐẶT",
      width: 140,
      align: "center",
      render: (_, record) => {
        const d = new Date(record.createdAt);
        return (
          <div className="text-[11px] font-medium text-zinc-600 font-mono">
            <div>
              {d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-zinc-400">
              {d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "THAO TÁC",
      width: 110,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip title="Xem chi tiết & Quản lý đơn">
            <button
              type="button"
              onClick={() => navigate(`/orders/${record._id}`)}
              className="p-1.5 border border-zinc-300 hover:border-black hover:bg-black hover:text-white transition-colors cursor-pointer text-zinc-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="In phiếu đóng gói & giao hàng">
            <button
              type="button"
              onClick={() => {
                setSelectedOrder(record);
                setIsPrintModalOpen(true);
              }}
              className="p-1.5 border border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-black transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* ================= 1. HEADER BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 font-sans flex items-center gap-2">
            <Package className="w-6 h-6 text-zinc-900" />
            <span>ĐƠN HÀNG (ORDERS)</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {stats.totalOrders} đơn hàng · {stats.totalPending} chờ xác nhận · {stats.totalProcessing} đang xử lý / vận chuyển
          </p>
        </div>

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
            onClick={() => toast.success("Đang xuất danh sách đơn hàng sang file Excel...")}
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>XUẤT EXCEL</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/pos")}
            className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>TẠO ĐƠN POS</span>
          </button>
        </div>
      </div>

      {/* ================= 2. THANH CHỈ SỐ METRICS ================= */}
      <div className="flex flex-col sm:flex-row border border-black bg-white rounded-none divide-y sm:divide-y-0 sm:divide-x divide-[#dedbd5]">
        <CardItem
          title="TỔNG ĐƠN HÀNG"
          number={stats.totalOrders}
          description="Tất cả thời gian"
        />
        <CardItem
          title="CHỜ XÁC NHẬN"
          number={stats.totalPending}
          description="Cần xử lý ngay"
        />
        <CardItem
          title="ĐANG XỬ LÝ & GIAO"
          number={stats.totalProcessing}
          description="Kho & ViettelPost"
        />
        <CardItem
          title="TỔNG DOANH THU"
          number={formatPrice(stats.totalRevenue)}
          description="Đơn hợp lệ"
        />
      </div>

      {/* ================= 3. THANH BỘ LỌC ĐA NĂNG (ANTD FORM & SELECT) ================= */}
      <div className="bg-white border border-black p-3.5 shadow-2xs font-mono">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#000000",
              borderRadius: 0,
              controlHeight: 36,
              fontFamily: "inherit",
              fontSize: 12,
            },
            components: {
              Input: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeShadow: "none",
              },
              InputNumber: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeShadow: "none",
              },
              Select: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeOutlineColor: "transparent",
              },
              DatePicker: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeShadow: "none",
              },
              Button: {
                borderRadius: 0,
                controlHeight: 36,
              },
            },
          }}
        >
          <Form
            form={form}
            layout="inline"
            className="w-full flex flex-col gap-3"
            onValuesChange={handleValuesChange}
          >
            {/* Hàng 1: Các bộ lọc chính */}
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Tìm kiếm tổng hợp */}
              <Form.Item name="search" className="!mb-0 flex-1 min-w-[240px]">
                <Input
                  prefix={<Search className="w-4 h-4 text-zinc-500 mr-1" />}
                  placeholder="Mã đơn (#ORD...), người nhận, SĐT, mã vận đơn, SKU..."
                  allowClear
                />
              </Form.Item>

              {/* Lọc trạng thái đơn */}
              <Form.Item name="orderStatus" className="!mb-0">
                <Select
                  placeholder="Trạng thái đơn"
                  allowClear
                  className="min-w-[155px]"
                  options={[
                    { value: "ALL", label: "TẤT CẢ TRẠNG THÁI" },
                    { value: "PENDING", label: "🟡 CHỜ XÁC NHẬN" },
                    { value: "PROCESSING", label: "🔵 ĐANG ĐÓNG GÓI" },
                    { value: "SHIPPING", label: "🟣 ĐANG GIAO HÀNG" },
                    { value: "DELIVERED", label: "🟢 ĐÃ GIAO THÀNH CÔNG" },
                    { value: "COMPLETED", label: "✅ HOÀN TẤT" },
                    { value: "CANCELLED", label: "🔴 ĐÃ HỦY ĐƠN" },
                    { value: "RETURNED", label: "⚪ CHUYỂN HOÀN" },
                  ]}
                />
              </Form.Item>

              {/* Lọc trạng thái giao vận */}
              <Form.Item name="shippingStatus" className="!mb-0">
                <Select
                  placeholder="Vận chuyển (Logistics)"
                  allowClear
                  className="min-w-[165px]"
                  options={[
                    { value: "ALL", label: "TẤT CẢ GIAO VẬN" },
                    { value: "PENDING", label: "Chờ lấy hàng" },
                    { value: "CONFIRMED", label: "Đã tiếp nhận" },
                    { value: "PICKING", label: "Đang lấy hàng" },
                    { value: "SHIPPING", label: "Đang vận chuyển" },
                    { value: "DELIVERED", label: "Giao thành công" },
                    { value: "FAILED", label: "Giao thất bại" },
                    { value: "RETURNED", label: "Đã chuyển hoàn" },
                    { value: "CANCELLED", label: "Đã hủy vận đơn" },
                  ]}
                />
              </Form.Item>

              {/* Lọc phương thức thanh toán */}
              <Form.Item name="paymentMethod" className="!mb-0">
                <Select
                  placeholder="Phương thức TT"
                  allowClear
                  className="min-w-[145px]"
                  options={[
                    { value: "ALL", label: "TẤT CẢ PHƯƠNG THỨC" },
                    { value: "COD", label: "COD (Tiền mặt)" },
                    { value: "SEPAY", label: "SePay (Chuyển khoản)" },
                    { value: "VNPAY", label: "VNPay QR" },
                    { value: "MOMO", label: "Ví MoMo" },
                    { value: "ESCROW", label: "Ví Escrow Shop" },
                  ]}
                />
              </Form.Item>

              {/* Lọc trạng thái thanh toán */}
              <Form.Item name="paymentStatus" className="!mb-0">
                <Select
                  placeholder="Trạng thái TT"
                  allowClear
                  className="min-w-[145px]"
                  options={[
                    { value: "ALL", label: "TẤT CẢ TRẠNG THÁI TT" },
                    { value: "PENDING", label: "○ Chưa thanh toán" },
                    { value: "PAID", label: "● Đã thanh toán" },
                    { value: "FAILED", label: "✕ Thanh toán lỗi" },
                    { value: "REFUNDED", label: "↺ Đã hoàn tiền" },
                  ]}
                />
              </Form.Item>

              {/* Nút bật/tắt Lọc nâng cao */}
              <button
                type="button"
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className={`h-9 px-3 uppercase border text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isAdvancedFilterOpen
                    ? "bg-black text-white border-black"
                    : "bg-white border-[#c8c5be] text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>NÂNG CAO</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isAdvancedFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Nút Reset */}
              <button
                type="button"
                onClick={handleResetFilter}
                className="h-9 px-3 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1 cursor-pointer transition-colors"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
                <span>RESET</span>
              </button>
            </div>

            {/* Hàng 2: Bộ lọc nâng cao (Khoảng giá, Tỉnh thành, Hãng bưu chính, Thời gian, Sắp xếp) */}
            {isAdvancedFilterOpen && (
              <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center gap-2 animate-in fade-in-50 duration-150">
                {/* Đơn vị vận chuyển */}
                <Form.Item name="carrier" className="!mb-0">
                  <Select
                    placeholder="Hãng bưu chính"
                    allowClear
                    className="min-w-[140px]"
                    options={[
                      { value: "ALL", label: "TẤT CẢ HÃNG" },
                      { value: "VIETTELPOST", label: "ViettelPost" },
                      { value: "GHN", label: "Giao Hàng Nhanh" },
                      { value: "GHTK", label: "Giao Hàng Tiết Kiệm" },
                      { value: "INTERNAL", label: "Shop Tự Giao" },
                    ]}
                  />
                </Form.Item>

                {/* Tỉnh / Thành phố */}
                <Form.Item name="province" className="!mb-0">
                  <Select
                    placeholder="Tỉnh / Thành nhận"
                    allowClear
                    showSearch
                    className="min-w-[160px]"
                    options={[
                      { value: "Bình Định", label: "Bình Định (Nội tỉnh)" },
                      { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
                      { value: "Hà Nội", label: "Hà Nội" },
                      { value: "Đà Nẵng", label: "Đà Nẵng" },
                      { value: "Cần Thơ", label: "Cần Thơ" },
                      { value: "Hải Phòng", label: "Hải Phòng" },
                      { value: "Khánh Hòa", label: "Khánh Hòa" },
                      { value: "Lâm Đồng", label: "Lâm Đồng" },
                      { value: "Quảng Nam", label: "Quảng Nam" },
                    ]}
                  />
                </Form.Item>

                {/* Khoảng giá từ */}
                <Form.Item name="minAmount" className="!mb-0">
                  <InputNumber
                    placeholder="Tổng tiền từ (₫)"
                    min={0}
                    formatter={(val) =>
                      val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                    }
                    parser={(val) => (val ? val.replace(/\$\s?|(,*)/g, "") : "") as any}
                    className="!w-[130px]"
                  />
                </Form.Item>

                {/* Khoảng giá đến */}
                <Form.Item name="maxAmount" className="!mb-0">
                  <InputNumber
                    placeholder="Tổng tiền đến (₫)"
                    min={0}
                    formatter={(val) =>
                      val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                    }
                    parser={(val) => (val ? val.replace(/\$\s?|(,*)/g, "") : "") as any}
                    className="!w-[130px]"
                  />
                </Form.Item>

                {/* Khoảng thời gian đặt hàng */}
                <Form.Item name="dateRange" className="!mb-0">
                  <RangePicker
                    placeholder={["Từ ngày", "Đến ngày"]}
                    format="DD/MM/YYYY"
                    className="min-w-[210px]"
                  />
                </Form.Item>

                {/* Sắp xếp */}
                <Form.Item name="sortBy" className="!mb-0" initialValue="createdAt_desc">
                  <Select
                    className="min-w-[160px]"
                    options={[
                      { value: "createdAt_desc", label: "Mới nhất trước" },
                      { value: "createdAt_asc", label: "Cũ nhất trước" },
                      { value: "amount_desc", label: "Giá trị: Cao -> Thấp" },
                      { value: "amount_asc", label: "Giá trị: Thấp -> Cao" },
                    ]}
                  />
                </Form.Item>
              </div>
            )}
          </Form>
        </ConfigProvider>
      </div>

      {/* ================= 4. TABS PHÂN LOẠI TRẠNG THÁI ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-200">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setActiveTab(tab.value);
                setFilter((prev) => ({
                  ...prev,
                  page: 1,
                  status: tab.value !== "ALL" ? tab.value : undefined,
                }));
              }}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 cursor-pointer font-mono ${
                isActive
                  ? "border-black text-black bg-white shadow-2xs"
                  : "border-transparent text-zinc-500 hover:text-black hover:border-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= 5. BẢNG DỮ LIỆU ĐƠN HÀNG ================= */}
      <div className="bg-white border border-black shadow-2xs">
        <Table
          columns={columns}
          dataSource={ordersList}
          rowKey="_id"
          loading={isLoading}
          emptyText="Không tìm thấy đơn hàng nào phù hợp với các tiêu chí lọc đã chọn."
          onRowClick={(record) => navigate(`/orders/${record._id}`)}
        />
      </div>

      {/* ================= 6. PHÂN TRANG ================= */}
      <div className="flex items-center justify-between py-2">
        <span className="text-xs text-zinc-500 font-mono">
          Hiển thị {ordersList.length} đơn hàng
        </span>
        <Pagination
          currentPage={filter.page ?? 1}
          totalItems={(apiResult as any)?.total ?? ordersList.length}
          pageSize={filter.sizePage ?? 20}
          onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
        />
      </div>

      {/* ================= 7. MODAL IN HÓA ĐƠN ================= */}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#000000",
            borderRadius: 0,
            fontFamily: "inherit",
          },
        }}
      >
        <Modal
          open={isPrintModalOpen}
          onCancel={() => setIsPrintModalOpen(false)}
          width={650}
          footer={null}
          centered
          className="!rounded-none font-mono"
        >
          {selectedOrder && (
            <div className="p-6 text-xs text-zinc-900 space-y-4 border border-black bg-white">
              <div className="text-center border-b-2 border-black pb-4">
                <h2 className="text-lg font-black tracking-widest uppercase">
                  THE LUKI CLOTHING
                </h2>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Xã Cát Minh, Huyện Phù Cát, Tỉnh Bình Định
                </p>
                <p className="text-[10px] text-zinc-500">
                  Hotline: 0987 654 321 • Website: theluki.vn
                </p>
                <h3 className="text-sm font-bold uppercase mt-2">
                  PHIẾU GIAO HÀNG & ĐÓNG GÓI
                </h3>
                <p className="text-xs font-bold">#{selectedOrder.orderCode}</p>
              </div>

              <div className="space-y-1">
                <p>
                  <strong>Người nhận:</strong>{" "}
                  {selectedOrder.shippingAddress?.receiverName}
                </p>
                <p>
                  <strong>Điện thoại:</strong>{" "}
                  {selectedOrder.shippingAddress?.receiverPhone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedOrder.shippingAddress?.detailAddress},{" "}
                  {selectedOrder.shippingAddress?.ward},{" "}
                  {selectedOrder.shippingAddress?.district},{" "}
                  {selectedOrder.shippingAddress?.province}
                </p>
                <p>
                  <strong>Hình thức thanh toán:</strong>{" "}
                  {selectedOrder.paymentInfo?.method} (
                  {selectedOrder.paymentInfo?.status === "PAID"
                    ? "ĐÃ THANH TOÁN"
                    : "THU COD"}
                  )
                </p>
              </div>

              <table className="w-full border-t border-b border-black text-left my-3">
                <thead>
                  <tr className="border-b border-zinc-300">
                    <th className="py-1">Sản phẩm</th>
                    <th className="py-1 text-center">SL</th>
                    <th className="py-1 text-right">Đơn giá</th>
                    <th className="py-1 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {selectedOrder.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1">
                        {it.name} ({it.size}/{it.color})
                      </td>
                      <td className="py-1 text-center">{it.quantity}</td>
                      <td className="py-1 text-right">
                        {formatPrice(it.price)}
                      </td>
                      <td className="py-1 text-right">
                        {formatPrice(it.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-right">
                <p>
                  Tiền hàng:{" "}
                  {formatPrice(selectedOrder.financials?.itemsSubtotal)}
                </p>
                <p>
                  Cước ship:{" "}
                  {formatPrice(selectedOrder.financials?.shippingFee)}
                </p>
                {Number(selectedOrder.financials?.discountAmount) > 0 && (
                  <p>
                    Giảm giá: -
                    {formatPrice(selectedOrder.financials?.discountAmount)}
                  </p>
                )}
                <p className="text-sm font-bold pt-1 border-t border-black">
                  TỔNG THU:{" "}
                  {selectedOrder.paymentInfo?.method === "COD"
                    ? formatPrice(selectedOrder.financials?.finalAmount)
                    : "0₫ (ĐÃ THANH TOÁN)"}
                </p>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-zinc-400 text-[10px] text-zinc-500">
                Cảm ơn bạn đã lựa chọn THE LUKI!
              </div>

              <Button
                type="primary"
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                }}
                className="w-full !bg-black hover:!bg-zinc-800 !h-9 !text-xs !font-bold !uppercase"
              >
                In Phiếu Này
              </Button>
            </div>
          )}
        </Modal>
      </ConfigProvider>
    </div>
  );
}
