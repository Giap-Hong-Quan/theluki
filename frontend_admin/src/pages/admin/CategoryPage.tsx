import { useMemo, useState } from "react";
import { Form, Input, Select, Button, ConfigProvider, Switch, Tooltip } from "antd";
import {
  Download,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  FolderTree,
} from "lucide-react";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import { useGetAllCategories, useToggleActiveCategory, useDeleteCategory } from "../../hook/useCategory";
import type { CategoryItem, GetCategoriesQueryParams } from "../../types/categoryType";
import debounce from "lodash/debounce";
import { CARD_CATEGORY } from "../../constants/card";
import CreateEditCategory from "../../components/category/modal/CreateEditCategory";

interface CategoryFilterFormValues {
  search?: string;
  isActive?: boolean;
}

const MOCK_DISTRIBUTION = [
  { label: "Áo Thun & T-Shirt", count: "42 SP", percentage: 26 },
  { label: "Quần Dài & Pants", count: "35 SP", percentage: 21 },
  { label: "Áo Khoác & Outerwear", count: "28 SP", percentage: 17 },
  { label: "Phụ Kiện & Accessories", count: "24 SP", percentage: 15 },
  { label: "Quần Jeans & Denim", count: "19 SP", percentage: 12 },
  { label: "Áo Sơ Mi & Khác", count: "16 SP", percentage: 9 },
];

const MOCK_STANDARDS = [
  { label: "Chuẩn hóa SEO Slug", value: "100% tự động" },
  { label: "Tối ưu hóa thẻ Meta SEO", value: "100%" },
  { label: "Độ dài Meta Title trung bình", value: "54 ký tự" },
  { label: "Sản phẩm trung bình / danh mục", value: "27.3 SP" },
  { label: "Thời gian đồng bộ dữ liệu", value: "Thời gian thực" },
];

const CategoryPage = () => {
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<GetCategoriesQueryParams>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  const { data: listCategories, isLoading } = useGetAllCategories(filter);
  const { mutate: toggleActive } = useToggleActiveCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const categoryList = listCategories?.categories || [];
  console.log("categoryList",categoryList);
  const onFilter = (values: CategoryFilterFormValues) => {
    setFilter({
      search: values.search,
      isActive: values.isActive,
    });
  };

  const handleDebouncedFilter = useMemo(
    () =>
      debounce((values: CategoryFilterFormValues) => {
        onFilter(values);
      }, 500),
    []
  );

  const columns: ColumnType<CategoryItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span className="font-mono text-xs font-bold text-zinc-500">
          #{String(index + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "name",
      title: "TÊN DANH MỤC",
      dataIndex: "name",
      width: 220,
      align: "left",
      render: (val) => (
        <span className="font-bold text-zinc-950 font-sans text-xs sm:text-sm">
          {val || "Chưa đặt tên"}
        </span>
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
          /{val}
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
      key: "seo",
      title: "TIÊU ĐỀ SEO",
      dataIndex: "seo",
      width: 260,
      align: "left",
      render: (seo) => (
        <Tooltip title={seo?.metaTitle || "—"}>
          <span className="text-zinc-600 font-sans text-xs truncate block max-w-[240px]">
            {seo?.metaTitle || "—"}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "createdAt",
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      width: 140,
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
      width: 130,
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
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(record);
              setOpenModal(true);
            }}
            className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            title="Chỉnh sửa danh mục"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => deleteCategory(record._id)}
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
            <FolderTree className="w-6 h-6 text-zinc-900" />
            <span>DANH MỤC SẢN PHẨM</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {listCategories?.totalCategory ?? 0} danh mục · {listCategories?.totalActive ?? 0} đang hoạt động
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
              setSelectedCategory(null);
              setOpenModal(true);
            }}
            className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TẠO DANH MỤC</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh thẻ chỉ số thống kê */}
      <div className="flex flex-col sm:flex-row border border-black bg-white rounded-none divide-y sm:divide-y-0 sm:divide-x divide-[#dedbd5]">
        {CARD_CATEGORY.map((card) => (
          <CardItem
            key={card.title}
            title={card.title}
            number={card.number(listCategories)}
          />
        ))}
      </div>

      {/* 3. Thanh Bộ Lọc dùng Ant Design Form & Select */}
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
                placeholder="Tìm theo tên danh mục, đường dẫn slug..."
                allowClear
              />
            </Form.Item>

            <Form.Item name="isActive" className="!mb-0">
              <Select
                placeholder="Trạng thái hiển thị"
                allowClear
                className="min-w-[170px]"
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
                  setFilter({});
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

      {/* 4. Bảng danh sách danh mục */}
      <div className="w-full bg-white rounded-none shadow-2xs">
        <Table<CategoryItem>
          columns={columns}
          dataSource={categoryList}
          rowKey="_id"
          loading={isLoading}
          skeletonRows={6}
        />
        <div className="border-t border-[#dedbd5] px-4 py-2.5 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Tổng số: <strong className="text-zinc-900">{categoryList.length}</strong> danh mục</span>
          <span>Hiển thị toàn bộ không phân trang</span>
        </div>
      </div>

      {/* 5. 2 Card thống kê và tối ưu bên dưới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Phân bổ sản phẩm theo danh mục */}
        <div className="bg-white border border-[#c8c5be] p-5 shadow-2xs rounded-none">
          <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-sans border-b border-[#e5e3df] pb-3 mb-4">
            PHÂN BỔ SẢN PHẨM THEO DANH MỤC
          </h2>
          <div className="space-y-4">
            {MOCK_DISTRIBUTION.map((item) => (
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

        {/* Card 2: Tiêu chuẩn SEO & Vận hành */}
        <div className="bg-white border border-[#c8c5be] p-5 shadow-2xs rounded-none flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-900 font-sans border-b border-[#e5e3df] pb-3 mb-2">
              TIÊU CHUẨN SEO & VẬN HÀNH DANH MỤC
            </h2>
            <div className="divide-y divide-[#ece9e4]">
              {MOCK_STANDARDS.map((item) => (
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

      {/* 6. Drawer tạo và cập nhật danh mục */}
      <CreateEditCategory
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedCategory(null);
        }}
        title={selectedCategory ? "CẬP NHẬT DANH MỤC" : "THÊM MỚI DANH MỤC"}
        initialValues={selectedCategory}
      />
    </div>
  );
};

export default CategoryPage;
