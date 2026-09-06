import { useMemo, useState } from "react";
import { Form, Input, Select, Button, ConfigProvider, Switch, Tooltip, Image } from "antd";
import {
  Download,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Layers,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import {
  useGetAllCollections,
  useToggleActiveCollection,
  useDeleteCollection,
} from "../../hook/useCollection";
import type { CollectionItem, GetCollectionsQueryParams } from "../../types/collectionType";
import debounce from "lodash/debounce";
import { CARD_COLLECTION } from "../../constants/card";
import CreateEditCollection from "../../components/collection/modal/CreateEditCollection";

interface CollectionFilterFormValues {
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

const MOCK_COLLECTION_STANDARDS = [
  { label: "Chuẩn hóa hình ảnh Thumbnail", value: "100% tỷ lệ 16:10" },
  { label: "Bộ sưu tập có ảnh Banner Lookbook", value: "92.5%" },
  { label: "Sản phẩm trung bình / BST", value: "18.4 SP" },
  { label: "Tỷ lệ bộ sưu tập được Ghim nổi bật", value: "25.0%" },
  { label: "Tự động sinh SEO Meta Title & Slug", value: "100% tự động" },
];

const MOCK_CAMPAIGN_DISTRIBUTION = [
  { label: "Lookbook Xuân Hè (Spring Summer)", count: "6 BST", percentage: 38 },
  { label: "Capsule Collection Độc Bản", count: "4 BST", percentage: 25 },
  { label: "Streetwear Holiday & Tết", count: "3 BST", percentage: 19 },
  { label: "Collab & Nghệ sĩ đường phố", count: "2 BST", percentage: 12 },
  { label: "Bộ sưu tập Basics thiết yếu", count: "1 BST", percentage: 6 },
];

const CollectionPage = () => {
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<GetCollectionsQueryParams>({
    page: 1,
    sizePage: 10,
  });

  const [openModal, setOpenModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);

  const { data: listCollections, isLoading } = useGetAllCollections(filter);
  const { mutate: toggleActive } = useToggleActiveCollection();
  const { mutate: deleteCollection } = useDeleteCollection();

  const collectionList = listCollections?.collections || [];
  const totalItems = listCollections?.totalCollection || 0;

  const onFilter = (values: CollectionFilterFormValues) => {
    setFilter((prev) => ({
      ...prev,
      page: 1,
      search: values.search,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
    }));
  };

  const handleDebouncedFilter = useMemo(
    () =>
      debounce((values: CollectionFilterFormValues) => {
        onFilter(values);
      }, 500),
    []
  );

  const columns: ColumnType<CollectionItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 65,
      align: "center",
      render: (_, __, index) => {
        const page = filter.page ?? 1;
        const size = filter.sizePage ?? 10;
        const currentNumber = (page - 1) * size + index + 1;
        return (
          <span className="font-mono text-xs font-bold text-zinc-500">
            #{String(currentNumber).padStart(2, "0")}
          </span>
        );
      },
    },
    {
      key: "thumbnail",
      title: "ẢNH BÌA",
      width: 100,
      align: "center",
      render: (_, record) => {
        const imageUrl = record.thumbnail_url || record.banner_url;
        return (
          <div className="w-14 h-9 border border-zinc-200 mx-auto overflow-hidden bg-zinc-100 flex items-center justify-center shrink-0 [&_.ant-image]:!w-full [&_.ant-image]:!h-full">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={record.name}
                width={56}
                height={36}
                className="!w-full !h-full !object-cover cursor-pointer"
                fallback="https://placehold.co/100x60?text=No+Img"
                preview={{
                  mask: <div className="text-[9px] font-mono text-white font-bold">XEM</div>,
                }}
              />
            ) : (
              <ImageIcon className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        );
      },
    },
    {
      key: "name",
      title: "TÊN BỘ SƯU TẬP",
      dataIndex: "name",
      width: 240,
      align: "left",
      render: (val, record) => (
        <div className="space-y-0.5">
          <span className="font-bold text-zinc-950 font-sans text-xs sm:text-sm block">
            {val || "Chưa đặt tên"}
          </span>
          {record.description && (
            <Tooltip title={record.description}>
              <p className="text-[11px] text-zinc-500 truncate max-w-[220px] font-sans font-normal">
                {record.description}
              </p>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      title: "ĐƯỜNG DẪN (SLUG)",
      dataIndex: "slug",
      width: 200,
      align: "left",
      render: (val) => (
        <span className="font-mono text-zinc-600 text-xs px-2 py-0.5 bg-zinc-50 border border-zinc-200">
          /collection/{val}
        </span>
      ),
    },
    {
      key: "productCount",
      title: "SỐ SẢN PHẨM",
      dataIndex: "productCount",
      width: 130,
      align: "center",
      render: (val) => (
        <span className="font-mono text-zinc-900 font-bold text-xs">
          {val ?? 0} SP
        </span>
      ),
    },
    {
      key: "isFeatured",
      title: "TRANG CHỦ",
      dataIndex: "isFeatured",
      width: 140,
      align: "center",
      render: (isFeatured) =>
        isFeatured ? (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 border border-amber-300 bg-amber-50 text-amber-800">
            <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
            NỔI BẬT
          </span>
        ) : (
          <span className="font-mono text-[11px] text-zinc-400 px-2 py-0.5 bg-zinc-50 border border-zinc-200">
            THƯỜNG
          </span>
        ),
    },
    {
      key: "createdAt",
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      width: 130,
      align: "center",
      render: (val) => (
        <span className="font-mono text-zinc-600 text-xs">
          {val ? new Date(val).toLocaleDateString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      title: "TRẠNG THÁI",
      dataIndex: "isActive",
      width: 120,
      align: "center",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={() => toggleActive(record._id)}
          className="[&.ant-switch-checked]:!bg-black"
        />
      ),
    },
    {
      key: "action",
      title: "THAO TÁC",
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCollection(record);
              setOpenModal(true);
            }}
            className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            title="Chỉnh sửa bộ sưu tập"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => deleteCollection(record._id)}
            className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Chuyển vào thùng rác"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 font-sans flex items-center gap-2">
            <Layers className="w-6 h-6 text-zinc-900" />
            <span>BỘ SƯU TẬP (COLLECTION)</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {listCollections?.totalCollection ?? 0} bộ sưu tập · {listCollections?.totalActive ?? 0} đang hoạt động · {listCollections?.totalFeatured ?? 0} nổi bật trang chủ
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            type="button"
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>THÙNG RÁC</span>
          </button>
          <button
            type="button"
            className="h-9 px-3.5 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-800 rounded-none hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>XUẤT EXCEL</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCollection(null);
              setOpenModal(true);
            }}
            className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TẠO BỘ SƯU TẬP</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh thẻ chỉ số thống kê */}
      <div className="flex flex-col sm:flex-row border border-black bg-white rounded-none divide-y sm:divide-y-0 sm:divide-x divide-[#dedbd5]">
        {CARD_COLLECTION.map((card) => (
          <CardItem
            key={card.title}
            title={card.title}
            number={card.number(listCollections)}
          />
        ))}
      </div>

      {/* 3. Thanh Bộ Lọc dùng Ant Design Form */}
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
              Select: {
                hoverBorderColor: "#000000",
                activeBorderColor: "#000000",
                activeOutlineColor: "transparent",
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
            onValuesChange={(_, allValues) => {
              handleDebouncedFilter(allValues);
            }}
            layout="inline"
            className="w-full flex flex-wrap items-center"
          >
            <Form.Item name="search" className="!mb-0 flex-1 min-w-[240px]">
              <Input
                prefix={<Search className="w-4 h-4 text-zinc-500 mr-1" />}
                placeholder="Tìm kiếm theo tên bộ sưu tập..."
                allowClear
              />
            </Form.Item>

            <Form.Item name="isFeatured" className="!mb-0">
              <Select
                placeholder="Vị trí hiển thị"
                allowClear
                className="min-w-[170px]"
                options={[
                  { value: true, label: "Ghim Nổi Bật (Trang chủ)" },
                  { value: false, label: "Bộ Sưu Tập Thường" },
                ]}
              />
            </Form.Item>

            <Form.Item name="isActive" className="!mb-0">
              <Select
                placeholder="Trạng thái"
                allowClear
                className="min-w-[160px]"
                options={[
                  { value: true, label: "ĐANG HOẠT ĐỘNG" },
                  { value: false, label: "NGƯNG HOẠT ĐỘNG" },
                ]}
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button
                onClick={() => {
                  form.resetFields();
                  setFilter({ page: 1, sizePage: 10 });
                }}
                icon={<RotateCcw className="w-3.5 h-3.5 text-white" />}
                className="!bg-black hover:!bg-zinc-800 !text-white text-xs flex items-center font-mono cursor-pointer transition-colors"
              >
                ĐẶT LẠI
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </div>

      {/* 4. Bảng danh sách bộ sưu tập */}
      <div className="w-full bg-white rounded-none shadow-2xs">
        <Table<CollectionItem>
          columns={columns}
          dataSource={collectionList}
          rowKey="_id"
          loading={isLoading}
          skeletonRows={filter.sizePage ?? 10}
        />
        <div className="border-t flex items-center justify-between border-[#dedbd5] px-4 py-1">
          <span className="text-xs font-mono text-zinc-500">
            Hiển thị <strong className="text-zinc-900">{collectionList.length}</strong> / <strong className="text-zinc-900">{totalItems}</strong> bộ sưu tập
          </span>
          <Pagination
            currentPage={filter.page ?? 1}
            totalItems={totalItems}
            pageSize={filter.sizePage ?? 10}
            onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
          />
        </div>
      </div>

      {/* 5. 2 Card phân bổ và tối ưu hóa bên dưới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Phân bổ chiến dịch bộ sưu tập */}
        <div className="bg-white border border-[#c8c5be] p-5 shadow-2xs rounded-none">
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-sans border-b border-[#e5e3df] pb-3 mb-4">
            PHÂN BỔ THEO CHIẾN DỊCH LOOKBOOK
          </h2>
          <div className="space-y-4">
            {MOCK_CAMPAIGN_DISTRIBUTION.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-700 font-medium font-sans">
                    {item.label}
                  </span>
                  <span className="font-mono text-zinc-900 font-semibold">
                    {item.count} · {item.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#eae7e1] overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Tiêu chuẩn truyền thông & SEO */}
        <div className="bg-white border border-[#c8c5be] p-5 shadow-2xs rounded-none flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-sans border-b border-[#e5e3df] pb-3 mb-2">
              TIÊU CHUẨN TRUYỀN THÔNG & LOOKBOOK
            </h2>
            <div className="divide-y divide-[#ece9e4]">
              {MOCK_COLLECTION_STANDARDS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <span className="text-zinc-700 font-sans">
                    {item.label}
                  </span>
                  <span className="font-mono font-bold text-zinc-950">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Drawer tạo và cập nhật bộ sưu tập */}
      <CreateEditCollection
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedCollection(null);
        }}
        title={selectedCollection ? "CẬP NHẬT BỘ SƯU TẬP" : "THÊM MỚI BỘ SƯU TẬP"}
        initialValues={selectedCollection}
      />
    </div>
  );
};

export default CollectionPage;
