"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Check,
  ChevronRight,
  Info,
  Package,
  MapPin,
  Sparkles,
  X,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useProfile, useAddAddress, useSetDefaultAddress } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCheckout, useCalculateShippingFee } from "@/hooks/useOrder";
import { UserAddress } from "@/types/authType";
import CheckoutSkeleton from "@/components/checkout/CheckoutSkeleton";
import { viettelPostLocationService, ViettelProvince, ViettelDistrict, ViettelWard } from "@/services/viettelPostLocationService";
import { paymentService } from "@/services/paymentService";
import toast from "react-hot-toast";

// Cấu hình phương thức thanh toán Online
const PAYMENT_METHODS = [
  {
    code: "COD",
    name: "Thanh toán khi nhận hàng (COD)",
    desc: "Bạn chỉ thanh toán bằng tiền mặt khi shipper bàn giao kiện hàng",
    icon: Banknote,
    badge: "Phổ biến",
  },
  {
    code: "VNPAY",
    name: "Cổng thanh toán VNPay",
    desc: "Hỗ trợ thẻ ATM nội địa, QR Banking và Visa / Mastercard",
    icon: CreditCard,
    badge: "Bảo mật",
  },
  {
    code: "MOMO",
    name: "Ví điện tử MoMo",
    desc: "Thanh toán một chạm qua ví MoMo hoặc thẻ ATM Napas",
    icon: Sparkles,
    badge: "Tiện lợi",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Dữ liệu Profile người dùng (đã được cache qua React Query)
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const savedAddresses: UserAddress[] = profile?.addresses || [];

  // 2. Dữ liệu Giỏ hàng thực tế
  const { data: cart, isLoading: isCartLoading } = useCart();
  const selectedCartItems = useMemo(() => {
    return cart?.items?.filter((item) => item.isSelected) || [];
  }, [cart?.items]);

  // Tìm địa chỉ mặc định từ danh sách address của profile
  const defaultAddress = useMemo(() => {
    if (!savedAddresses || savedAddresses.length === 0) return null;
    return savedAddresses.find((a) => a.isDefault || a.is_default) || savedAddresses[0];
  }, [savedAddresses]);

  // ID địa chỉ đang chọn để đặt hàng
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Tự động gán địa chỉ mặc định khi profile tải xong
  useEffect(() => {
    if (defaultAddress?._id && !selectedAddressId) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress, selectedAddressId]);

  // Địa chỉ đang kích hoạt sử dụng cho đơn hàng
  const activeAddress = useMemo(() => {
    if (!savedAddresses || savedAddresses.length === 0) return null;
    return savedAddresses.find((a) => a._id === selectedAddressId) || defaultAddress;
  }, [savedAddresses, selectedAddressId, defaultAddress]);

  // Modal quản lý / thay đổi địa chỉ
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form thêm địa chỉ mới
  const [newAddressForm, setNewAddressForm] = useState({
    receiverName: "",
    receiverPhone: "",
    province: "",
    provinceId: undefined as number | undefined,
    district: "",
    districtId: undefined as number | undefined,
    ward: "",
    wardId: undefined as number | undefined,
    detailAddress: "",
    isDefault: true,
    label: "Nhà riêng",
  });

  // ViettelPost 3 cấp địa chỉ (Tỉnh/Thành -> Quận/Huyện -> Phường/Xã)
  const [provinces, setProvinces] = useState<ViettelProvince[]>([]);
  const [districts, setDistricts] = useState<ViettelDistrict[]>([]);
  const [wards, setWards] = useState<ViettelWard[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | "">("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | "">("");
  const [selectedWardId, setSelectedWardId] = useState<number | "">("");
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Tải danh mục Tỉnh/Thành khi mở form thêm địa chỉ
  useEffect(() => {
    if (isAddressModalOpen && isAddingNew && provinces.length === 0) {
      setIsLoadingProvinces(true);
      viettelPostLocationService
        .getProvinces()
        .then((data) => {
          setProvinces(data);
          setIsLoadingProvinces(false);
        })
        .catch(() => {
          setIsLoadingProvinces(false);
        });
    }
  }, [isAddressModalOpen, isAddingNew, provinces.length]);

  // Handler khi chọn Tỉnh/Thành
  const handleSelectProvince = async (provinceIdStr: string) => {
    const provId = provinceIdStr ? Number(provinceIdStr) : "";
    setSelectedProvinceId(provId);
    setSelectedDistrictId("");
    setSelectedWardId("");
    setDistricts([]);
    setWards([]);

    if (!provId) {
      setNewAddressForm((prev) => ({
        ...prev,
        province: "",
        provinceId: undefined,
        district: "",
        districtId: undefined,
        ward: "",
        wardId: undefined,
      }));
      return;
    }

    const prov = provinces.find((p) => p.PROVINCE_ID === provId);
    setNewAddressForm((prev) => ({
      ...prev,
      province: prov?.PROVINCE_NAME || "",
      provinceId: provId,
      district: "",
      districtId: undefined,
      ward: "",
      wardId: undefined,
    }));

    setIsLoadingDistricts(true);
    const distData = await viettelPostLocationService.getDistricts(provId);
    setDistricts(distData);
    setIsLoadingDistricts(false);
  };

  // Handler khi chọn Quận/Huyện
  const handleSelectDistrict = async (districtIdStr: string) => {
    const distId = districtIdStr ? Number(districtIdStr) : "";
    setSelectedDistrictId(distId);
    setSelectedWardId("");
    setWards([]);

    if (!distId) {
      setNewAddressForm((prev) => ({
        ...prev,
        district: "",
        districtId: undefined,
        ward: "",
        wardId: undefined,
      }));
      return;
    }

    const dist = districts.find((d) => d.DISTRICT_ID === distId);
    setNewAddressForm((prev) => ({
      ...prev,
      district: dist?.DISTRICT_NAME || "",
      districtId: distId,
      ward: "",
      wardId: undefined,
    }));

    setIsLoadingWards(true);
    const wardData = await viettelPostLocationService.getWards(distId);
    setWards(wardData);
    setIsLoadingWards(false);
  };

  // Handler khi chọn Phường/Xã
  const handleSelectWard = (wardIdStr: string) => {
    const wId = wardIdStr ? Number(wardIdStr) : "";
    setSelectedWardId(wId);

    if (!wId) {
      setNewAddressForm((prev) => ({
        ...prev,
        ward: "",
        wardId: undefined,
      }));
      return;
    }

    const w = wards.find((ward) => ward.WARDS_ID === wId);
    setNewAddressForm((prev) => ({
      ...prev,
      ward: w?.WARDS_NAME || "",
      wardId: wId,
    }));
  };

  // Ghi chú cho shipper
  const [shippingNote, setShippingNote] = useState("");

  // Phương thức vận chuyển cố định theo chính sách Shop
  const selectedShipping = "STANDARD" as const;
  const [selectedPayment, setSelectedPayment] = useState("COD");

  // State mã giảm giá
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  // State modal đặt hàng thành công
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Mutations
  const addAddressMutation = useAddAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  const checkoutMutation = useCheckout();
  const calculateFeeMutation = useCalculateShippingFee();

  // State lưu kết quả cước phí do API trả về
  const [apiShippingFee, setApiShippingFee] = useState<number | null>(null);

  // Tính toán tiền hàng tạm tính
  const subtotal = useMemo(() => {
    return selectedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [selectedCartItems]);

  const hasAddress = Boolean(
    activeAddress?.province && activeAddress?.district && activeAddress?.ward
  );

  // Xác định địa chỉ nhận có thuộc cùng tỉnh với Shop (Bình Định) hay không
  const isSameProvince = useMemo(() => {
    if (!activeAddress?.province) return false;
    const clean = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đð]/gi, "d")
        .replace(/^(tinh|thanh pho|tp\.?|tp)\s+/i, "")
        .trim();
    return clean(activeAddress.province).includes("binh dinh");
  }, [activeAddress?.province]);

  const isFreeShipByShop = subtotal >= 300000;

  // Gọi API tính phí ship khi thay đổi địa chỉ nhận hoặc tổng giá trị hàng
  useEffect(() => {
    if (
      activeAddress?.province &&
      activeAddress?.district &&
      activeAddress?.ward &&
      selectedCartItems.length > 0
    ) {
      calculateFeeMutation.mutate(
        {
          shippingAddress: {
            province: activeAddress.province,
            district: activeAddress.district,
            ward: activeAddress.ward,
            detailAddress:
              activeAddress.detailAddress ||
              activeAddress.detail ||
              activeAddress.address_detail,
          },
          productPrice: subtotal,
        },
        {
          onSuccess: (res: any) => {
            const dataList = Array.isArray(res?.data) ? res.data : [res?.data];
            const opt = dataList[0];
            if (opt && typeof opt.fee === "number") {
              setApiShippingFee(opt.fee);
            }
          },
        }
      );
    }
  }, [
    activeAddress?.province,
    activeAddress?.district,
    activeAddress?.ward,
    selectedAddressId,
    subtotal,
  ]);

  // Xử lý submit lưu địa chỉ mới vào DB
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAddressForm.receiverName.trim() ||
      !newAddressForm.receiverPhone.trim() ||
      !newAddressForm.province.trim() ||
      !newAddressForm.district.trim() ||
      !newAddressForm.ward.trim() ||
      !newAddressForm.detailAddress.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    addAddressMutation.mutate(
      {
        receiverName: newAddressForm.receiverName.trim(),
        receiverPhone: newAddressForm.receiverPhone.trim(),
        province: newAddressForm.province.trim(),
        provinceId: newAddressForm.provinceId,
        district: newAddressForm.district.trim(),
        districtId: newAddressForm.districtId,
        ward: newAddressForm.ward.trim(),
        wardId: newAddressForm.wardId,
        detailAddress: newAddressForm.detailAddress.trim(),
        detail: newAddressForm.detailAddress.trim(),
        label: newAddressForm.label,
        isDefault: newAddressForm.isDefault,
      },
      {
        onSuccess: (res: any) => {
          const newAddress = res?.data?.address;
          if (newAddress?._id) {
            setSelectedAddressId(newAddress._id);
          }
          setIsAddingNew(false);
          setIsAddressModalOpen(false);

          // Reset form & selects
          setNewAddressForm({
            receiverName: "",
            receiverPhone: "",
            province: "",
            provinceId: undefined,
            district: "",
            districtId: undefined,
            ward: "",
            wardId: undefined,
            detailAddress: "",
            isDefault: false,
            label: "Nhà riêng",
          });
          setSelectedProvinceId("");
          setSelectedDistrictId("");
          setSelectedWardId("");
          setDistricts([]);
          setWards([]);
        },
      }
    );
  };

  // Đặt 1 địa chỉ có sẵn làm mặc định
  const handleSetAsDefault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDefaultAddressMutation.mutate(id);
  };

  // Tính toán tài chính - Tính phí ship ưu tiên từ kết quả API

  // Tính phí ship ưu tiên từ kết quả API
  const shippingFee = useMemo(() => {
    if (!hasAddress) return 0;
    if (apiShippingFee !== null) return apiShippingFee;
    if (isFreeShipByShop) return 0;
    return isSameProvince ? 20000 : 30000;
  }, [hasAddress, apiShippingFee, isFreeShipByShop, isSameProvince]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.code === "FREESHIP") {
      return shippingFee;
    }
    return appliedCoupon.discount;
  }, [appliedCoupon, shippingFee]);
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  // Áp dụng coupon
  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const codeUpper = couponInput.trim().toUpperCase();
    if (codeUpper === "LUKI100K") {
      setAppliedCoupon({ code: "LUKI100K", discount: 100000 });
      setCouponError("");
      setCouponInput("");
      toast.success("Áp dụng mã giảm 100.000đ thành công!");
    } else if (codeUpper === "FREESHIP") {
      if (!hasAddress) {
        toast.error("Vui lòng thêm địa chỉ nhận hàng trước khi áp dụng mã Freeship!");
        return;
      }
      setAppliedCoupon({ code: "FREESHIP", discount: shippingFee });
      setCouponError("");
      setCouponInput("");
      toast.success("Áp dụng mã miễn phí vận chuyển thành công!");
    } else {
      setCouponError("Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // Xác nhận tạo đơn hàng thật
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeAddress) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ nhận hàng trước khi đặt hàng!");
      setIsAddressModalOpen(true);
      return;
    }

    if (selectedCartItems.length === 0) {
      toast.error("Không có sản phẩm nào được chọn để thanh toán!");
      router.push("/cart");
      return;
    }

    checkoutMutation.mutate(
      {
        shippingAddress: {
          receiverName:
            activeAddress.receiverName ||
            activeAddress.full_name ||
            profile?.full_name ||
            "Khách hàng",
          receiverPhone:
            activeAddress.receiverPhone ||
            activeAddress.phone ||
            profile?.phone ||
            "",
          province: activeAddress.province,
          district: activeAddress.district,
          ward: activeAddress.ward,
          detailAddress:
            activeAddress.detailAddress ||
            activeAddress.detail ||
            activeAddress.address_detail ||
            "",
          note: shippingNote || undefined,
        },
        paymentMethod: selectedPayment as any,
        couponCode: appliedCoupon?.code || undefined,
        note: shippingNote || undefined,
      },
      {
        onSuccess: async (res: any) => {
          const order = res?.data;
          setCreatedOrder(order);

          if (selectedPayment === "VNPAY" || selectedPayment === "MOMO") {
            const toastId = toast.loading("Đang chuyển hướng sang cổng thanh toán...");
            try {
              const payRes = await paymentService.createPayment({
                orderCode: order.orderCode,
                paymentMethod: selectedPayment as any,
              });

              if (payRes?.data?.paymentUrl) {
                toast.dismiss(toastId);
                window.location.href = payRes.data.paymentUrl;
                return;
              }
            } catch (err: any) {
              toast.dismiss(toastId);
              toast.error(
                err?.message || "Không thể tạo liên kết thanh toán, bạn có thể thanh toán lại trong mục Đơn hàng"
              );
            }
          }

          setIsSuccessModalOpen(true);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* Header điều hướng */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Giỏ hàng</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tighter text-lg font-mono">
              THE LUKI
            </span>
            <span className="text-zinc-300 text-xs">/</span>
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              Checkout
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Bảo mật SSL 256-bit</span>
          </div>
        </div>
      </header>

      {/* Loading state giỏ hàng / profile */}
      {(!mounted || isCartLoading) && <CheckoutSkeleton />}

      {/* Giỏ hàng không có sản phẩm được chọn */}
      {mounted && !isCartLoading && selectedCartItems.length === 0 && (
        <div className="max-w-xl mx-auto px-4 pt-16 text-center">
          <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-tight text-zinc-900">
            Chưa có sản phẩm nào được chọn
          </h2>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm mà bạn muốn tiến hành thanh toán.
          </p>
          <div className="mt-6">
            <Link
              href="/cart"
              className="inline-block px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Xem Giỏ Hàng Của Bạn
            </Link>
          </div>
        </div>
      )}

      {/* Nội dung chính Checkout */}
      {mounted && !isCartLoading && selectedCartItems.length > 0 && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* CỘT TRÁI: ĐỊA CHỈ, VẬN CHUYỂN, THANH TOÁN (7/12) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. KHỐI ĐỊA CHỈ NHẬN HÀNG */}
                <section className="bg-white border border-zinc-200 p-5 md:p-6">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-black" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                        1. Địa Chỉ Nhận Hàng
                      </h2>
                    </div>

                    {/* NÚT THAY ĐỔI / MỞ MODAL SỔ ĐỊA CHỈ */}
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setIsAddressModalOpen(true);
                        }}
                        className="text-xs font-bold text-black uppercase tracking-wider hover:underline underline-offset-4 cursor-pointer"
                      >
                        Thay Đổi
                      </button>
                    )}
                  </div>

                  {/* TH1: Người dùng đã có địa chỉ trong profile */}
                  {activeAddress ? (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 relative group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wide text-zinc-900">
                              {activeAddress.receiverName ||
                                activeAddress.full_name ||
                                profile?.full_name}
                            </span>
                            <span className="text-zinc-400 text-xs">•</span>
                            <span className="text-xs font-mono font-semibold text-zinc-700">
                              {activeAddress.receiverPhone ||
                                activeAddress.phone ||
                                profile?.phone}
                            </span>
                            {(activeAddress.isDefault || activeAddress.is_default) && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-black text-white">
                                Mặc định
                              </span>
                            )}
                            {activeAddress.label && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium bg-zinc-200 text-zinc-700">
                                {activeAddress.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed pt-0.5">
                            {activeAddress.detailAddress ||
                              activeAddress.detail ||
                              activeAddress.address_detail}
                            , {activeAddress.ward}, {activeAddress.district},{" "}
                            {activeAddress.province}
                          </p>
                        </div>
                      </div>

                      {/* Ghi chú thêm cho người giao hàng */}
                      <div className="mt-4 pt-3 border-t border-zinc-200">
                        <label className="block text-[11px] font-semibold text-zinc-600 uppercase mb-1">
                          Ghi chú giao hàng (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          value={shippingNote}
                          onChange={(e) => setShippingNote(e.target.value)}
                          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                          className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-none focus:outline-none focus:border-black bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* TH2: Người dùng chưa có địa chỉ nào -> Nút thêm ngay */
                    <div className="p-6 border border-dashed border-zinc-300 text-center bg-zinc-50/50">
                      <MapPin className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-zinc-700">
                        Bạn chưa có địa chỉ nhận hàng nào được lưu
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Thêm địa chỉ giao hàng để tính chính xác phí vận chuyển ViettelPost
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(true);
                          setIsAddressModalOpen(true);
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Địa Chỉ Mới</span>
                      </button>
                    </div>
                  )}
                </section>

                {/* 2. KHỐI PHƯƠNG THỨC THANH TOÁN */}
                <section className="bg-white border border-zinc-200 p-5 md:p-6">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-black" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                        2. Phương Thức Thanh Toán
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPayment === method.code;
                      const IconComponent = method.icon;
                      return (
                        <div
                          key={method.code}
                          onClick={() => setSelectedPayment(method.code)}
                          className={`p-4 border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                            isSelected
                              ? "border-black bg-zinc-50/80 ring-1 ring-black"
                              : "border-zinc-200 hover:border-zinc-400 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-black bg-black"
                                  : "border-zinc-400"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4 text-zinc-800" />
                                <span className="text-xs font-bold text-zinc-900 uppercase">
                                  {method.name}
                                </span>
                                {method.badge && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200">
                                    {method.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-1">
                                {method.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & NÚT CHỐT ĐƠN (5/12) */}
              <div className="lg:col-span-5 bg-white border border-zinc-200 p-5 md:p-6 sticky top-24">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 pb-4 border-b border-zinc-200 flex items-center justify-between">
                  <span>Đơn Hàng Của Bạn</span>
                  <span className="text-xs font-mono font-normal text-zinc-500">
                    ({selectedCartItems.length} sản phẩm)
                  </span>
                </h2>

                {/* Danh sách sản phẩm mua từ giỏ hàng */}
                <div className="divide-y divide-zinc-200 my-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedCartItems.map((item) => {
                    const thumbUrl =
                      item.thumbnail ||
                      (typeof item.product === "object"
                        ? (item.product as any)?.thumbnail ||
                          (item.product as any)?.images?.[0]
                        : null) ||
                      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80";

                    return (
                      <div
                        key={item._id}
                        className="py-3.5 flex items-center gap-3.5"
                      >
                        <div className="relative w-16 h-20 bg-zinc-200 shrink-0 overflow-hidden border border-zinc-200">
                          <Image
                            src={thumbUrl}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                          <span className="absolute top-1 right-1 bg-black text-white text-[10px] font-mono px-1.5 py-0.5 font-bold">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-zinc-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            Phân loại:{" "}
                            <span className="text-zinc-800 font-medium">
                              {item.color}
                            </span>{" "}
                            • Size:{" "}
                            <span className="text-zinc-800 font-medium">
                              {item.size}
                            </span>
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400 mt-0.5 uppercase">
                            SKU: {item.sku}
                          </p>
                          <p className="text-xs font-mono font-bold text-zinc-900 mt-1">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Khung nhập mã giảm giá Coupon */}
                <div className="py-4 border-t border-b border-zinc-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                    Mã Giảm Giá / Voucher
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-mono font-bold text-emerald-800">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-emerald-700 text-[11px] block">
                            Đã giảm {formatPrice(appliedCoupon.discount)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer"
                      >
                        Gỡ bỏ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Nhập mã (VD: LUKI100K, FREESHIP)"
                          className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-none uppercase tracking-wider focus:outline-none focus:border-black bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Áp Dụng
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-rose-500 font-medium">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bảng chi tiết tính tiền */}
                <div className="py-4 space-y-2.5 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span>Tạm tính hàng hóa:</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cước vận chuyển:</span>
                    {hasAddress ? (
                      <span className="font-mono font-semibold">
                        {shippingFee === 0 ? (
                          <span className="text-emerald-600 font-bold">
                            0₫ (Miễn phí)
                          </span>
                        ) : (
                          <span className="text-zinc-900 font-bold">
                            {formatPrice(shippingFee)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-zinc-400 italic">
                        Chờ địa chỉ nhận hàng
                      </span>
                    )}
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Giảm giá Voucher:</span>
                      <span className="font-mono">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tổng thanh toán */}
                <div className="pt-4 border-t border-zinc-200">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Tổng Thanh Toán:
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold font-mono text-zinc-900">
                        {formatPrice(finalTotal)}
                      </span>
                      <span className="block text-[10px] text-zinc-400">
                        {hasAddress
                          ? "(Đã bao gồm VAT & Phí ViettelPost)"
                          : "(Chưa bao gồm cước vận chuyển)"}
                      </span>
                    </div>
                  </div>

                  {/* NÚT ĐẶT HÀNG CHÍNH */}
                  <button
                    type="submit"
                    disabled={checkoutMutation.isPending}
                    className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-bold uppercase text-xs tracking-widest transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo đơn hàng...</span>
                      </>
                    ) : (
                      <>
                        <span>Xác Nhận Đặt Hàng</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-zinc-500 text-center mt-3 leading-relaxed">
                    Bằng việc xác nhận, bạn đồng ý với Điều khoản dịch vụ và Chính
                    sách đổi trả của The Luki.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </main>
      )}

      {/* ================= MODAL ĐẶT HÀNG THÀNH CÔNG ================= */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full p-6 md:p-8 border border-zinc-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-center uppercase tracking-tight text-zinc-900">
              Đặt Hàng Thành Công!
            </h3>
            <p className="text-xs text-center text-zinc-500 mt-1">
              Đơn hàng của bạn đã được ghi nhận vào hệ thống The Luki.
            </p>

            <div className="my-5 p-4 bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-zinc-200">
                <span className="text-zinc-500 uppercase tracking-wider">
                  Mã đơn hàng:
                </span>
                <span className="font-mono font-bold text-zinc-900">
                  {createdOrder?.orderCode || "TLK-ORDER"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Người nhận:</span>
                <span className="font-medium text-zinc-800">
                  {createdOrder?.shippingAddress?.receiverName ||
                    activeAddress?.receiverName}{" "}
                  (
                  {createdOrder?.shippingAddress?.receiverPhone ||
                    activeAddress?.receiverPhone}
                  )
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Địa chỉ giao:</span>
                <span className="font-medium text-zinc-800 text-right max-w-[220px] truncate">
                  {createdOrder?.shippingAddress?.detailAddress ||
                    activeAddress?.detailAddress}
                  , {activeAddress?.ward}, {activeAddress?.province}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Phương thức:</span>
                <span className="font-medium text-zinc-800">
                  {PAYMENT_METHODS.find((p) => p.code === selectedPayment)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Vận chuyển:</span>
                <span className="font-medium text-zinc-800">
                  ViettelPost (Chuyển phát nhanh)
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200 font-bold">
                <span className="uppercase text-zinc-900">Tổng thanh toán:</span>
                <span className="font-mono text-sm text-zinc-900">
                  {formatPrice(
                    createdOrder?.financials?.finalAmount || finalTotal
                  )}
                </span>
              </div>
            </div>

            {selectedPayment !== "COD" && (
              <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Đơn hàng thanh toán online qua {selectedPayment}. Bạn có thể
                  kiểm tra trạng thái đơn hàng và thanh toán trong mục Đơn hàng của tôi.
                </span>
              </div>
            )}

            <div className="space-y-2">
              {createdOrder?.orderCode && (
                <Link
                  href={`/orders/${createdOrder.orderCode}`}
                  className="w-full block py-3 bg-black hover:bg-zinc-800 text-white text-center text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Theo Dõi Đơn Hàng #{createdOrder.orderCode}
                </Link>
              )}
              <Link
                href="/orders"
                className={`w-full block py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  createdOrder?.orderCode
                    ? "border border-zinc-300 text-zinc-800 hover:border-black hover:bg-zinc-50"
                    : "bg-black hover:bg-zinc-800 text-white"
                }`}
              >
                Xem Danh Sách Đơn Hàng Của Tôi
              </Link>
              <Link
                href="/"
                className="w-full block py-2 text-center text-[11px] font-semibold text-zinc-500 hover:text-black uppercase tracking-wider transition-colors"
              >
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL QUẢN LÝ / THAY ĐỔI ĐỊA CHỈ ================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-2xl w-full p-6 md:p-8 border border-zinc-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {isAddingNew ? "Thêm Địa Chỉ Mới" : "Sổ Địa Chỉ Nhận Hàng"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddingNew(false);
                }}
                className="text-zinc-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAddingNew ? (
              /* FORM THÊM ĐỊA CHỈ MỚI */
              <form onSubmit={handleSaveNewAddress} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-zinc-600 mb-1">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.receiverName}
                      onChange={(e) =>
                        setNewAddressForm({
                          ...newAddressForm,
                          receiverName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-zinc-300 focus:border-black focus:outline-none bg-white"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase text-zinc-600 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.receiverPhone}
                      onChange={(e) =>
                        setNewAddressForm({
                          ...newAddressForm,
                          receiverPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-zinc-300 focus:border-black focus:outline-none bg-white"
                      placeholder="0987 654 321"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* TỈNH / THÀNH PHỐ */}
                  <div>
                    <label className="block font-semibold uppercase text-zinc-600 mb-1 flex items-center justify-between">
                      <span>
                        Tỉnh / Thành <span className="text-rose-500">*</span>
                      </span>
                      {isLoadingProvinces && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </label>
                    <select
                      required
                      value={selectedProvinceId}
                      onChange={(e) => handleSelectProvince(e.target.value)}
                      disabled={isLoadingProvinces}
                      className="w-full px-3 py-2 border border-zinc-300 focus:border-black focus:outline-none bg-white text-xs cursor-pointer disabled:bg-zinc-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn Tỉnh / Thành --</option>
                      {provinces.map((p) => (
                        <option key={p.PROVINCE_ID} value={p.PROVINCE_ID}>
                          {p.PROVINCE_NAME}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* QUẬN / HUYỆN */}
                  <div>
                    <label className="block font-semibold uppercase text-zinc-600 mb-1 flex items-center justify-between">
                      <span>
                        Quận / Huyện <span className="text-rose-500">*</span>
                      </span>
                      {isLoadingDistricts && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </label>
                    <select
                      required
                      value={selectedDistrictId}
                      onChange={(e) => handleSelectDistrict(e.target.value)}
                      disabled={!selectedProvinceId || isLoadingDistricts}
                      className="w-full px-3 py-2 border border-zinc-300 focus:border-black focus:outline-none bg-white text-xs cursor-pointer disabled:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                    >
                      <option value="">
                        {selectedProvinceId
                          ? "-- Chọn Quận / Huyện --"
                          : "-- Chọn Tỉnh trước --"}
                      </option>
                      {districts.map((d) => (
                        <option key={d.DISTRICT_ID} value={d.DISTRICT_ID}>
                          {d.DISTRICT_NAME}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PHƯỜNG / XÃ */}
                  <div>
                    <label className="block font-semibold uppercase text-zinc-600 mb-1 flex items-center justify-between">
                      <span>
                        Phường / Xã <span className="text-rose-500">*</span>
                      </span>
                      {isLoadingWards && (
                        <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      )}
                    </label>
                    <select
                      required
                      value={selectedWardId}
                      onChange={(e) => handleSelectWard(e.target.value)}
                      disabled={!selectedDistrictId || isLoadingWards}
                      className="w-full px-3 py-2 border border-zinc-300 focus:border-black focus:outline-none bg-white text-xs cursor-pointer disabled:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400"
                    >
                      <option value="">
                        {selectedDistrictId
                          ? "-- Chọn Phường / Xã --"
                          : "-- Chọn Huyện trước --"}
                      </option>
                      {wards.map((w) => (
                        <option key={w.WARDS_ID} value={w.WARDS_ID}>
                          {w.WARDS_NAME}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-600 mb-1">
                    Địa chỉ chi tiết (Số nhà, tên đường){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.detailAddress}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        detailAddress: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 focus:border-black focus:outline-none bg-white"
                    placeholder="123 Lê Lợi, Tòa nhà A"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-600 mb-1.5">
                    Loại địa chỉ
                  </label>
                  <div className="flex gap-2">
                    {["Nhà riêng", "Công ty"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() =>
                          setNewAddressForm({ ...newAddressForm, label: lbl })
                        }
                        className={`px-3 py-1.5 border text-xs uppercase font-medium cursor-pointer transition-colors ${
                          newAddressForm.label === lbl
                            ? "border-black bg-black text-white"
                            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHECKBOX: ĐẶT LÀM ĐỊA CHỈ MẶC ĐỊNH */}
                <div className="pt-2 border-t border-zinc-200">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newAddressForm.isDefault}
                      onChange={(e) =>
                        setNewAddressForm({
                          ...newAddressForm,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded-none accent-black cursor-pointer"
                    />
                    <span className="text-xs text-zinc-900 font-semibold">
                      Đặt làm địa chỉ mặc định
                    </span>
                  </label>
                  <p className="text-[11px] text-zinc-500 ml-6.5 mt-0.5">
                    Địa chỉ này sẽ tự động được ưu tiên chọn cho các đơn hàng tiếp theo.
                  </p>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-4 py-2.5 border border-zinc-300 text-zinc-700 text-xs font-bold uppercase tracking-wider hover:border-black transition-colors cursor-pointer"
                    >
                      Quay lại danh sách
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending}
                    className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {addAddressMutation.isPending && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    <span>Lưu & Sử Dụng</span>
                  </button>
                </div>
              </form>
            ) : (
              /* DANH SÁCH ĐỊA CHỈ ĐÃ LƯU */
              <div className="space-y-3">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  const isDef = addr.isDefault || addr.is_default;
                  const rName =
                    addr.receiverName || addr.full_name || profile?.full_name;
                  const rPhone =
                    addr.receiverPhone || addr.phone || profile?.phone;
                  const dAddr =
                    addr.detailAddress || addr.detail || addr.address_detail;

                  return (
                    <div
                      key={addr._id}
                      onClick={() => {
                        if (addr._id) setSelectedAddressId(addr._id);
                        setIsAddressModalOpen(false);
                      }}
                      className={`p-4 border cursor-pointer transition-all relative ${
                        isSelected
                          ? "border-black bg-zinc-50/80 ring-1 ring-black"
                          : "border-zinc-200 hover:border-zinc-400 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900 uppercase">
                            {rName}
                          </span>
                          <span className="text-zinc-400 text-xs">•</span>
                          <span className="text-xs font-mono font-semibold text-zinc-700">
                            {rPhone}
                          </span>
                          {isDef && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-black text-white">
                              Mặc định
                            </span>
                          )}
                          {addr.label && (
                            <span className="px-1.5 py-0.5 text-[9px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {addr.label}
                            </span>
                          )}
                        </div>

                        {/* Nút đặt làm mặc định nếu chưa phải mặc định */}
                        {!isDef && addr._id && (
                          <button
                            type="button"
                            disabled={setDefaultAddressMutation.isPending}
                            onClick={(e) => handleSetAsDefault(addr._id!, e)}
                            className="text-[11px] text-zinc-500 hover:text-black underline underline-offset-2 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {dAddr}, {addr.ward}, {addr.district}, {addr.province}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-100">
                        <span
                          className={`text-[11px] font-semibold ${
                            isSelected ? "text-black" : "text-zinc-400"
                          }`}
                        >
                          {isSelected
                            ? "✓ Đang sử dụng cho đơn hàng này"
                            : "Click để chọn địa chỉ này"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-3 mt-4 border border-dashed border-zinc-400 hover:border-black text-xs font-bold uppercase tracking-wider text-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Địa Chỉ Nhận Hàng Mới</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
