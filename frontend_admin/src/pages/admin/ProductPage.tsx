import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Form,Input,InputNumber,Select,Button,ConfigProvider,Switch,Image,Popconfirm,Tooltip,} from "antd";
import {Download,Plus,Search,RotateCcw,Pencil,Trash2,Shirt,Star,Eye,Image as ImageIcon,} from "lucide-react";
import debounce from "lodash/debounce";
import CardItem from "../../components/common/CardItem";
import Table, { type ColumnType } from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { CARD_PRODUCT } from "../../constants/card";
import type { ProductItem, GetProductsQueryParams } from "../../types/productType";
import {
  useGetAllProducts,
  useToggleActiveProduct,
  useDeleteProduct,
} from "../../hook/useProduct";
import { useGetAllCategories } from "../../hook/useCategory";
import { useGetAllCollections } from "../../hook/useCollection";
import CreateEditProduct from "../../components/product/modal/CreateEditProduct";
import { formatPrice } from "../../utils/formatPrice";

interface ProductFilterFormValues {
  search?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

const ProductPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<GetProductsQueryParams>({
    page: 1,
    sizePage: 20,
  });
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  
  const { data: listProducts, isLoading } = useGetAllProducts(filter);
  const { mutate: toggleActive } = useToggleActiveProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { data: listCategories } = useGetAllCategories({ isActive: true });
  const { data: listCollections } = useGetAllCollections({ isActive: true });
  const products = listProducts?.products || [];

  const onFilter = (values: ProductFilterFormValues) => {
    setFilter((prev) => ({
      ...prev,
      page: 1,
      search: values.search?.trim() || undefined,
      category: values.category || undefined,
      collection: values.collection || undefined,
      minPrice:
        values.minPrice !== undefined &&
        values.minPrice !== null &&
        !isNaN(Number(values.minPrice))
          ? Number(values.minPrice)
          : undefined,
      maxPrice:
        values.maxPrice !== undefined &&
        values.maxPrice !== null &&
        !isNaN(Number(values.maxPrice))
          ? Number(values.maxPrice)
          : undefined,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    }));
  };

  const handleDebouncedFilter = useMemo(
    () =>
      debounce((values: ProductFilterFormValues) => {
        onFilter(values);
      }, 500),
    []
  );

  const handleResetFilter = () => {
    form.resetFields();
    setFilter({ page: 1, sizePage: 20 });
  };

  // Thống kê động cho CARD_PRODUCT lấy trực tiếp từ API backend theo bộ lọc
  const stats = useMemo(() => {
    return {
      totalProduct: listProducts?.totalProduct ?? 0,
      totalActive: listProducts?.totalActive ?? 0,
      totalFeatured: listProducts?.totalFeatured ?? 0,
      totalInactive: listProducts?.totalInactive ?? 0,
    };
  }, [listProducts]);

  // Cấu hình đầy đủ các cột sản phẩm theo DB Schema (Sử dụng Table tiêu chuẩn)
  const columns: ColumnType<ProductItem>[] = [
    {
      key: "stt",
      title: "STT",
      width: 65,
      align: "center",
      render: (_, __, index) => {
        const page = filter.page ?? 1;
        const sizePage = filter.sizePage ?? 10;
        const stt = (page - 1) * sizePage + index + 1;
        return (
          <span className="font-mono text-xs font-bold text-zinc-500">
            {stt}
          </span>
        );
      },
    },
    {
      key: "thumbnail",
      title: "ẢNH BÌA",
      width: 85,
      align: "center",
      render: (_, record) => (
        <div className="w-12 h-12 border border-zinc-200 mx-auto overflow-hidden bg-zinc-100 flex items-center justify-center shrink-0 [&_.ant-image]:!w-full [&_.ant-image]:!h-full">
          {record.thumbnail ? (
            <Image
              src={record.thumbnail}
              alt={record.name}
              width={48}
              height={48}
              className="!w-full !h-full !object-cover cursor-pointer"
              fallback="https://placehold.co/100x100?text=SP"
              preview={{
                mask: (
                  <div className="text-[9px] font-mono text-white font-bold">
                    XEM
                  </div>
                ),
              }}
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      ),
    },
    {
      key: "name",
      title: "TÊN SẢN PHẨM",
      width: 330,
      align: "left",
      render: (_, record) => (
        <div className="space-y-1">
          <Tooltip title={record.name} placement="topLeft">
            <span className="font-bold text-zinc-950 font-sans text-xs sm:text-sm block truncate max-w-[300px] cursor-pointer">
              {record.name}
            </span>
          </Tooltip>
          <Tooltip title={`/${record.slug}`} placement="topLeft">
            <span className="font-mono text-zinc-400 text-[11px] block truncate max-w-[280px]">
              /{record.slug}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "seoTitle",
      title: "TIÊU ĐỀ SEO",
      width: 230,
      align: "left",
      render: (_, record) => {
        const metaTitle = record.seo?.metaTitle;
        if (!metaTitle) {
          return <span className="font-mono text-xs text-zinc-400">—</span>;
        }
        return (
          <Tooltip title={metaTitle} placement="topLeft">
            <span className="font-sans text-xs text-zinc-700 block truncate max-w-[200px] cursor-pointer hover:text-black">
              {metaTitle}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "sku",
      title: "MÃ SKU",
      width: 140,
      align: "left",
      render: (_, record) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-800">
          {record.sku}
        </span>
      ),
    },
    {
      key: "category",
      dataIndex: "category",
      title: "DANH MỤC",
      width: 160,
      align: "left",
      render: (_, record) => {
        const catName = record.category?.name || "Chưa phân loại";
        return (
          <Tooltip title={catName} placement="topLeft">
            <span className="font-bold text-xs text-zinc-950 block truncate max-w-[140px] cursor-pointer">
              {catName}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "collections",
      dataIndex: "collections",
      title: "BỘ SƯU TẬP",
      width: 190,
      align: "left",
      render: (_, record) => {
        const colNames =
          record.collections?.map((c) => c.name).join(", ") || "";
        if (!colNames) {
          return <span className="font-mono text-[11px] text-zinc-400 block">—</span>;
        }
        return (
          <Tooltip title={colNames} placement="topLeft">
            <span className="font-sans text-xs text-zinc-600 block truncate max-w-[170px] cursor-pointer hover:text-black">
              {colNames}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "price",
      title: "GIÁ BÁN",
      width: 120,
      align: "right",
      render: (_, record) => (
        <span className="font-mono font-bold text-xs text-zinc-950 block">
          {formatPrice(record.price)}
        </span>
      ),
    },
    {
      key: "stock",
      title: "TỒN KHO",
      width: 95,
      align: "center",
      render: (_, record) => (
        <span
          className={`font-mono font-bold text-xs px-2 py-0.5 border ${
            record.stock <= 30
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-zinc-100 text-zinc-900 border-zinc-300"
          }`}
        >
          {record.stock}
        </span>
      ),
    },
    {
      key: "sold",
      title: "ĐÃ BÁN",
      width: 85,
      align: "center",
      render: (_, record) => (
        <span className="font-mono text-xs text-zinc-700">
          {record.sold || 0}
        </span>
      ),
    },
    {
      key: "weight",
      title: "TRỌNG LƯỢNG",
      width: 100,
      align: "center",
      render: (_, record) => (
        <span className="font-mono text-xs text-zinc-600">
          {record.weight || 300}g
        </span>
      ),
    },
    {
      key: "isFeatured",
      title: "TRANG CHỦ",
      width: 110,
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
      key: "isActive",
      title: "TRẠNG THÁI",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={record.isActive}
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
          <Tooltip title="Xem chi tiết sản phẩm">
            <button
              type="button"
              onClick={() => navigate(`/products/${record._id}`)}
              className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa sản phẩm">
            <button
              type="button"
              onClick={() => {
                setEditingProduct(record);
                setIsCreateEditModalOpen(true);
              }}
              className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa sản phẩm?"
            description="Sản phẩm sẽ được chuyển vào thùng rác."
            onConfirm={() => deleteProduct(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa sản phẩm">
              <button
                type="button"
                className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          </Popconfirm>
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
            <Shirt className="w-6 h-6 text-zinc-900" />
            <span>SẢN PHẨM (PRODUCT)</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {stats.totalProduct} sản phẩm · {stats.totalActive} đang hoạt động
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
              setEditingProduct(null);
              setIsCreateEditModalOpen(true);
            }}
            className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TẠO SẢN PHẨM</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh thẻ chỉ số thống kê */}
      <div className="flex flex-col sm:flex-row border border-black bg-white rounded-none divide-y sm:divide-y-0 sm:divide-x divide-[#dedbd5]">
        {CARD_PRODUCT.map((card) => (
          <CardItem
            key={card.title}
            title={card.title}
            number={card.number(stats)}
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
            className="w-full flex flex-wrap items-center gap-y-2"
            onValuesChange={(_, allValues) => handleDebouncedFilter(allValues)}
          >
            <Form.Item name="search" className="!mb-0 flex-1 min-w-[220px]">
              <Input
                prefix={<Search className="w-4 h-4 text-zinc-500 mr-1" />}
                placeholder="Tìm theo tên sản phẩm, mã SKU..."
                allowClear
              />
            </Form.Item>

            <Form.Item name="category" className="!mb-0">
              <Select
                placeholder="Tất cả danh mục"
                allowClear
                className="min-w-[150px]"
                options={listCategories?.categories.map((cat) => ({ value: cat._id, label: cat.name }))}
              />
            </Form.Item>

            <Form.Item name="collection" className="!mb-0">
              <Select
                placeholder="Tất cả bộ sưu tập"
                allowClear
                className="min-w-[160px]"
                options={listCollections?.collections.map((col) => ({ value: col._id, label: col.name }))}
              />
            </Form.Item>

            <Form.Item name="minPrice" className="!mb-0">
              <InputNumber
                placeholder="Giá từ (₫)"
                min={0}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) =>
                  (value ? value.replace(/\$\s?|(,*)/g, "") : "") as any
                }
                className="!w-[125px]"
              />
            </Form.Item>

            <Form.Item name="maxPrice" className="!mb-0">
              <InputNumber
                placeholder="Giá đến (₫)"
                min={0}
                formatter={(value) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) =>
                  (value ? value.replace(/\$\s?|(,*)/g, "") : "") as any
                }
                className="!w-[125px]"
              />
            </Form.Item>

            <Form.Item name="isFeatured" className="!mb-0">
              <Select
                placeholder="Loại sản phẩm"
                allowClear
                className="min-w-[150px]"
                options={[
                  { value: true, label: "⭐ GHIM NỔI BẬT" },
                  { value: false, label: "SẢN PHẨM THƯỜNG" },
                ]}
              />
            </Form.Item>

            <Form.Item name="isActive" className="!mb-0">
              <Select
                placeholder="Trạng thái hiển thị"
                allowClear
                className="min-w-[150px]"
                options={[
                  { value: true, label: "ĐANG HOẠT ĐỘNG" },
                  { value: false, label: "NGƯNG HOẠT ĐỘNG" },
                ]}
              />
            </Form.Item>

            <Form.Item className="!mb-0">
              <Button
                onClick={handleResetFilter}
                icon={<RotateCcw className="w-3.5 h-3.5 text-white" />}
                className="!bg-black hover:!bg-zinc-800 !text-white text-xs flex items-center font-mono cursor-pointer transition-colors"
              >
                ĐẶT LẠI
              </Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </div>

      {/* 4. Bảng Sản phẩm tiêu chuẩn (Table component chung) */}
      <div className="w-full bg-white rounded-none shadow-2xs">
        <Table<ProductItem>
          columns={columns}
          dataSource={products}
          rowKey="_id"
          loading={isLoading}
          skeletonRows={6}
          emptyText="Không tìm thấy sản phẩm nào trong hệ thống"
        />

        <div className="border-t flex flex-col sm:flex-row items-center justify-between gap-3 border-[#dedbd5] px-4 py-2">
          <span className="text-xs font-mono text-zinc-500">
            Hiển thị <strong className="text-zinc-900">{products.length}</strong> / <strong className="text-zinc-900">{stats.totalProduct}</strong> sản phẩm
          </span>
          <Pagination
            currentPage={filter.page ?? 1}
            totalItems={stats.totalProduct}
            pageSize={filter.sizePage ?? 20}
            onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
          />
        </div>
      </div>

      {/* 5. Modal / Drawer Tạo & Chỉnh sửa sản phẩm */}
      <CreateEditProduct
        open={isCreateEditModalOpen}
        onClose={() => {
          setIsCreateEditModalOpen(false);
          setEditingProduct(null);
        }}
        initialValues={editingProduct}
        title={
          editingProduct
            ? `CHỈNH SỬA: ${editingProduct.name.toUpperCase()}`
            : "THÊM MỚI SẢN PHẨM"
        }
      />
    </div>
  );
};

export default ProductPage;
