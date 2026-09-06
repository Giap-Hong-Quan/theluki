import { useEffect } from "react";
import { Drawer, Switch } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  Sparkles,
  Check,
  X,
  ImageIcon,
  LayoutTemplate,
  Info,
} from "lucide-react";
import type { BannerItem } from "../../types/bannerType";
import { useCreateBanner, useUpdateBanner } from "../../hook/useBanner";

export interface BannerFormValues {
  image: string;
  position: "home_hero" | "popup";
  isActive: boolean;
}

interface CreateEditBannerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  initialValues?: BannerItem | null;
  onSuccess?: () => void;
}

const POSITION_OPTIONS: {
  key: "home_hero" | "popup";
  title: string;
  desc: string;
  aspect: string;
}[] = [
  {
    key: "home_hero",
    title: "HERO BANNER",
    desc: "Đầu trang chủ website",
    aspect: "Khuyên dùng 16:9 hoặc 21:9",
  },
  {
    key: "popup",
    title: "POPUP KHUYẾN MÃI",
    desc: "Cửa sổ nổi khi vào trang",
    aspect: "Khuyên dùng 4:5 hoặc 1:1",
  },
];

const CreateEditbanner = ({
  open,
  onClose,
  title = "THÊM MỚI BANNER",
  initialValues,
  onSuccess,
}: CreateEditBannerProps) => {
  const { mutate: createBanner, isPending: isCreating } = useCreateBanner();
  const { mutate: updateBanner, isPending: isUpdating } = useUpdateBanner();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>({
    defaultValues: {
      image: "",
      position: "home_hero",
      isActive: true,
    },
  });

  const watchedImage = watch("image") || "";
  const watchedPosition = watch("position") || "home_hero";

  // Đồng bộ khi mở modal hoặc thay đổi initialValues
  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({
          image: initialValues.image || "",
          position: initialValues.position || "home_hero",
          isActive: initialValues.isActive ?? true,
        });
      } else {
        reset({
          image: "",
          position: "home_hero",
          isActive: true,
        });
      }
    }
  }, [open, initialValues, reset]);

  const onSubmit = (data: BannerFormValues) => {
    const payload = {
      image: data.image.trim(),
      position: data.position,
      isActive: data.isActive,
    };

    if (initialValues?._id) {
      updateBanner(
        { id: initialValues._id, payload },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        }
      );
    } else {
      createBanner(payload, {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm font-bold text-zinc-950">
          <Sparkles className="w-4 h-4 text-black" />
          <span>{title}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={520}
      className="font-sans"
      footer={
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 bg-[#faf9f8] border-t border-[#dedbd5] font-mono">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>HỦY</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-9 px-5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2 shadow-xs disabled:bg-zinc-400"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "ĐANG LƯU..." : "LƯU BANNER"}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 font-mono text-xs">
        {/* 1. Chọn vị trí / loại banner */}
        <div>
          <label className="block text-zinc-800 mb-2 font-bold uppercase flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-zinc-500" />
            <span>1. LOẠI / VỊ TRÍ BANNER <strong className="text-red-500">*</strong></span>
          </label>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2.5">
                {POSITION_OPTIONS.map((opt) => {
                  const isSelected = field.value === opt.key;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => field.onChange(opt.key)}
                      className={`border p-3 cursor-pointer transition-all duration-150 select-none ${
                        isSelected
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-zinc-300 bg-zinc-50 text-zinc-900 hover:border-zinc-500"
                      }`}
                    >
                      <span className="font-bold text-xs block">{opt.title}</span>
                      <span
                        className={`text-[10px] block mt-1 line-clamp-1 ${
                          isSelected ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {opt.desc}
                      </span>
                      <span
                        className={`text-[9px] block mt-1 italic ${
                          isSelected ? "text-zinc-400" : "text-zinc-400"
                        }`}
                      >
                        {opt.aspect}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* 2. Đường dẫn hình ảnh banner */}
        <div>
          <label className="block text-zinc-800 mb-1.5 font-bold uppercase flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>2. HÌNH ẢNH BANNER (URL) <strong className="text-red-500">*</strong></span>
          </label>
          <input
            {...register("image", {
              required: "Hình ảnh banner là bắt buộc",
              validate: (val) => Boolean(val.trim()) || "Hình ảnh banner không được để trống",
            })}
            placeholder="Dán link ảnh (Cloudinary, Unsplash, CDN...)"
            className={`w-full h-10 px-3 border outline-none bg-white rounded-none font-sans text-xs transition-colors ${
              errors.image ? "border-red-500 focus:border-red-600" : "border-zinc-300 focus:border-black"
            }`}
          />
          {errors.image && (
            <span className="text-[11px] text-red-500 mt-1 block">
              {errors.image.message}
            </span>
          )}

          {/* Khung xem trước ảnh */}
          {watchedImage && (
            <div className="mt-3 border border-zinc-200 bg-zinc-50 p-2.5">
              <span className="block text-[10px] text-zinc-500 mb-1.5 uppercase font-bold">
                XEM TRƯỚC HÌNH ẢNH:
              </span>
              <div
                className={`w-full bg-zinc-200 border border-zinc-300 overflow-hidden flex items-center justify-center ${
                  watchedPosition === "home_hero" ? "aspect-[21/9]" : "aspect-[4/3] max-w-[280px] mx-auto"
                }`}
              >
                <img
                  src={watchedImage}
                  alt="Xem trước banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x300?text=Link+ảnh+lỗi+hoặc+không+tồn+tại";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Công tắc trạng thái kích hoạt */}
        <div className="border border-zinc-300 bg-zinc-50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-zinc-900 uppercase block">KÍCH HOẠT HIỂN THỊ</span>
              <span className="text-[11px] text-zinc-500 block">
                Cho phép banner này hiển thị ra ngoài website client
              </span>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className={field.value ? "bg-black" : "bg-zinc-300"}
                />
              )}
            />
          </div>

          <div className="pt-2 border-t border-zinc-200 flex items-start gap-1.5 text-zinc-500 text-[10px]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
            <span>
              <strong>Lưu ý:</strong> Mỗi loại banner (Hero hoặc Popup) chỉ có duy nhất 1 banner được bật. Nếu bạn kích hoạt banner này, banner cùng loại đang hiển thị sẽ tự động tắt.
            </span>
          </div>
        </div>
      </form>
    </Drawer>
  );
};

export default CreateEditbanner;
