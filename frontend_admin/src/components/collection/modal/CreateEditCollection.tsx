import { useEffect } from "react";
import { Drawer, Switch } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  Layers,
  Check,
  X,
  Globe,
  Sparkles,
  Star,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import type { CollectionItem, CreateCollectionPayload } from "../../../types/collectionType";
import { useCreateCollection, useUpdateCollection } from "../../../hook/useCollection";
import { slugifyHelper as slugifyPreview } from "../../../utils/slugify";

export interface CollectionFormValues {
  name: string;
  description?: string;
  thumbnail_url?: string;
  banner_url?: string;
  isFeatured: boolean;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

interface CreateEditCollectionProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  initialValues?: CollectionItem | null;
  onSuccess?: () => void;
}

const CreateEditCollection = ({
  open,
  onClose,
  title = "THÊM MỚI BỘ SƯU TẬP",
  initialValues,
  onSuccess,
}: CreateEditCollectionProps) => {
  const { mutate: createCollection, isPending: isCreating } = useCreateCollection();
  const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    defaultValues: {
      name: "",
      description: "",
      thumbnail_url: "",
      banner_url: "",
      isFeatured: false,
      isActive: true,
      seo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      },
    },
  });

  const watchedName = watch("name") || "";
  const watchedMetaTitle = watch("seo.metaTitle") || "";
  const watchedMetaDesc = watch("seo.metaDescription") || "";
  const watchedThumbnail = watch("thumbnail_url") || "";
  const watchedBanner = watch("banner_url") || "";

  // Đồng bộ khi mở modal hoặc thay đổi initialValues
  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({
          name: initialValues.name || "",
          description: initialValues.description || "",
          thumbnail_url: initialValues.thumbnail_url || "",
          banner_url: initialValues.banner_url || "",
          isFeatured: initialValues.isFeatured ?? false,
          isActive: initialValues.isActive ?? true,
          seo: {
            metaTitle: initialValues.seo?.metaTitle || "",
            metaDescription: initialValues.seo?.metaDescription || "",
            metaKeywords: initialValues.seo?.metaKeywords?.join(", ") || "",
          },
        });
      } else {
        reset({
          name: "",
          description: "",
          thumbnail_url: "",
          banner_url: "",
          isFeatured: false,
          isActive: true,
          seo: {
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
          },
        });
      }
    }
  }, [open, initialValues, reset]);

  const onSubmit = (data: CollectionFormValues) => {
    const keywordsArray = data.seo?.metaKeywords
      ? data.seo.metaKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    const payload: CreateCollectionPayload = {
      name: data.name.trim(),
      description: data.description?.trim() || "",
      thumbnail_url: data.thumbnail_url?.trim() || null,
      banner_url: data.banner_url?.trim() || null,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || undefined,
        metaDescription: data.seo?.metaDescription?.trim() || undefined,
        metaKeywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      },
    };

    if (initialValues?._id) {
      updateCollection(
        { id: initialValues._id, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else {
      createCollection(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-900" />
          <span className="text-base font-black uppercase tracking-tight text-zinc-900 font-sans">
            {title}
          </span>
        </div>
      }
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      width={600}
      className="[&_.ant-drawer-header]:border-b [&_.ant-drawer-header]:border-[#e5e3df] [&_.ant-drawer-header]:px-6 [&_.ant-drawer-body]:p-0 font-sans"
      footer={
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 bg-[#faf9f8] border-t border-[#e5e3df]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 uppercase bg-white border border-[#c8c5be] text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer transition-colors font-mono flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>HỦY</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-9 px-5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors font-mono flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "ĐANG LƯU..." : "LƯU BỘ SƯU TẬP"}</span>
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-6 font-mono text-xs">
        {/* KHỐI 1: THÔNG TIN CHÍNH */}
        <div className="border border-zinc-200 p-4 bg-white space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
            <Sparkles className="w-4 h-4 text-zinc-600" />
            THÔNG TIN BỘ SƯU TẬP
          </h3>

          <div>
            <label className="block text-zinc-700 mb-1 font-semibold">
              TÊN BỘ SƯU TẬP <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "Tên bộ sưu tập không được để trống" })}
              placeholder="VD: Spring Summer 2026, Urban Night Lookbook..."
              className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-sm font-semibold"
            />
            {errors.name && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.name.message}</span>
            )}
          </div>

          {/* Đường dẫn tự động (Slug) */}
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Đường dẫn tự động (Slug):</span>
            <span className="font-bold text-zinc-900 bg-white px-2 py-0.5 border border-zinc-300 font-mono">
              /collection/{slugifyPreview(watchedName) || "ten-bo-suu-tap"}
            </span>
          </div>

          {/* Mô tả / Câu chuyện BST */}
          <div>
            <label className="block text-zinc-700 mb-1 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              MÔ TẢ / THÔNG ĐIỆP BỘ SƯU TẬP
            </label>
            <textarea
              rows={3}
              {...register("description")}
              placeholder="Ý tưởng thiết kế, thông điệp lookbook gửi gắm đến khách hàng..."
              className="w-full p-2.5 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans resize-none"
            />
          </div>

          {/* Công tắc Bật/Tắt & Nổi bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-zinc-700 mb-1 font-semibold">TRẠNG THÁI HIỂN THỊ</label>
              <div className="h-9 flex items-center gap-3 px-3 border border-zinc-200 bg-zinc-50">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      size="small"
                      className="[&.ant-switch-checked]:!bg-black"
                    />
                  )}
                />
                <span className="font-bold text-zinc-800 text-[11px]">
                  {watch("isActive") ? "ĐANG HOẠT ĐỘNG" : "TẠM ẨN"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 mb-1 font-semibold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                BỘ SƯU TẬP NỔI BẬT
              </label>
              <div className="h-9 flex items-center gap-3 px-3 border border-zinc-200 bg-zinc-50">
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      size="small"
                      className="[&.ant-switch-checked]:!bg-amber-600"
                    />
                  )}
                />
                <span className={`font-bold text-[11px] ${watch("isFeatured") ? "text-amber-700" : "text-zinc-500"}`}>
                  {watch("isFeatured") ? "HIỂN THỊ TRANG CHỦ" : "THÔNG THƯỜNG"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: HÌNH ẢNH BANNER & THUMBNAIL */}
        <div className="border border-zinc-200 p-4 bg-white space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
            <ImageIcon className="w-4 h-4 text-zinc-600" />
            HÌNH ẢNH CARD & BANNER LOOKBOOK
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-zinc-700 mb-1 font-semibold">
                ẢNH BÌA CARD (THUMBNAIL URL)
              </label>
              <input
                {...register("thumbnail_url")}
                placeholder="https://res.cloudinary.com/.../thumb.jpg"
                className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono"
              />
              {watchedThumbnail && (
                <div className="mt-2 w-32 h-20 border border-zinc-300 overflow-hidden bg-zinc-100">
                  <img
                    src={watchedThumbnail}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/200x120?text=Error";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-zinc-700 mb-1 font-semibold">
                ẢNH BANNER NGANG ĐẦU TRANG (BANNER URL)
              </label>
              <input
                {...register("banner_url")}
                placeholder="https://res.cloudinary.com/.../banner.jpg"
                className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono"
              />
              {watchedBanner && (
                <div className="mt-2 w-full h-24 border border-zinc-300 overflow-hidden bg-zinc-100">
                  <img
                    src={watchedBanner}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x150?text=Error";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KHỐI 3: CẤU HÌNH SEO (TÙY CHỌN) */}
        <div className="border border-zinc-200 p-4 bg-white space-y-3.5">
          <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
            <Globe className="w-4 h-4 text-zinc-600" />
            TỐI ƯU HÓA TÌM KIẾM (SEO)
          </h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-700 font-semibold">TIÊU ĐỀ SEO (META TITLE)</label>
              <span className={`text-[10px] ${watchedMetaTitle.length > 70 ? "text-red-500" : "text-zinc-400"}`}>
                {watchedMetaTitle.length}/70 ký tự
              </span>
            </div>
            <input
              {...register("seo.metaTitle")}
              placeholder="VD: Bộ Sưu Tập Mùa Hè 2026 Độc Bản - The Luki"
              className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-700 font-semibold">MÔ TẢ SEO (META DESCRIPTION)</label>
              <span className={`text-[10px] ${watchedMetaDesc.length > 160 ? "text-red-500" : "text-zinc-400"}`}>
                {watchedMetaDesc.length}/160 ký tự
              </span>
            </div>
            <textarea
              rows={2}
              {...register("seo.metaDescription")}
              placeholder="Mô tả tóm tắt cho công cụ tìm kiếm Google..."
              className="w-full p-2 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-700 mb-1 font-semibold">
              TỪ KHÓA SEO (CÁCH NHAU BẰNG DẤU PHẨY)
            </label>
            <input
              {...register("seo.metaKeywords")}
              placeholder="bst the luki, lookbook, streetwear 2026..."
              className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans"
            />
          </div>

          {/* Google Preview Snippet */}
          <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Xem trước hiển thị tìm kiếm Google
            </span>
            <div className="space-y-0.5">
              <div className="text-[11px] text-zinc-500 truncate">
                https://theluki.vn/collection/{slugifyPreview(watchedName) || "ten-bo-suu-tap"}
              </div>
              <div className="text-sm font-semibold text-blue-700 truncate hover:underline cursor-pointer font-sans">
                {watchedMetaTitle || watchedName || "Bộ sưu tập thời trang | The Luki Lookbook"}
              </div>
              <div className="text-[11px] text-zinc-600 line-clamp-2 font-sans">
                {watchedMetaDesc ||
                  "Khám phá các thiết kế ấn tượng nằm trong bộ sưu tập thời trang mới nhất của The Luki..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default CreateEditCollection;
