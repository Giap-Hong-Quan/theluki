import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Image, Switch, Popconfirm, Tag, Skeleton } from "antd";
import { ArrowLeft, Pencil, Trash2, ExternalLink, Shirt, Star, Layers,Globe,Code2,Package,Weight,DollarSign,Copy,Info,Sliders,} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {useGetProductById,useToggleActiveProduct,useDeleteProduct,} from "../../hook/useProduct";
import CreateEditProduct from "../../components/product/modal/CreateEditProduct";
import copyToClipboard from "../../utils/copyText";
import { formatPrice } from "../../utils/formatPrice";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"variants" | "attributes" | "description" | "seo" | "raw_json">("variants");

  const { data: product, isLoading, isError } = useGetProductById(id);
  const { mutate: toggleActive, isPending: isToggling } = useToggleActiveProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const handleDelete = () => {
    if (!product?._id) return;
    deleteProduct(product._id, {
      onSuccess: () => {
        navigate("/products");
      },
    });
  };

  // Đường dẫn xem trang sản phẩm phía Client
  const clientProductUrl = product?.slug
    ? import.meta.env.PROD
      ? `https://theluki.click/product/${product.slug}`
      : `http://localhost:3000/product/${product.slug}`
    : "#";

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans p-2">
        <div className="flex items-center gap-3">
          <Skeleton.Button active style={{ width: 120, height: 36 }} />
          <Skeleton.Input active style={{ width: 300, height: 36 }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 border border-zinc-200 bg-white">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-zinc-200 bg-white p-6">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
          <div className="border border-zinc-200 bg-white p-6">
            <Skeleton active avatar paragraph={{ rows: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-12 text-center bg-white border border-black space-y-4 font-sans max-w-xl mx-auto mt-10 shadow-2xs">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Shirt className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black uppercase text-zinc-900">
          KHÔNG TÌM THẤY SẢN PHẨM
        </h2>
        <p className="text-xs text-zinc-500">
          Sản phẩm có thể đã bị xóa hoặc đường dẫn liên kết không chính xác (ID:{" "}
          {id}).
        </p>
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="h-9 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>QUAY LẠI DANH SÁCH</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-zinc-900">
      {/* 1. Thanh Breadcrumb & Nút điều hướng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e3df] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link
              to="/products"
              className="hover:text-black flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>DANH SÁCH SẢN PHẨM</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 font-sans">
              {product.name}
            </h1>

            {/* Trạng thái badges */}
            <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-zinc-900 bg-zinc-900 text-white">
              SKU: {product.sku}
            </span>

            {product.isActive ? (
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-emerald-600 bg-emerald-50 text-emerald-800">
                ĐANG KINH DOANH
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-zinc-300 bg-zinc-100 text-zinc-600">
                TẠM NGỪNG
              </span>
            )}

            {product.isFeatured && (
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-amber-400 bg-amber-50 text-amber-900 inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                NỔI BẬT
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#c8c5be] text-xs">
            <span className="text-zinc-600 text-[11px]">BÁN:</span>
            <Switch
              checked={product.isActive}
              loading={isToggling}
              size="small"
              onChange={() => toggleActive(product._id)}
              className="[&.ant-switch-checked]:!bg-black"
            />
          </div>

          <a
            href={clientProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 bg-white hover:bg-zinc-50 border border-[#c8c5be] text-zinc-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Xem hiển thị phía khách hàng"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">XEM TRÊN WEB</span>
          </a>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="h-9 px-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>CHỈNH SỬA</span>
          </button>

          <Popconfirm
            title="Xác nhận xóa sản phẩm này?"
            description="Sản phẩm sẽ được chuyển vào thùng rác."
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <button
              type="button"
              className="h-9 px-3 bg-white hover:bg-red-50 text-zinc-500 hover:text-red-600 border border-[#c8c5be] text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer transition-colors"
              title="Chuyển vào thùng rác"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      </div>

      {/* 2. Thẻ chỉ số nổi bật (Stats Matrix) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Giá bán */}
        <div className="bg-white border border-black p-3.5 shadow-2xs">
          <div className="text-[11px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
            <span>GIÁ BÁN THỰC TẾ</span>
          </div>
          <div className="text-base sm:text-lg font-black text-zinc-950 font-sans tracking-tight">
            {formatPrice(product.price)}
          </div>
          {product.original_price && (
            <div className="text-[11px] text-zinc-400 line-through mt-0.5 font-sans">
              {formatPrice(product.original_price)}
            </div>
          )}
        </div>

        {/* Tồn kho */}
        <div className="bg-white border border-black p-3.5 shadow-2xs">
          <div className="text-[11px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
            <Package className="w-3.5 h-3.5 text-zinc-600" />
            <span>TỔNG TỒN KHO</span>
          </div>
          <div
            className={`text-base sm:text-lg font-black font-sans ${
              product.stock <= 30 ? "text-amber-600" : "text-zinc-950"
            }`}
          >
            {product.stock} <span className="text-xs font-normal">sản phẩm</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {product.stock <= 30 ? "Sắp hết hàng" : "Kho ổn định"}
          </div>
        </div>

        {/* Đã bán */}
        <div className="bg-white border border-black p-3.5 shadow-2xs">
          <div className="text-[11px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
            <Shirt className="w-3.5 h-3.5 text-zinc-600" />
            <span>ĐÃ BÁN RA</span>
          </div>
          <div className="text-base sm:text-lg font-black text-zinc-950 font-sans">
            {product.sold || 0}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Lượt hoàn tất đơn</div>
        </div>

        {/* Trọng lượng */}
        <div className="bg-white border border-black p-3.5 shadow-2xs">
          <div className="text-[11px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
            <Weight className="w-3.5 h-3.5 text-zinc-600" />
            <span>TRỌNG LƯỢNG</span>
          </div>
          <div className="text-base sm:text-lg font-black text-zinc-950 font-sans">
            {product.weight || 300} <span className="text-xs font-normal">gram</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Chuẩn cước ViettelPost</div>
        </div>

        {/* Đánh giá */}
        <div className="bg-white border border-black p-3.5 shadow-2xs">
          <div className="text-[11px] text-zinc-500 uppercase flex items-center gap-1 mb-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>ĐÁNH GIÁ</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-600 flex items-center gap-1 font-sans">
            <span>{product.ratings?.average || 5.0}</span>
            <span className="text-xs text-zinc-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {product.ratings?.count || 0} lượt nhận xét
          </div>
        </div>
      </div>

      {/* 3. Bố cục chính 2 Cột (Chi tiết & Media/Meta) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CỘT TRÁI (2/3): TABS NỘI DUNG CHI TIẾT */}
        <div className="lg:col-span-2 space-y-4">
          {/* Brutalist Tab Header Bar */}
          <div className="flex border border-black bg-white p-1 gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("variants")}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === "variants"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Biến thể & Size ({product.variants?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("attributes")}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === "attributes"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Thuộc tính ({product.attributes?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === "description"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Mô tả chi tiết</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === "seo"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>SEO Google</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("raw_json")}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === "raw_json"
                  ? "bg-black text-white"
                  : "text-zinc-600 hover:text-black hover:bg-zinc-100"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Dữ liệu JSON DB</span>
            </button>
          </div>

          {/* TAB 1: BIẾN THỂ MÀU SẮC & MA TRẬN TỒN KHO */}
          {activeTab === "variants" && (
            <div className="space-y-4">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant, vIdx) => {
                  const variantTotalStock = (variant.sizes || []).reduce(
                    (acc, curr) => acc + (Number(curr.stock) || 0),
                    0
                  );

                  return (
                    <div
                      key={variant._id || vIdx}
                      className="border border-black bg-white p-4 space-y-3 shadow-2xs"
                    >
                      {/* Tiêu đề Biến thể màu */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs bg-black text-white px-2 py-0.5">
                            #{String(vIdx + 1).padStart(2, "0")}
                          </span>
                          <span className="font-black text-sm uppercase text-zinc-950 font-sans">
                            {variant.color}
                          </span>
                          {variant.sku && (
                            <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 border border-zinc-200">
                              SKU: {variant.sku}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-zinc-500">
                            Tổng tồn màu:{" "}
                            <strong className="text-zinc-950 font-bold">
                              {variantTotalStock}
                            </strong>
                          </span>
                          {variant.isActive ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase border border-emerald-300 bg-emerald-50 text-emerald-800">
                              BẬT BÁN
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase border border-zinc-300 bg-zinc-100 text-zinc-500">
                              TẮT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ảnh màu & Ma trận Size */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start pt-1">
                        {/* Ảnh màu */}
                        {variant.image ? (
                          <div className="w-20 h-20 border border-zinc-300 overflow-hidden bg-zinc-100 shrink-0">
                            <Image
                              src={variant.image}
                              alt={variant.color}
                              width="100%"
                              height="100%"
                              className="!object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center text-zinc-400 text-[10px] text-center p-1 shrink-0">
                            Chưa có ảnh màu
                          </div>
                        )}

                        {/* Ma trận Size */}
                        <div className="flex-1 w-full space-y-2">
                          <span className="text-[11px] text-zinc-500 font-bold block">
                            CHI TIẾT KÍCH CỠ & TỒN KHO CỦA MÀU:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {variant.sizes?.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className={`border p-2 text-center ${
                                  s.stock <= 5
                                    ? "border-red-300 bg-red-50 text-red-900"
                                    : s.stock <= 20
                                    ? "border-amber-300 bg-amber-50 text-amber-900"
                                    : "border-zinc-300 bg-zinc-50 text-zinc-900"
                                }`}
                              >
                                <span className="text-xs font-black block">
                                  Size {s.size}
                                </span>
                                <span className="text-sm font-bold font-sans">
                                  {s.stock}
                                </span>
                                <span className="text-[9px] block text-zinc-500 mt-0.5 uppercase">
                                  {s.stock === 0
                                    ? "Hết hàng"
                                    : s.stock <= 5
                                    ? "Sắp hết"
                                    : "Còn hàng"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 bg-white border border-black text-center text-zinc-500 text-xs">
                  Sản phẩm chưa thiết lập biến thể màu sắc nào.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: THUỘC TÍNH THỜI TRANG (ATTRIBUTES) */}
          {activeTab === "attributes" && (
            <div className="border border-black bg-white p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-700" />
                <span>THÔNG SỐ VÀ THUỘC TÍNH THỜI TRANG</span>
              </h3>

              {product.attributes && product.attributes.length > 0 ? (
                <div className="divide-y divide-zinc-200 border border-zinc-200">
                  {product.attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-zinc-50 transition-colors"
                    >
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        {attr.name}
                      </span>
                      <span className="text-xs font-semibold text-zinc-950 font-sans mt-1 sm:mt-0">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-50 border border-dashed border-zinc-300">
                  Chưa có thuộc tính nào được cập nhật cho sản phẩm này.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MÔ TẢ CHI TIẾT */}
          {activeTab === "description" && (
            <div className="border border-black bg-white p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-700" />
                <span>MÔ TẢ CHI TIẾT & HƯỚNG DẪN SỬ DỤNG</span>
              </h3>

              {product.description ? (
                <div className="text-xs text-zinc-700 leading-relaxed font-sans whitespace-pre-line p-3 bg-zinc-50 border border-zinc-200">
                  {product.description}
                </div>
              ) : (
                <div className="p-6 text-center text-zinc-500 text-xs bg-zinc-50 border border-dashed border-zinc-300">
                  Chưa có mô tả chi tiết nào.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SEO GOOGLE SNIPPET PREVIEW */}
          {activeTab === "seo" && (
            <div className="border border-black bg-white p-5 space-y-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-700" />
                <span>XEM TRƯỚC KẾT QUẢ TÌM KIẾM GOOGLE (SERP PREVIEW)</span>
              </h3>

              {/* Google Snippet Card */}
              <div className="p-4 border border-zinc-300 bg-[#f8f9fa] rounded-sm font-sans space-y-1 group">
                <a
                  href={clientProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block space-y-1 group"
                  title="Bấm để mở xem trang sản phẩm trên website (tab mới)"
                >
                  <div className="text-[12px] text-[#202124] flex items-center gap-1.5 truncate">
                    <div className="w-4 h-4 bg-zinc-200 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">
                      L
                    </div>
                    <span className="text-[#202124] font-medium">theluki.click</span>
                    <span className="text-[#5f6368]">› product › {product.slug}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
                  </div>
                  <h4 className="text-[18px] text-[#1a0dab] group-hover:underline cursor-pointer font-normal leading-snug">
                    {product.seo?.metaTitle || product.name}
                  </h4>
                </a>
                <p className="text-[13px] text-[#4d5156] leading-normal line-clamp-2">
                  {product.seo?.metaDescription ||
                    product.description ||
                    `Mua ${product.name} chính hãng tại THELUKI. Chất liệu cao cấp, kiểu dáng thời trang, ưu đãi hấp dẫn ngay hôm nay!`}
                </p>
              </div>

              {/* Chi tiết các thẻ Meta */}
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold block mb-0.5">
                    META TITLE ({product.seo?.metaTitle?.length || 0} / 70 ký tự):
                  </span>
                  <input
                    readOnly
                    value={product.seo?.metaTitle || "Chưa thiết lập"}
                    className="w-full h-8 px-3 bg-zinc-50 border border-zinc-300 text-zinc-900 outline-none"
                  />
                </div>

                <div>
                  <span className="text-zinc-500 font-bold block mb-0.5">
                    META DESCRIPTION ({product.seo?.metaDescription?.length || 0} / 160 ký tự):
                  </span>
                  <textarea
                    readOnly
                    rows={2}
                    value={product.seo?.metaDescription || "Chưa thiết lập"}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-300 text-zinc-900 outline-none resize-none"
                  />
                </div>

                <div>
                  <span className="text-zinc-500 font-bold block mb-1">
                    TỪ KHÓA TÌM KIẾM (KEYWORDS):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.seo?.metaKeywords &&
                    product.seo.metaKeywords.length > 0 ? (
                      product.seo.metaKeywords.map((kw, kIdx) => (
                        <Tag key={kIdx} className="font-mono text-[11px] py-0.5">
                          {kw}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-zinc-400 text-xs italic">
                        Chưa có từ khóa nào
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RAW JSON COMPASS VIEW */}
          {activeTab === "raw_json" && (
            <div className="border border-black bg-zinc-950 p-4 space-y-2 shadow-2xs text-emerald-400">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  MONGODB DOCUMENT (COMPASS RAW JSON)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(product, null, 2)
                    );
                    toast.success("Đã sao chép JSON Document");
                  }}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>SAO CHÉP JSON</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono overflow-x-auto max-h-[500px] leading-relaxed p-2">
                {JSON.stringify(product, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* CỘT PHẢI (1/3): HÌNH ẢNH & THÔNG TIN HỆ THỐNG */}
        <div className="space-y-4">
          <Image.PreviewGroup>
            {/* Ảnh đại diện chính (Thumbnail) */}
            <div className="border border-black bg-white p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2 flex items-center justify-between">
                <span>ẢNH ĐẠI DIỆN CHÍNH</span>
                <span className="text-[10px] text-zinc-400 font-normal">
                  Click để phóng to
                </span>
              </h3>

              <div className="aspect-square border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center [&_.ant-image]:!w-full [&_.ant-image]:!h-full">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    width="100%"
                    height="100%"
                    className="!object-cover"
                  />
                ) : (
                  <div className="text-zinc-400 text-xs flex flex-col items-center gap-1">
                    <Shirt className="w-8 h-8" />
                    <span>Chưa có ảnh bìa</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bảng kích cỡ (Size Chart) */}
            {product.size_chart && (
              <div className="border border-black bg-white p-4 space-y-3 shadow-2xs">
                <h3 className="text-xs font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2 flex items-center justify-between">
                  <span>BẢNG KÍCH CỠ (SIZE CHART)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    Click phóng to
                  </span>
                </h3>
                <div className="border border-zinc-200 bg-zinc-50 overflow-hidden [&_.ant-image]:!w-full">
                  <Image
                    src={product.size_chart}
                    alt="Size chart"
                    width="100%"
                    className="!object-contain max-h-48"
                  />
                </div>
              </div>
            )}

            {/* Album ảnh chi tiết (Gallery Lookbook) */}
            <div className="border border-black bg-white p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2 flex items-center justify-between">
                <span>ALBUM ẢNH CHI TIẾT</span>
                <span className="text-[10px] text-zinc-500 font-bold">
                  {product.images?.length || 0} ảnh
                </span>
              </h3>

              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {product.images.map((imgUrl, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="aspect-square border border-zinc-200 bg-zinc-50 overflow-hidden relative group [&_.ant-image]:!w-full [&_.ant-image]:!h-full"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Gallery ${imgIdx + 1}`}
                        width="100%"
                        height="100%"
                        className="!object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-zinc-400 text-xs bg-zinc-50 border border-dashed border-zinc-200">
                  Chưa có ảnh chi tiết trong album.
                </div>
              )}
            </div>
          </Image.PreviewGroup>

          {/* Phân loại danh mục & Meta Data hệ thống */}
          <div className="border border-black bg-white p-4 space-y-3 shadow-2xs text-xs">
            <h3 className="font-bold uppercase text-zinc-950 border-b border-zinc-200 pb-2">
              THÔNG TIN PHÂN LOẠI & HỆ THỐNG
            </h3>

            <div className="space-y-2.5">
              <div>
                <span className="text-zinc-500 text-[11px] block">DANH MỤC:</span>
                <strong className="text-zinc-900 font-sans text-xs">
                  {product.category?.name || "Chưa phân loại"}
                </strong>
              </div>

              <div>
                <span className="text-zinc-500 text-[11px] block mb-1">
                  BỘ SƯU TẬP (COLLECTIONS):
                </span>
                <div className="flex flex-wrap gap-1">
                  {product.collections && product.collections.length > 0 ? (
                    product.collections.map((col) => (
                      <span
                        key={col._id}
                        className="px-2 py-0.5 text-[10px] bg-zinc-100 border border-zinc-300 font-semibold"
                      >
                        {col.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-400 text-[11px]">
                      Không thuộc bộ sưu tập nào
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-2 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">ID Sản phẩm:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-zinc-800 truncate max-w-[120px]">
                      {product._id}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(product._id, "Đã sao chép ID sản phẩm")
                      }
                      className="p-1 hover:bg-zinc-100 text-zinc-600 cursor-pointer"
                      title="Sao chép ID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Đường dẫn Slug:</span>
                  <span className="text-blue-600 truncate max-w-[140px] font-mono">
                    /{product.slug}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Ngày tạo:</span>
                  <span className="text-zinc-800">
                    {product.createdAt
                      ? dayjs(product.createdAt).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Cập nhật lần cuối:</span>
                  <span className="text-zinc-800">
                    {product.updatedAt
                      ? dayjs(product.updatedAt).format("DD/MM/YYYY HH:mm")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Drawer/Modal Chỉnh sửa trực tiếp trên trang chi tiết */}
      <CreateEditProduct
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialValues={product}
        title={`CHỈNH SỬA: ${product.name.toUpperCase()}`}
      />
    </div>
  );
};

export default ProductDetailPage;
