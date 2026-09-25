import { useState, useMemo, useEffect } from "react";
import {
  Button,
  Modal,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  User,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Clock,
  X,
  Tag as TagIcon,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { formatPrice } from "../../utils/formatPrice";
import { useGetAllProducts } from "../../hook/useProduct";
import { useGetAllCategories } from "../../hook/useCategory";
import { socket } from "../../config/socket";

// Interface cho mục hàng trong giỏ POS
interface PosCartItem {
  id: string; // unique key: productId-variantId-sizeId
  productId: string;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  thumbnail?: string;
  price: number;
  quantity: number;
  stock: number;
}

// Interface cho đơn hàng chờ (Multi-tab POS)
interface PosOrderTab {
  tabId: string;
  tabName: string;
  customerName: string;
  customerPhone: string;
  items: PosCartItem[];
  paymentMethod: "CASH" | "BANKING" | "CARD";
  discountAmount: number;
  cashGiven: number;
  note: string;
}

export default function PosPage() {
  // 1. Dữ liệu từ API Backend
  const { data: apiProductsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetAllProducts({
    page: 1,
    sizePage: 50,
  });
  const { data: apiCategoriesData } = useGetAllCategories({ isActive: true });

  // Danh sách sản phẩm hiển thị (API hoặc Fallback)
  const products = useMemo(() => {
    const raw = (apiProductsData as any)?.products || (apiProductsData as any)?.data?.products;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((p: any) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku || "LUK-" + p._id.slice(-6).toUpperCase(),
        category: p.category?.name || "Streetwear",
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        thumbnail: p.thumbnail || p.images?.[0] || "",
        stock: p.stock ?? 0,
        variants: p.variants || [],
      }));
    }
    return [];
  }, [apiProductsData]);

  // Danh sách danh mục
  const categories = useMemo(() => {
    const raw = (apiCategoriesData as any)?.categories || (apiCategoriesData as any)?.data?.categories;
    const catList = ["TẤT CẢ"];
    if (Array.isArray(raw) && raw.length > 0) {
      raw.forEach((c: any) => {
        if (c.name && !catList.includes(c.name)) catList.push(c.name);
      });
    } else {
      catList.push("Áo thun", "Hoodie", "Quần", "Sơ mi", "Phụ kiện");
    }
    return catList;
  }, [apiCategoriesData]);

  // 2. State bộ lọc sản phẩm
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TẤT CẢ");

  // 3. Hệ thống nhiều Đơn hàng chờ (Multi-tab orders)
  const [orderTabs, setOrderTabs] = useState<PosOrderTab[]>([
    {
      tabId: "tab_1",
      tabName: "Hóa đơn 1",
      customerName: "Khách lẻ tại quầy",
      customerPhone: "",
      items: [],
      paymentMethod: "CASH",
      discountAmount: 0,
      cashGiven: 0,
      note: "",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab_1");

  // Tab hiện tại đang thao tác
  const currentTab = useMemo(() => {
    return orderTabs.find((t) => t.tabId === activeTabId) || orderTabs[0];
  }, [orderTabs, activeTabId]);

  // Đồng hồ hiển thị thời gian thực
  const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm:ss · DD/MM/YYYY"));
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format("HH:mm:ss · DD/MM/YYYY"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lắng nghe tín hiệu thanh toán SePay realtime từ Socket
  useEffect(() => {
    const handlePaymentReceived = (data: any) => {
      console.log("📢 [POS] Nhận tín hiệu thanh toán SePay:", data);
      toast.success(
        `Đã nhận thanh toán chuyển khoản đơn #${data?.orderCode || ""} (${formatPrice(data?.amount || 0)})!`,
        { icon: "💰", duration: 6000 }
      );
    };

    socket.on("payment_received", handlePaymentReceived);
    return () => {
      socket.off("payment_received", handlePaymentReceived);
    };
  }, []);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 4. Modal chọn biến thể Màu / Size khi bấm vào sản phẩm
  const [variantModalProduct, setVariantModalProduct] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  // 5. Modal in hóa đơn sau khi thanh toán thành công
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Lọc sản phẩm theo từ khóa và danh mục
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === "TẤT CẢ" ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchKeyword.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, searchKeyword, selectedCategory]);

  // =================== CÁC HÀM XỬ LÝ GIỎ HÀNG ===================

  // Cập nhật state cho tab hiện tại
  const updateCurrentTab = (updates: Partial<PosOrderTab>) => {
    setOrderTabs((prev) =>
      prev.map((tab) => (tab.tabId === activeTabId ? { ...tab, ...updates } : tab))
    );
  };

  // Mở modal chọn biến thể hoặc thêm ngay nếu không có biến thể
  const handleSelectProduct = (product: any) => {
    if (product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
      setSelectedColor(product.variants[0]?.color || "");
      setSelectedSize(product.variants[0]?.sizes?.[0]?.size || "FreeSize");
    } else {
      // Sản phẩm đơn giản không có phân loại
      addItemToCart({
        id: product._id,
        productId: product._id,
        name: product.name,
        sku: product.sku,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: 1,
        stock: product.stock,
      });
    }
  };

  // Xác nhận thêm từ Modal biến thể
  const handleConfirmVariantAdd = () => {
    if (!variantModalProduct) return;

    const colorObj = variantModalProduct.variants?.find(
      (v: any) => v.color === selectedColor
    );
    const sizeObj = colorObj?.sizes?.find((s: any) => s.size === selectedSize);
    const stock = sizeObj?.stock ?? variantModalProduct.stock ?? 0;

    const uniqueId = `${variantModalProduct._id}-${selectedColor}-${selectedSize}`;
    addItemToCart({
      id: uniqueId,
      productId: variantModalProduct._id,
      name: variantModalProduct.name,
      sku: `${variantModalProduct.sku}-${selectedSize}`,
      color: selectedColor,
      size: selectedSize,
      thumbnail: variantModalProduct.thumbnail,
      price: variantModalProduct.price,
      quantity: 1,
      stock,
    });

    setVariantModalProduct(null);
  };

  // Thêm món vào giỏ
  const addItemToCart = (itemToAdd: PosCartItem) => {
    const existing = currentTab.items.find((it) => it.id === itemToAdd.id);
    let newItems: PosCartItem[];

    if (existing) {
      if (existing.quantity >= existing.stock) {
        toast.error(`Sản phẩm này trong kho chỉ còn ${existing.stock} món!`);
        return;
      }
      newItems = currentTab.items.map((it) =>
        it.id === itemToAdd.id ? { ...it, quantity: it.quantity + 1 } : it
      );
    } else {
      newItems = [itemToAdd, ...currentTab.items];
    }

    updateCurrentTab({ items: newItems });
    toast.success(`+ Đã thêm "${itemToAdd.name.slice(0, 20)}..."`, { duration: 1500 });
  };

  // Tăng / Giảm số lượng
  const handleUpdateQuantity = (id: string, delta: number) => {
    const newItems = currentTab.items
      .map((it) => {
        if (it.id === id) {
          const nextQty = it.quantity + delta;
          if (nextQty > it.stock) {
            toast.error(`Kho chỉ còn ${it.stock} món!`);
            return it;
          }
          return { ...it, quantity: Math.max(1, nextQty) };
        }
        return it;
      })
      .filter((it) => it.quantity > 0);

    updateCurrentTab({ items: newItems });
  };

  // Xóa món
  const handleRemoveItem = (id: string) => {
    const newItems = currentTab.items.filter((it) => it.id !== id);
    updateCurrentTab({ items: newItems });
  };

  // Xóa trắng giỏ
  const handleClearCart = () => {
    if (currentTab.items.length === 0) return;
    updateCurrentTab({ items: [], discountAmount: 0, cashGiven: 0 });
    toast("Đã làm trống hóa đơn hiện tại");
  };

  // Tạo tab mới
  const handleAddNewTab = () => {
    if (orderTabs.length >= 5) {
      toast.error("Tối đa 5 hóa đơn chờ cùng lúc!");
      return;
    }
    const newId = `tab_${Date.now()}`;
    const newTabNumber = orderTabs.length + 1;
    const newTab: PosOrderTab = {
      tabId: newId,
      tabName: `Hóa đơn ${newTabNumber}`,
      customerName: "Khách lẻ tại quầy",
      customerPhone: "",
      items: [],
      paymentMethod: "CASH",
      discountAmount: 0,
      cashGiven: 0,
      note: "",
    };
    setOrderTabs([...orderTabs, newTab]);
    setActiveTabId(newId);
    toast.success(`Đã mở ${newTab.tabName}`);
  };

  // Đóng tab
  const handleCloseTab = (tabIdToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (orderTabs.length <= 1) {
      toast("Phải giữ lại ít nhất 1 hóa đơn!");
      return;
    }
    const remaining = orderTabs.filter((t) => t.tabId !== tabIdToClose);
    setOrderTabs(remaining);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(remaining[0].tabId);
    }
  };

  // =================== TÍNH TOÁN TIỀN BẠC ===================
  const itemsSubtotal = useMemo(() => {
    return currentTab.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [currentTab.items]);

  const finalAmount = Math.max(0, itemsSubtotal - (currentTab.discountAmount || 0));

  const changeDue = useMemo(() => {
    if (currentTab.paymentMethod !== "CASH") return 0;
    return Math.max(0, (currentTab.cashGiven || 0) - finalAmount);
  }, [currentTab.paymentMethod, currentTab.cashGiven, finalAmount]);

  // Các nút chọn nhanh tiền khách đưa
  const quickCashOptions = useMemo(() => {
    const setOptions = new Set<number>();
    setOptions.add(finalAmount);
    if (finalAmount <= 100000) setOptions.add(100000);
    if (finalAmount <= 200000) setOptions.add(200000);
    if (finalAmount <= 500000) setOptions.add(500000);
    if (finalAmount <= 1000000) setOptions.add(1000000);
    if (finalAmount <= 2000000) setOptions.add(2000000);
    return Array.from(setOptions).sort((a, b) => a - b).slice(0, 4);
  }, [finalAmount]);

  // =================== THANH TOÁN HOÀN TẤT ===================
  const handleCheckout = () => {
    if (currentTab.items.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm vào hóa đơn!");
      return;
    }

    if (currentTab.paymentMethod === "CASH" && (currentTab.cashGiven || 0) < finalAmount) {
      toast.error("Tiền khách đưa chưa đủ để thanh toán!");
      return;
    }

    const orderReceipt = {
      orderCode: `POS${dayjs().format("YYMMDDHHmmss")}`,
      createdAt: new Date().toISOString(),
      cashier: "Admin Luki",
      customerName: currentTab.customerName || "Khách lẻ tại quầy",
      customerPhone: currentTab.customerPhone || "N/A",
      items: [...currentTab.items],
      paymentMethod: currentTab.paymentMethod,
      itemsSubtotal,
      discountAmount: currentTab.discountAmount,
      finalAmount,
      cashGiven: currentTab.cashGiven,
      changeDue,
      note: currentTab.note,
    };

    setCompletedOrder(orderReceipt);
    setIsReceiptModalOpen(true);
    toast.success("✅ Thanh toán đơn hàng thành công!");

    // Xóa trắng giỏ của tab vừa thanh toán
    updateCurrentTab({
      items: [],
      discountAmount: 0,
      cashGiven: 0,
      note: "",
    });
  };

  return (
    <div className="space-y-3 font-sans pb-6">
      {/* ================= 1. THANH TIÊU ĐỀ POS & ĐỒNG HỒ ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black text-white px-4 py-2.5 shadow-sm border border-black">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white text-black font-black text-xs tracking-wider uppercase flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>THE LUKI POS</span>
          </div>
          <span className="text-zinc-400 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-zinc-300 font-medium">
            Thu ngân: <strong className="text-white">Admin Luki (Cát Minh)</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentTime}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              refetchProducts();
              toast.success("Đã đồng bộ kho hàng mới nhất!");
            }}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ĐỒNG BỘ KHO</span>
          </button>
        </div>
      </div>

      {/* ================= 2. BỐ CỤC CHÍNH (GRID 2 CỘT) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* ================= CỘT TRÁI: BẢNG SẢN PHẨM & TÌM KIẾM (7 CỘT) ================= */}
        <div className="xl:col-span-7 space-y-3">
          {/* Thanh tìm kiếm & Quét Barcode */}
          <div className="bg-white border border-black p-3 shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Nhập tên sản phẩm, mã SKU hoặc quét mã vạch Barcode (F2)..."
                className="w-full h-10 pl-9 pr-24 bg-zinc-50 border border-zinc-300 focus:border-black focus:bg-white text-xs font-mono outline-none transition-all placeholder:text-zinc-400"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-200 px-1.5 py-0.5 uppercase">
                F2: TÌM KIẾM
              </span>
            </div>

            {/* Danh mục trượt ngang */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 whitespace-nowrap uppercase font-bold text-[11px] transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-700 border-zinc-200 hover:border-black"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Lưới sản phẩm */}
          <div className="bg-white border border-black p-3 shadow-2xs min-h-[560px]">
            <div className="flex justify-between items-center pb-2 mb-3 border-b border-zinc-200 text-xs font-mono text-zinc-500">
              <span>
                Tìm thấy: <strong>{filteredProducts.length}</strong> sản phẩm
              </span>
              <span>Bấm vào sản phẩm để thêm vào hóa đơn</span>
            </div>

            {isLoadingProducts ? (
              <div className="py-24 text-center">
                <Spin size="large" />
                <p className="text-xs text-zinc-500 font-mono mt-2">Đang tải danh sách sản phẩm từ kho...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <Empty description="Không tìm thấy sản phẩm nào trong kho" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod._id}
                    onClick={() => handleSelectProduct(prod)}
                    className="group border border-zinc-200 hover:border-black bg-white p-2 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs relative"
                  >
                    {/* Ảnh sản phẩm */}
                    <div className="aspect-square bg-zinc-100 overflow-hidden relative mb-2">
                      <img
                        src={prod.thumbnail}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 font-bold">
                        Kho: {prod.stock}
                      </span>
                    </div>

                    {/* Thông tin */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                        {prod.sku}
                      </p>
                      <h4 className="font-bold text-xs text-zinc-900 line-clamp-2 leading-snug group-hover:text-black">
                        {prod.name}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="font-mono font-black text-xs text-zinc-950">
                          {formatPrice(prod.price)}
                        </span>
                        {prod.originalPrice > prod.price && (
                          <span className="font-mono text-[10px] text-zinc-400 line-through">
                            {formatPrice(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= CỘT PHẢI: HÓA ĐƠN & THANH TOÁN (5 CỘT) ================= */}
        <div className="xl:col-span-5 space-y-3">
          {/* Hệ thống Multi-tab Hóa đơn */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-zinc-100 p-1.5 border border-black text-xs font-mono">
            {orderTabs.map((tab) => (
              <div
                key={tab.tabId}
                onClick={() => setActiveTabId(tab.tabId)}
                className={`px-3 py-1.5 font-bold uppercase flex items-center gap-2 cursor-pointer transition-colors border ${
                  activeTabId === tab.tabId
                    ? "bg-white text-black border-black shadow-2xs"
                    : "bg-zinc-200 text-zinc-600 border-transparent hover:bg-zinc-300"
                }`}
              >
                <span>{tab.tabName}</span>
                {tab.items.length > 0 && (
                  <span className="w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-mono">
                    {tab.items.length}
                  </span>
                )}
                {orderTabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleCloseTab(tab.tabId, e)}
                    className="text-zinc-400 hover:text-red-600 ml-1"
                    title="Đóng tab này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddNewTab}
              className="p-1.5 bg-white hover:bg-zinc-200 text-black border border-zinc-300 font-bold transition-colors cursor-pointer"
              title="Thêm đơn hàng chờ mới"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Hộp hóa đơn chi tiết */}
          <div className="bg-white border-2 border-black p-4 space-y-3 shadow-xs">
            {/* Thông tin khách hàng & Clear Cart */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-200 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={currentTab.customerName}
                  onChange={(e) => updateCurrentTab({ customerName: e.target.value })}
                  placeholder="Khách lẻ tại quầy..."
                  className="font-bold text-zinc-900 border-b border-dashed border-zinc-300 focus:border-black outline-none bg-transparent"
                />
              </div>

              {currentTab.items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-zinc-400 hover:text-red-600 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa giỏ</span>
                </button>
              )}
            </div>

            {/* Danh sách mặt hàng đã chọn */}
            <div className="min-h-[220px] max-h-[260px] overflow-y-auto divide-y divide-zinc-100 pr-1">
              {currentTab.items.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-zinc-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                  <p className="text-xs font-mono">Hóa đơn đang trống</p>
                  <p className="text-[11px] text-zinc-400">
                    Bấm sản phẩm ở bên trái để đưa vào giỏ
                  </p>
                </div>
              ) : (
                currentTab.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center gap-3">
                    {it.thumbnail && (
                      <img
                        src={it.thumbnail}
                        alt={it.name}
                        className="w-10 h-12 object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-zinc-900 truncate">
                        {it.name}
                      </h5>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {it.color ? `${it.color} / ` : ""}
                        {it.size ? `${it.size} · ` : ""}
                        {it.sku}
                      </p>
                      <p className="font-mono text-xs font-bold text-zinc-800">
                        {formatPrice(it.price)}
                      </p>
                    </div>

                    {/* Bộ tăng giảm số lượng */}
                    <div className="flex items-center border border-zinc-300 bg-zinc-50">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(it.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(it.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Thành tiền */}
                    <div className="w-20 text-right font-mono font-black text-xs text-zinc-950">
                      {formatPrice(it.price * it.quantity)}
                    </div>

                    {/* Nút xóa */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      className="text-zinc-300 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <Divider className="!my-2" />

            {/* Khối tính tiền & Chiết khấu */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>Tổng tiền hàng:</span>
                <span className="font-bold text-zinc-900">
                  {formatPrice(itemsSubtotal)}
                </span>
              </div>

              {/* Chiết khấu / Giảm giá */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-zinc-600 flex items-center gap-1">
                  <TagIcon className="w-3 h-3" />
                  <span>Chiết khấu (₫):</span>
                </span>
                <input
                  type="number"
                  value={currentTab.discountAmount || ""}
                  onChange={(e) =>
                    updateCurrentTab({ discountAmount: Math.max(0, Number(e.target.value)) })
                  }
                  placeholder="0"
                  className="w-24 h-7 text-right px-2 border border-zinc-300 focus:border-black outline-none font-bold text-emerald-700"
                />
              </div>

              {/* TỔNG THANH TOÁN */}
              <div className="flex justify-between items-baseline pt-2 border-t-2 border-black">
                <span className="font-sans font-black text-sm uppercase text-zinc-900">
                  KHÁCH PHẢI TRẢ:
                </span>
                <span className="font-mono font-black text-xl text-zinc-950">
                  {formatPrice(finalAmount)}
                </span>
              </div>
            </div>

            {/* Chọn phương thức thanh toán */}
            <div className="pt-2 border-t border-zinc-200 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Phương thức thanh toán:
              </label>

              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => updateCurrentTab({ paymentMethod: "CASH" })}
                  className={`py-2 px-1 border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    currentTab.paymentMethod === "CASH"
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-700 border-zinc-300 hover:border-black"
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>TIỀN MẶT</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateCurrentTab({ paymentMethod: "BANKING" })}
                  className={`py-2 px-1 border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    currentTab.paymentMethod === "BANKING"
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-700 border-zinc-300 hover:border-black"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>VIETQR</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateCurrentTab({ paymentMethod: "CARD" })}
                  className={`py-2 px-1 border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    currentTab.paymentMethod === "CARD"
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-700 border-zinc-300 hover:border-black"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>QUẸT THẺ</span>
                </button>
              </div>

              {/* Xử lý TIỀN MẶT: Ô nhập & nút gợi ý nhanh */}
              {currentTab.paymentMethod === "CASH" && (
                <div className="bg-zinc-50 p-2.5 border border-zinc-300 space-y-2 font-mono text-xs mt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-600">Tiền khách đưa:</span>
                    <input
                      type="number"
                      value={currentTab.cashGiven || ""}
                      onChange={(e) =>
                        updateCurrentTab({ cashGiven: Number(e.target.value) })
                      }
                      placeholder={String(finalAmount)}
                      className="w-32 h-8 text-right px-2 font-black text-sm border border-zinc-400 focus:border-black outline-none bg-white"
                    />
                  </div>

                  {/* Nút bấm gợi ý tiền nhanh */}
                  <div className="flex flex-wrap gap-1">
                    {quickCashOptions.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => updateCurrentTab({ cashGiven: amt })}
                        className="px-2 py-1 bg-white border border-zinc-300 hover:border-black text-[11px] font-bold text-zinc-800 cursor-pointer"
                      >
                        {formatPrice(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Tiền thừa trả khách */}
                  <div className="flex justify-between items-center pt-1 border-t border-zinc-200">
                    <span className="text-zinc-600">Tiền thừa trả khách:</span>
                    <span
                      className={`font-black text-sm ${
                        (currentTab.cashGiven || 0) < finalAmount
                          ? "text-red-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {(currentTab.cashGiven || 0) < finalAmount
                        ? `Thiếu ${formatPrice(finalAmount - (currentTab.cashGiven || 0))}`
                        : formatPrice(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* Xử lý VIETQR: Hiển thị mã QR SePay chuẩn MBBank */}
              {currentTab.paymentMethod === "BANKING" && (
                <div className="bg-zinc-50 p-3 border-2 border-dashed border-zinc-400 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5 uppercase">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>VietQR Chuyển Khoản 24/7</span>
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Tự động SePay
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28 h-28 bg-white p-1 border border-zinc-300 shrink-0 flex items-center justify-center shadow-xs">
                      <img
                        src={`https://qr.sepay.vn/img?acc=0335906807&bank=MB&amount=${finalAmount}&des=LUKI+POS+${currentTab.tabName.replace(/\s+/g, '')}&template=compact`}
                        alt="SePay VietQR"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1 text-[11px] text-zinc-600 flex-1">
                      <div>
                        <span className="text-zinc-400 text-[10px] block">Ngân hàng:</span>
                        <strong className="text-zinc-900 font-bold">MBBank (Quân Đội)</strong>
                      </div>

                      <div>
                        <span className="text-zinc-400 text-[10px] block">Số tài khoản:</span>
                        <div className="flex items-center gap-1">
                          <strong className="text-zinc-900 font-bold">0335906807</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy("0335906807", "stk")}
                            className="p-0.5 text-zinc-400 hover:text-black cursor-pointer"
                            title="Sao chép STK"
                          >
                            {copiedField === "stk" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-400 text-[10px] block">Nội dung:</span>
                        <div className="flex items-center gap-1">
                          <strong className="text-emerald-700 font-bold">LUKI POS {currentTab.tabName.replace(/\s+/g, '')}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(`LUKI POS ${currentTab.tabName.replace(/\s+/g, '')}`, "content")}
                            className="p-0.5 text-zinc-400 hover:text-black cursor-pointer"
                            title="Sao chép nội dung"
                          >
                            {copiedField === "content" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 text-center pt-1 border-t border-zinc-200">
                    Hệ thống sẽ tự động cập nhật khi tiền vào tài khoản MBBank
                  </p>
                </div>
              )}
            </div>

            {/* Ghi chú đơn */}
            <input
              type="text"
              value={currentTab.note}
              onChange={(e) => updateCurrentTab({ note: e.target.value })}
              placeholder="Ghi chú đơn tại quầy (tùy chọn)..."
              className="w-full h-8 px-2 border border-zinc-300 text-xs focus:border-black outline-none"
            />

            {/* NÚT HOÀN TẤT THANH TOÁN TO BỰ */}
            <Button
              type="primary"
              onClick={handleCheckout}
              disabled={currentTab.items.length === 0}
              className="w-full !h-12 !bg-black hover:!bg-zinc-800 !text-white !font-black !text-sm !uppercase !tracking-wider !rounded-none !cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>THANH TOÁN & IN HÓA ĐƠN</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================= MODAL CHỌN BIẾN THỂ MÀU & SIZE ================= */}
      <Modal
        open={Boolean(variantModalProduct)}
        onCancel={() => setVariantModalProduct(null)}
        footer={null}
        width={480}
        centered
        className="!rounded-none"
      >
        {variantModalProduct && (
          <div className="p-4 space-y-4 font-sans text-xs">
            <div className="flex gap-3 pb-3 border-b border-zinc-200">
              <img
                src={variantModalProduct.thumbnail}
                alt={variantModalProduct.name}
                className="w-16 h-20 object-cover border border-zinc-300 bg-zinc-100 shrink-0"
              />
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-zinc-400 uppercase">
                  {variantModalProduct.sku}
                </p>
                <h3 className="font-bold text-sm text-zinc-900 leading-snug">
                  {variantModalProduct.name}
                </h3>
                <p className="font-mono font-black text-sm text-zinc-950">
                  {formatPrice(variantModalProduct.price)}
                </p>
              </div>
            </div>

            {/* Chọn Màu */}
            {variantModalProduct.variants?.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-[11px] text-zinc-700 font-mono">
                  1. Chọn Màu Sắc:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantModalProduct.variants.map((v: any) => (
                    <button
                      key={v.color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(v.color);
                        if (v.sizes?.length > 0) {
                          setSelectedSize(v.sizes[0].size);
                        }
                      }}
                      className={`px-3 py-1.5 border text-xs font-mono font-bold cursor-pointer transition-all ${
                        selectedColor === v.color
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-800 border-zinc-300 hover:border-black"
                      }`}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chọn Size */}
            {selectedColor && (
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-[11px] text-zinc-700 font-mono">
                  2. Chọn Kích Thước (Size):
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantModalProduct.variants
                    ?.find((v: any) => v.color === selectedColor)
                    ?.sizes?.map((s: any) => (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSelectedSize(s.size)}
                        className={`px-4 py-1.5 border text-xs font-mono font-bold cursor-pointer transition-all ${
                          selectedSize === s.size
                            ? "bg-black text-white border-black"
                            : "bg-white text-zinc-800 border-zinc-300 hover:border-black"
                        }`}
                      >
                        {s.size} (Còn {s.stock})
                      </button>
                    ))}
                </div>
              </div>
            )}

            <Button
              type="primary"
              onClick={handleConfirmVariantAdd}
              className="w-full !h-10 !bg-black hover:!bg-zinc-800 !text-white !font-bold !rounded-none !uppercase mt-2"
            >
              THÊM VÀO HÓA ĐƠN
            </Button>
          </div>
        )}
      </Modal>

      {/* ================= MODAL IN HÓA ĐƠN NHIỆT K80 SAU KHI THANH TOÁN ================= */}
      <Modal
        open={isReceiptModalOpen}
        onCancel={() => setIsReceiptModalOpen(false)}
        footer={null}
        width={400}
        centered
        className="pos-receipt-modal !rounded-none"
      >
        {completedOrder && (
          <div className="p-4 font-mono text-xs text-zinc-900 space-y-3 bg-white">
            {/* Header Hóa đơn K80 */}
            <div className="text-center border-b border-black pb-3 space-y-1">
              <h2 className="text-base font-black tracking-widest uppercase">
                THE LUKI STORE
              </h2>
              <p className="text-[10px] text-zinc-500">
                Đ/c: Cát Minh, Phù Cát, Bình Định
              </p>
              <p className="text-[10px] text-zinc-500">Hotline: 0912.345.678</p>
              <h3 className="text-xs font-bold uppercase tracking-wider pt-2">
                HÓA ĐƠN BÁN HÀNG TẠI QUẦY
              </h3>
              <p className="text-[11px] text-zinc-600">
                Số HĐ: <strong>#{completedOrder.orderCode}</strong>
              </p>
              <p className="text-[10px] text-zinc-400">
                {dayjs(completedOrder.createdAt).format("DD/MM/YYYY HH:mm")} · Thu ngân:{" "}
                {completedOrder.cashier}
              </p>
            </div>

            {/* Khách hàng */}
            <div className="text-[11px] py-1 border-b border-dashed border-zinc-300">
              <p>Khách hàng: {completedOrder.customerName}</p>
              {completedOrder.customerPhone && (
                <p>SĐT: {completedOrder.customerPhone}</p>
              )}
            </div>

            {/* Bảng sản phẩm */}
            <div className="space-y-1.5 py-1">
              {completedOrder.items?.map((it: PosCartItem, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-2">
                    <p className="font-bold">{it.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {it.color} / {it.size} · {formatPrice(it.price)} x{it.quantity}
                    </p>
                  </div>
                  <span className="font-bold shrink-0">
                    {formatPrice(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="border-t border-black pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Tiền hàng:</span>
                <span>{formatPrice(completedOrder.itemsSubtotal)}</span>
              </div>
              {completedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Chiết khấu:</span>
                  <span>-{formatPrice(completedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 border-t border-zinc-300">
                <span>TỔNG TIỀN:</span>
                <span>{formatPrice(completedOrder.finalAmount)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 pt-1">
                <span>Hình thức:</span>
                <span className="uppercase font-bold">
                  {completedOrder.paymentMethod}
                </span>
              </div>
              {completedOrder.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between text-zinc-600">
                    <span>Tiền khách đưa:</span>
                    <span>{formatPrice(completedOrder.cashGiven)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 font-bold">
                    <span>Tiền thừa trả khách:</span>
                    <span>{formatPrice(completedOrder.changeDue)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer hóa đơn */}
            <div className="text-center pt-3 border-t border-dashed border-zinc-400 text-[10px] text-zinc-500 space-y-0.5">
              <p className="font-bold text-zinc-700">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
              <p>Chính sách đổi hàng trong vòng 7 ngày kèm hóa đơn</p>
              <p className="text-[9px] text-zinc-400">Website: theluki.click</p>
            </div>

            {/* Nút in & đóng */}
            <div className="pt-2 flex gap-2">
              <Button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 !rounded-none"
              >
                Đóng
              </Button>
              <Button
                type="primary"
                onClick={() => window.print()}
                className="flex-1 !bg-black hover:!bg-zinc-800 !rounded-none !font-bold"
              >
                In Hóa Đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
