import { useState } from "react";
import { Image, Switch, Modal, Popconfirm } from "antd";
import {
  Plus,
  Sparkles,
  Trash2,
  Eye,
  Pencil,
  Laptop,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import CreateEditbanner from "../../components/banner/CreateEditbanner";
import type { BannerItem } from "../../types/bannerType";
import {
  useGetAllBanners,
  useToggleActiveBanner,
  useDeleteBanner,
} from "../../hook/useBanner";

const POSITION_CONFIG = {
  home_hero: {
    label: "HERO BANNER (ĐẦU TRANG)",
    aspect: "16:9 / 21:9",
    tagClass: "bg-black text-white border-black",
  },
  popup: {
    label: "POPUP KHUYẾN MÃI",
    aspect: "4:5 / 1:1",
    tagClass: "bg-amber-50 text-amber-800 border-amber-300",
  },
};

const BannerPage = () => {
  const [selectedPosition, setSelectedPosition] = useState<"all" | "home_hero" | "popup">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Hook API
  const queryParams = selectedPosition === "all" ? undefined : { position: selectedPosition };
  const { data, isLoading, refetch } = useGetAllBanners(queryParams);
  const { mutate: toggleActive, isPending: isToggling } = useToggleActiveBanner();
  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();

  const banners = data?.banners || [];

  // Modal / Drawer tạo & chỉnh sửa
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Live Preview state
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setOpenModal(true);
  };

  const handleOpenLivePreview = (banner: BannerItem) => {
    setPreviewBanner(banner);
    setPreviewModalOpen(true);
  };

  const columns: ColumnType<BannerItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 65,
      align: "center",
      render: (_, __, index) => (
        <span className="font-mono text-xs font-bold text-zinc-500">
          #{String(index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "image",
      title: "HÌNH ẢNH BANNER",
      width: 180,
      align: "center",
      render: (_, record) => (
        <div className="w-28 h-14 border border-zinc-200 mx-auto overflow-hidden bg-zinc-100 flex items-center justify-center shrink-0 [&_.ant-image]:!w-full [&_.ant-image]:!h-full shadow-2xs">
          <Image
            src={record.image}
            alt="Banner preview"
            width={112}
            height={56}
            className="!w-full !h-full !object-cover cursor-pointer"
            fallback="https://placehold.co/200x100?text=No+Banner"
            preview={{
              mask: <div className="text-[9px] font-mono text-white font-bold">XEM ẢNH</div>,
            }}
          />
        </div>
      ),
    },
    {
      key: "position",
      title: "LOẠI / VỊ TRÍ",
      dataIndex: "position",
      width: 220,
      align: "center",
      render: (pos: "home_hero" | "popup") => {
        const config = POSITION_CONFIG[pos] || POSITION_CONFIG.home_hero;
        return (
          <div className="space-y-1">
            <span
              className={`font-mono text-[10px] font-bold uppercase px-2.5 py-1 border ${config.tagClass}`}
            >
              {config.label}
            </span>
            <span className="block text-[10px] text-zinc-400 font-mono">
              Tỷ lệ: {config.aspect}
            </span>
          </div>
        );
      },
    },
    {
      key: "isActive",
      title: "TRẠNG THÁI HIỂN THỊ",
      dataIndex: "isActive",
      width: 180,
      align: "center",
      render: (isActive: boolean, record) => (
        <div className="flex flex-col items-center gap-1.5 font-mono">
          <Switch
            checked={isActive}
            onChange={() => toggleActive(record._id)}
            disabled={isToggling}
            size="small"
            className={isActive ? "bg-black" : "bg-zinc-300"}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isActive ? "text-black" : "text-zinc-400"
            }`}
          >
            {isActive ? "ĐANG HIỂN THỊ" : "ĐANG TẮT"}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      width: 150,
      align: "center",
      render: (val) => (
        <span className="font-mono text-xs text-zinc-600">
          {new Date(val).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "action",
      title: "THAO TÁC",
      width: 140,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1.5">
          {/* Nút xem thử giả lập thiết bị */}
          <button
            type="button"
            onClick={() => handleOpenLivePreview(record)}
            className="w-8 h-8 border border-zinc-300 hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center cursor-pointer text-zinc-600"
            title="Xem thử hiển thị thực tế"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Nút chỉnh sửa banner */}
          <button
            type="button"
            onClick={() => handleOpenEdit(record)}
            className="w-8 h-8 border border-zinc-300 hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center cursor-pointer text-zinc-600"
            title="Chỉnh sửa banner"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Nút xóa banner */}
          <Popconfirm
            title="Xóa banner này?"
            description="Bạn có chắc chắn muốn xóa vĩnh viễn banner này không?"
            onConfirm={() => deleteBanner(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            disabled={isDeleting}
          >
            <button
              type="button"
              className="w-8 h-8 border border-zinc-300 hover:border-red-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer text-zinc-600"
              title="Xóa banner"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Tiêu đề trang & Nút Tạo mới */}
      <div className="border border-black p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs font-mono">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-zinc-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <span>QUẢN LÝ BANNER TỐI GIẢN</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Chỉ lưu ảnh & loại banner · Mỗi loại duy nhất 1 banner được bật hiển thị ra Client
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="h-9 px-3 bg-white border border-[#c8c5be] hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>LÀM MỚI</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-9 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TẠO BANNER MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh thẻ chỉ số thống kê (không đổi dù lọc tab) */}
      <div className="flex flex-col sm:flex-row border border-black bg-white rounded-none divide-y sm:divide-y-0 sm:divide-x divide-[#dedbd5]">
        <CardItem
          title="tổng banner"
          number={data?.totalBanner ?? 0}
        />
        <CardItem
          title="hero banner"
          number={data?.totalHomeHero ?? 0}
        />
        <CardItem
          title="popup khuyến mãi"
          number={data?.totalPopup ?? 0}
        />
      </div>

      {/* 3. Tab chuyển đổi nhanh vị trí & Chế độ xem */}
      <div className="bg-white border border-black p-3 shadow-2xs font-mono flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Bộ nút Tab phân loại theo vị trí */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "all", label: "TẤT CẢ VỊ TRÍ" },
            { key: "home_hero", label: "HERO BANNER" },
            { key: "popup", label: "POPUP" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedPosition(tab.key as "all" | "home_hero" | "popup")}
              className={`h-8 px-3 text-xs font-bold uppercase cursor-pointer transition-colors border ${
                selectedPosition === tab.key
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-white text-zinc-600 border-[#c8c5be] hover:bg-zinc-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chuyển chế độ xem */}
        <div className="flex items-center gap-1 border border-zinc-300 p-0.5 bg-zinc-50">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer transition-colors ${
              viewMode === "table" ? "bg-black text-white shadow-2xs" : "text-zinc-600 hover:text-black"
            }`}
          >
            Bảng danh sách
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase cursor-pointer transition-colors ${
              viewMode === "grid" ? "bg-black text-white shadow-2xs" : "text-zinc-600 hover:text-black"
            }`}
          >
            Thẻ hình ảnh
          </button>
        </div>
      </div>

      {/* 4. Nội dung Danh sách Banner */}
      {viewMode === "table" ? (
        <div className="bg-white border border-black shadow-2xs">
          <Table<BannerItem>
            rowKey="_id"
            dataSource={banners}
            columns={columns}
            loading={isLoading}
            skeletonRows={5}
          />
          <div className="p-3 border-t border-[#dedbd5] bg-zinc-50 text-xs font-mono text-zinc-500 flex justify-between items-center">
            <span>Hiển thị <strong className="text-zinc-900">{banners.length}</strong> banner</span>
            <span>Quy tắc: Khi bật một banner thì banner còn lại cùng loại sẽ tự tắt</span>
          </div>
        </div>
      ) : isLoading ? (
        /* Grid Skeleton Loading */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-zinc-200 bg-white p-0 animate-pulse font-mono">
              <div className="aspect-video bg-zinc-200" />
              <div className="p-3.5 flex items-center justify-between">
                <div className="h-4 w-24 bg-zinc-200" />
                <div className="h-5 w-5 bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Visual Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => {
            const config = POSITION_CONFIG[banner.position] || POSITION_CONFIG.home_hero;
            return (
              <div
                key={banner._id}
                className={`border bg-white transition-all duration-200 font-mono ${
                  banner.isActive ? "border-black shadow-xs" : "border-zinc-300 opacity-80"
                }`}
              >
                {/* Khung ảnh Banner */}
                <div className="relative aspect-video bg-zinc-100 border-b border-zinc-200 overflow-hidden group">
                  <img
                    src={banner.image}
                    alt="Banner thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x300?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLivePreview(banner)}
                      className="px-3 py-1.5 bg-white text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-zinc-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem thử</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(banner)}
                      className="px-3 py-1.5 bg-white text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-zinc-100"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border shadow-xs ${config.tagClass}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Phần thông tin thẻ & công tắc */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.isActive}
                      size="small"
                      onChange={() => toggleActive(banner._id)}
                      disabled={isToggling}
                      className={banner.isActive ? "bg-black" : "bg-zinc-300"}
                    />
                    <span className="text-[11px] font-bold uppercase text-zinc-800">
                      {banner.isActive ? "Đang kích hoạt" : "Đang tắt"}
                    </span>
                  </div>

                  <Popconfirm
                    title="Xóa banner này?"
                    onConfirm={() => deleteBanner(banner._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                    disabled={isDeleting}
                  >
                    <button
                      type="button"
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Drawer Thêm Mới / Chỉnh Sửa Banner */}
      <CreateEditbanner
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editingBanner ? "CHỈNH SỬA BANNER" : "THÊM MỚI BANNER"}
        initialValues={editingBanner}
      />

      {/* 6. Modal Giả lập Xem trước giao diện thực tế (Live Device Preview) */}
      <Modal
        title={null}
        footer={null}
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        width={previewDevice === "desktop" ? 1100 : 420}
        centered
        className="banner-preview-modal !p-0"
      >
        <div className="bg-zinc-950 text-white font-mono p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              XEM THỬ BANNER ({previewBanner?.position.toUpperCase()})
            </span>
          </div>

          {/* Nút chuyển đổi thiết bị Desktop / Mobile */}
          <div className="flex items-center gap-1 border border-zinc-700 p-0.5 bg-zinc-900">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`px-2.5 py-1 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                previewDevice === "desktop" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Máy tính</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`px-2.5 py-1 text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                previewDevice === "mobile" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Điện thoại</span>
            </button>
          </div>
        </div>

        {/* Khung hiển thị mô phỏng giao diện người dùng */}
        <div className="p-6 bg-zinc-100 flex items-center justify-center min-h-[380px] overflow-auto">
          {previewBanner?.position === "home_hero" ? (
            <div
              className={`bg-black text-white overflow-hidden shadow-2xl transition-all duration-300 relative ${
                previewDevice === "desktop" ? "w-full aspect-[21/9]" : "w-[340px] aspect-[4/5]"
              }`}
            >
              <img
                src={previewBanner.image}
                alt="Live Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full py-10 flex items-center justify-center">
              <div className="bg-white border-2 border-black p-4 shadow-2xl max-w-[360px] w-full text-center space-y-3 font-mono">
                <div className="w-full aspect-square bg-zinc-100 overflow-hidden border border-zinc-200">
                  <img
                    src={previewBanner?.image}
                    alt="Popup preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="w-full h-9 bg-black text-white font-bold uppercase text-xs cursor-pointer"
                >
                  XEM NGAY
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default BannerPage;
