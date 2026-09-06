import { useEffect } from "react";
import { Drawer, Switch } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  FolderTree,
  Check,
  X,
  Globe,
  Sparkles,
} from "lucide-react";
import type { CategoryItem, CreateCategoryPayload } from "../../../types/categoryType";
import { useCreateCategory, useUpdateCategory } from "../../../hook/useCategory";
import { slugifyHelper as slugifyPreview } from "../../../utils/slugify";

export interface CategoryFormValues {
  name: string;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

interface CreateEditCategoryProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  initialValues?: CategoryItem | null;
  onSuccess?: () => void;
}

const CreateEditCategory = ({
  open,
  onClose,
  title = "THÊM MỚI DANH MỤC",
  initialValues,
  onSuccess,
}: CreateEditCategoryProps) => {
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
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

  // Đồng bộ khi mở modal hoặc thay đổi initialValues
  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({
          name: initialValues.name || "",
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

  const onSubmit = (data: CategoryFormValues) => {
    const keywordsArray = data.seo?.metaKeywords
      ? data.seo.metaKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    const payload: CreateCategoryPayload = {
      name: data.name.trim(),
      isActive: data.isActive,
      seo: {
        metaTitle: data.seo?.metaTitle?.trim() || undefined,
        metaDescription: data.seo?.metaDescription?.trim() || undefined,
        metaKeywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      },
    };

    if (initialValues?._id) {
      updateCategory(
        { id: initialValues._id, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else {
      createCategory(payload, {
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
          <FolderTree className="w-5 h-5 text-zinc-900" />
          <span className="text-base font-black uppercase tracking-tight text-zinc-900 font-sans">
            {title}
          </span>
        </div>
      }
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      width={540}
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
            <span>{isSubmitting ? "ĐANG LƯU..." : "LƯU DANH MỤC"}</span>
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-6 font-mono text-xs">
        {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
        <div className="border border-zinc-200 p-4 bg-white space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
            <Sparkles className="w-4 h-4 text-zinc-600" />
            THÔNG TIN CƠ BẢN
          </h3>

          <div>
            <label className="block text-zinc-700 mb-1 font-semibold">
              TÊN DANH MỤC <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "Tên danh mục không được để trống" })}
              placeholder="VD: Áo Thun, Quần Jeans, Áo Khoác..."
              className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-sm font-semibold"
            />
            {errors.name && (
              <span className="text-red-500 text-[11px] mt-1 block">{errors.name.message}</span>
            )}
          </div>

          {/* Đường dẫn xem trước (Slug) */}
          <div className="p-2.5 bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Đường dẫn tự động (Slug):</span>
            <span className="font-bold text-zinc-900 bg-white px-2 py-0.5 border border-zinc-300">
              /{slugifyPreview(watchedName) || "slug-danh-muc"}
            </span>
          </div>

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
        </div>

        {/* KHỐI 2: CẤU HÌNH SEO (TÙY CHỌN) */}
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
              placeholder="VD: Áo Thun Streetwear Cao Cấp - The Luki"
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
              placeholder="Mô tả ngắn gọn về danh mục sản phẩm phục vụ công cụ tìm kiếm Google..."
              className="w-full p-2 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-700 mb-1 font-semibold">
              TỪ KHÓA SEO (CÁCH NHAU BẰNG DẤU PHẨY)
            </label>
            <input
              {...register("seo.metaKeywords")}
              placeholder="ao thun, street style, the luki, local brand..."
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
                https://theluki.vn/category/{slugifyPreview(watchedName) || "ten-danh-muc"}
              </div>
              <div className="text-sm font-semibold text-blue-700 truncate hover:underline cursor-pointer font-sans">
                {watchedMetaTitle || watchedName || "Tiêu đề danh mục sản phẩm | The Luki"}
              </div>
              <div className="text-[11px] text-zinc-600 line-clamp-2 font-sans">
                {watchedMetaDesc ||
                  "Khám phá các sản phẩm thuộc danh mục thời trang streetwear chất lượng cao tại The Luki..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default CreateEditCategory;