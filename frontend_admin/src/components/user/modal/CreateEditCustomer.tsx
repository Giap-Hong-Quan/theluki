import { useRef, useState } from "react";
import { Drawer } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  Mail,
  Phone,
  Lock,
  Coins,
  Image as ImageIcon,
  Check,
  X,
  Upload,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { MEMBERSHIP_TIER_OPTIONS } from "../../../constants/navigation";
import type { UserItem } from "../../../types/userType";

export interface CustomerFormValues {
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  avatarFile?: File | null;
  membership_tier?: string;
  role?: string;
  accumulated_points?: number;
  isActive: boolean;
  isOTPEmail: boolean;
  address?: {
    receiverName?: string;
    receiverPhone?: string;
    province?: string;
    district?: string;
    ward?: string;
    detail?: string;
  };
}

interface CreateEditCustomerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialValues?: UserItem | null;
}

const CreateEditCustomer = ({
  open,
  onClose,
  title,
}: CreateEditCustomerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarMode, setAvatarMode] = useState<"file" | "url">("file");
  const [previewAvatar, setPreviewAvatar] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const {register,handleSubmit,control,setValue,watch,formState: { errors } } = useForm<CustomerFormValues>({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      avatar: "",
      avatarFile: null,
      membership_tier: "newbie",
      role: "user",
      accumulated_points: 0,
      isActive: true,
      isOTPEmail: false,
      address: {
        receiverName: "",
        receiverPhone: "",
        province: "",
        district: "",
        ward: "",
        detail: "",
      },
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewAvatar(url);
      setSelectedFileName(file.name);
      setValue("avatarFile", file);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewAvatar("");
    setSelectedFileName("");
    setValue("avatarFile", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const avatarUrl = watch("avatar");
  const fullName = watch("full_name");
  const displayImage = avatarMode === "file" ? previewAvatar : avatarUrl;

  // Chỉ dựng UI, không xử lý logic backend theo yêu cầu
  const onSubmitFake = (data: CustomerFormValues) => {
    console.log("Customer Form Data (UI Preview):", data);
  };

  return (
    <Drawer
      title={
        <span className="text-base font-black uppercase tracking-tight text-zinc-900 font-sans">
          {title}
        </span>
      }
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      width={620}
      className="[&_.ant-drawer-header]:border-b [&_.ant-drawer-header]:border-[#e5e3df] [&_.ant-drawer-header]:px-6 [&_.ant-drawer-body]:p-0"
      footer={
        <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#faf9f8] border-t border-[#e5e3df]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors font-mono flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>HỦY</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmitFake)}
            className="h-9 px-5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors font-mono flex items-center gap-2 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>LƯU THÔNG TIN</span>
          </button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmitFake)}
        className="p-3 space-y-6 text-zinc-800"
      >
        {/* AVATAR DUAL MODE: CHỌN TỪ MÁY HOẶC NHẬP LINK */}
        <div className="p-4 bg-[#faf9f8] border border-[#e5e3df] flex flex-col sm:flex-row items-center gap-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          {/* AVATAR PREVIEW */}
          <div className="relative shrink-0">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Avatar Preview"
                className="w-20 h-20 border-2 border-black object-cover bg-white shadow-2xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://api.dicebear.com/7.x/initials/svg?seed=" +
                    encodeURIComponent(fullName || "User");
                }}
              />
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center text-zinc-400">
                <ImageIcon className="w-6 h-6 mb-1 text-zinc-400" />
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                  {avatarMode === "file" ? "Chưa chọn" : "Chưa nhập"}
                </span>
              </div>
            )}
          </div>

          {/* AVATAR CONTROLS */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e3df] pb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-800 font-mono">
                ẢNH ĐẠI DIỆN
              </label>

              {/* TABS CHỌN CHẾ ĐỘ */}
              <div className="flex items-center border border-[#c8c5be] bg-white p-0.5 font-mono text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setAvatarMode("file")}
                  className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
                    avatarMode === "file"
                      ? "bg-black text-white"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>TẢI TỪ MÁY</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode("url")}
                  className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
                    avatarMode === "url"
                      ? "bg-black text-white"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>NHẬP LINK</span>
                </button>
              </div>
            </div>

            {/* NỘI DUNG THEO TỪNG CHẾ ĐỘ */}
            {avatarMode === "file" ? (
              <div className="space-y-2">
                {selectedFileName && (
                  <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[340px]">
                    Tệp đã chọn: {selectedFileName}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 bg-white hover:bg-zinc-100 text-zinc-900 border border-[#c8c5be] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {previewAvatar ? "ĐỔI ẢNH KHÁC" : "CHỌN ẢNH TỪ MÁY"}
                    </span>
                  </button>

                  {previewAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="h-8 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-mono font-semibold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>XÓA ẢNH</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  {...register("avatar")}
                  className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  Dán URL ảnh hoặc để trống để sử dụng avatar mặc định.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* DANH SÁCH TRƯỜNG THÔNG TIN (GỌN GÀNG, BỎ MỤC LỚN) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Họ tên */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              HỌ VÀ TÊN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A"
              {...register("full_name", {
                required: "Vui lòng nhập họ và tên",
              })}
              className={`w-full h-9 px-3 bg-white border ${
                errors.full_name ? "border-red-500" : "border-[#c8c5be]"
              } text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors`}
            />
            {errors.full_name && (
              <span className="text-red-500 text-[11px] font-mono mt-1 block">
                {errors.full_name.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              EMAIL <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                placeholder="customer@example.com"
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email không hợp lệ",
                  },
                })}
                className={`w-full h-9 pl-9 pr-3 bg-white border ${
                  errors.email ? "border-red-500" : "border-[#c8c5be]"
                } text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors`}
              />
            </div>
            {errors.email && (
              <span className="text-red-500 text-[11px] font-mono mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              SỐ ĐIỆN THOẠI
            </label>
            <div className="relative flex items-center">
              <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="0987654321"
                {...register("phone")}
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              MẬT KHẨU
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                placeholder="Để trống nếu không thay đổi / Tối thiểu 6 ký tự"
                {...register("password")}
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Hạng thành viên */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              HẠNG THÀNH VIÊN
            </label>
            <select
              {...register("membership_tier")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 focus:border-black focus:outline-none cursor-pointer uppercase"
            >
              {MEMBERSHIP_TIER_OPTIONS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          {/* Điểm tích lũy */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              ĐIỂM TÍCH LŨY
            </label>
            <div className="relative flex items-center">
              <Coins className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="number"
                placeholder="0"
                {...register("accumulated_points", { valueAsNumber: true })}
                className="w-full h-9 pl-9 pr-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Kích hoạt tài khoản */}
          <div className="p-2.5 bg-[#faf9f8] border border-[#e5e3df] flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase text-zinc-900 font-mono">
                HOẠT ĐỘNG
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Cho phép đăng nhập
              </span>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              )}
            />
          </div>

          {/* Xác thực Email */}
          <div className="p-2.5 bg-[#faf9f8] border border-[#e5e3df] flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase text-zinc-900 font-mono">
                XÁC THỰC EMAIL
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Đã qua OTP
              </span>
            </div>
            <Controller
              name="isOTPEmail"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              )}
            />
          </div>

          {/* Tên người nhận hàng */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              NGƯỜI NHẬN HÀNG
            </label>
            <input
              type="text"
              placeholder="Tên người nhận"
              {...register("address.receiverName")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {/* SĐT nhận hàng */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              SĐT NHẬN HÀNG
            </label>
            <input
              type="text"
              placeholder="0987654321"
              {...register("address.receiverPhone")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {/* Tỉnh / TP */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              TỈNH / THÀNH PHỐ
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Hà Nội"
              {...register("address.province")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {/* Quận / Huyện */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              QUẬN / HUYỆN
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Cầu Giấy"
              {...register("address.district")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {/* Phường / Xã */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              PHƯỜNG / XÃ
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Dịch Vọng Hậu"
              {...register("address.ward")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {/* Địa chỉ chi tiết */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 font-mono mb-1">
              SỐ NHÀ / ĐƯỜNG
            </label>
            <input
              type="text"
              placeholder="Số 123 đường ABC..."
              {...register("address.detail")}
              className="w-full h-9 px-3 bg-white border border-[#c8c5be] text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none transition-colors"
            />
          </div>
        </div>
      </form>
    </Drawer>
  );
};

export default CreateEditCustomer;
