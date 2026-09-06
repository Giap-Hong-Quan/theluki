import { useEffect, useState, useRef, useMemo } from "react";
import { Drawer, Switch, Select } from "antd";
import { useForm, Controller, useFieldArray, type Control, type UseFormRegister,} from "react-hook-form";
import {Shirt, Check, X, Globe, Plus, Trash2,Image as ImageIcon,Layers,Tag as TagIcon,Star, Info,Upload, Link as LinkIcon,} from "lucide-react";
import type { ProductItem, CreateProductPayload, UpdateProductPayload} from "../../../types/productType";
import { useCreateProduct, useUpdateProduct } from "../../../hook/useProduct";
import { useGetAllCategories } from "../../../hook/useCategory";
import { useGetAllCollections } from "../../../hook/useCollection";
import { slugifyHelper as slugifyPreview } from "../../../utils/slugify";
import { formatPrice } from "../../../utils/formatPrice";

export interface ProductFormValues {
  name: string;
  sku?: string;
  price: number;
  original_price?: number;
  category: string;
  collections?: string[];
  weight?: number;
  description?: string;
  thumbnail?: string;
  size_chart?: string;
  imagesText?: string;
  isFeatured: boolean;
  isActive: boolean;
  attributes: { name: string; value: string }[];
  variants: {
    color: string;
    image?: string;
    sku?: string;
    isActive?: boolean;
    sizes: { size: string; stock: number }[];
  }[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

interface CreateEditProductProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  initialValues?: ProductItem | null;
  onSuccess?: () => void;
}

// Chuyển File từ máy tính sang chuỗi Base64 Data URL để preview và lưu DB
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Không thể chuyển đổi file ảnh"));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Component chọn ảnh đơn với 2 chế độ (Tải từ máy & Nhập link)
interface DualImageFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  description?: string;
}

const DualImageField = ({
  label,
  icon,
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
  description,
}: DualImageFieldProps) => {
  const [mode, setMode] = useState<"file" | "url">(
    value && !value.startsWith("data:") ? "url" : "file"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        console.error("Lỗi đọc file ảnh:", err);
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border border-zinc-300 bg-white p-4 space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
        <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2">
          {icon || <ImageIcon className="w-4 h-4 text-zinc-600" />}
          <span>{label}</span>
        </h3>

        {/* Chuyển chế độ File / URL */}
        <div className="flex items-center border border-[#c8c5be] bg-white p-0.5 font-mono text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
              mode === "file"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>TẢI TỪ MÁY</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
              mode === "url"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>NHẬP LINK</span>
          </button>
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-zinc-500 font-sans">{description}</p>
      )}

      {/* Điều khiển theo chế độ */}
      {mode === "file" ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-4 bg-white hover:bg-zinc-100 text-zinc-900 border border-[#c8c5be] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{value ? "ĐỔI ẢNH TỪ MÁY" : "CHỌN ẢNH TỪ MÁY"}</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="h-9 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-mono font-semibold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>XÓA ẢNH</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <label className="block text-zinc-700 font-semibold text-xs font-sans">
            ĐƯỜNG DẪN URL ẢNH
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono text-xs"
            />
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="h-9 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-mono font-semibold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>XÓA</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Khung xem trước ảnh */}
      {value ? (
        <div className="flex items-center gap-3 p-2 bg-zinc-50 border border-zinc-200">
          <div className="w-16 h-16 border border-zinc-300 overflow-hidden bg-white shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/100x100?text=Loi+Anh";
              }}
            />
          </div>
          <div className="text-xs font-mono text-zinc-600 space-y-0.5 flex-1 min-w-0">
            <span className="font-bold text-zinc-900 block truncate">
              {value.startsWith("data:")
                ? "Ảnh từ máy tính (Data Base64)"
                : value}
            </span>
            <span className="text-[10px] text-zinc-400 block font-mono">
              Ảnh hợp lệ và sẵn sàng lưu vào hệ thống
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-zinc-50 border border-dashed border-zinc-300 flex items-center gap-2 text-zinc-400 text-xs font-mono">
          <ImageIcon className="w-4 h-4 text-zinc-400" />
          <span>Chưa có ảnh nào được chọn.</span>
        </div>
      )}
    </div>
  );
};

// Component chọn ảnh biến thể màu sắc (Nhỏ gọn trong grid 3 cột)
const VariantDualImageField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  const [mode, setMode] = useState<"file" | "link">(
    value && !value.startsWith("data:") ? "link" : "file"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        console.error("Lỗi đọc ảnh biến thể:", err);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />
      <div className="flex items-center justify-between mb-1">
        <label className="block text-zinc-700 font-semibold text-xs font-sans">
          ẢNH BIẾN THỂ
        </label>
        <div className="flex items-center border border-[#c8c5be] bg-white p-0.5 font-mono text-[9px] font-bold">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-1.5 py-0.5 flex items-center gap-0.5 transition-colors cursor-pointer ${
              mode === "file"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <Upload className="w-2.5 h-2.5" />
            <span>MÁY</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`px-1.5 py-0.5 flex items-center gap-0.5 transition-colors cursor-pointer ${
              mode === "link"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>LINK</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative group w-8 h-8 shrink-0 border border-zinc-300 bg-white overflow-hidden shadow-2xs">
            <img
              src={value}
              alt="Variant Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/50x50?text=Err";
              }}
            />
            <button
              type="button"
              onClick={() => {
                onChange("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Xóa ảnh"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        ) : (
          <div className="w-8 h-8 shrink-0 border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center text-zinc-300">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {mode === "file" ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-8 px-2 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 text-xs font-mono font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>{value ? "ĐỔI ẢNH" : "CHỌN TỪ MÁY"}</span>
            </button>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://.../color.jpg"
              className="w-full h-8 px-2 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono text-xs"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component Input tự động định dạng số có phân tách hàng nghìn (VD: 450.000)
interface FormattedNumberInputProps {
  value?: number | null;
  onChange: (val?: number) => void;
  placeholder?: string;
  className?: string;
}

const FormattedNumberInput = ({
  value,
  onChange,
  placeholder,
  className,
}: FormattedNumberInputProps) => {
  const displayValue =
    value !== undefined && value !== null && !isNaN(value)
      ? formatPrice(value, false)
      : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      onChange(undefined);
    } else {
      const parsed = parseInt(raw, 10);
      onChange(isNaN(parsed) ? undefined : parsed);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

// Component quản lý Size động của từng biến thể màu sắc
interface VariantSizesManagerProps {
  vIndex: number;
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
}

const QUICK_SIZES = ["S", "M", "L", "XL", "2XL", "FreeSize"];

const VariantSizesManager = ({
  vIndex,
  control,
  register,
}: VariantSizesManagerProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `variants.${vIndex}.sizes` as const,
  });

  const handleAddSize = (sizeName: string = "") => {
    append({
      size: sizeName,
      stock: 10,
    });
  };

  return (
    <div className="pt-2.5 border-t border-zinc-200 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold block text-zinc-800">
            CÁC SIZE & TỒN KHO CỦA MÀU NÀY:
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 font-bold">
            {fields.length} SIZE
          </span>
        </div>

        {/* Nút thêm size & Gợi ý nhanh */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
            Gợi ý nhanh:
          </span>
          <div className="flex items-center gap-1">
            {QUICK_SIZES.map((qs) => (
              <button
                key={qs}
                type="button"
                onClick={() => handleAddSize(qs)}
                className="text-[10px] font-mono px-1.5 py-0.5 border border-zinc-200 bg-white hover:border-black hover:bg-zinc-100 text-zinc-700 cursor-pointer transition-colors"
                title={`Thêm nhanh size ${qs}`}
              >
                +{qs}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleAddSize("")}
            className="h-6 px-2.5 text-[11px] font-mono font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            THÊM SIZE
          </button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center space-y-1.5">
          <p className="text-xs font-mono text-zinc-500">
            Chưa có size nào cho biến thể này.
          </p>
          <button
            type="button"
            onClick={() => handleAddSize("FreeSize")}
            className="text-xs font-mono text-black underline font-bold hover:text-zinc-700 cursor-pointer"
          >
            + Nhấn vào đây để thêm size FreeSize
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {fields.map((fieldItem, szIndex) => (
            <div
              key={fieldItem.id}
              className="p-1.5 border border-zinc-300 bg-zinc-50 space-y-1 relative group hover:border-black transition-colors"
            >
              {/* Header size: Input tên size + nút xóa */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Size..."
                  {...register(
                    `variants.${vIndex}.sizes.${szIndex}.size` as const,
                    { required: true }
                  )}
                  className="w-full h-6 px-1 text-center font-mono text-xs font-bold border border-zinc-300 focus:border-black outline-none bg-white uppercase"
                />
                <button
                  type="button"
                  onClick={() => remove(szIndex)}
                  className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer transition-colors"
                  title="Xóa size này"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Input tồn kho */}
              <div className="space-y-0.5">
                <div className="text-[9px] font-mono text-zinc-400 text-center font-semibold">
                  TỒN KHO
                </div>
                <input
                  type="number"
                  min={0}
                  {...register(
                    `variants.${vIndex}.sizes.${szIndex}.stock` as const,
                    { valueAsNumber: true }
                  )}
                  placeholder="SL"
                  className="w-full h-7 px-1 text-center border border-zinc-300 focus:border-black outline-none bg-white font-mono text-xs font-bold"
                />
              </div>
            </div>
          ))}

          {/* Ô nút bấm Thêm Size dạng thẻ trong Grid */}
          <button
            type="button"
            onClick={() => handleAddSize("")}
            className="p-2 border border-dashed border-zinc-300 hover:border-black bg-white hover:bg-zinc-50 text-zinc-500 hover:text-black flex flex-col items-center justify-center min-h-[68px] cursor-pointer transition-colors space-y-0.5"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-[10px] font-mono font-bold">+ THÊM SIZE</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Component chọn nhiều ảnh Gallery (Tải từ máy hàng loạt & Nhập link)
const GalleryDualImageField = ({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) => {
  const [mode, setMode] = useState<"file" | "url">("file");
  const [inputUrl, setInputUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const fileList = Array.from(files);
        const dataUrls = await Promise.all(fileList.map(readFileAsDataUrl));
        onChange([...images, ...dataUrls]);
      } catch (err) {
        console.error("Lỗi đọc nhiều file ảnh:", err);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleAddUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    const urls = trimmed
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    onChange([...images, ...urls]);
    setInputUrl("");
  };

  const handleRemoveOne = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="border border-zinc-300 bg-white p-4 space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesSelected}
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-zinc-600" />
          <h3 className="text-xs font-mono font-bold uppercase text-zinc-900">
            DANH SÁCH ẢNH CHI TIẾT (GALLERY)
          </h3>
          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-800">
            {images.length} ảnh
          </span>
        </div>

        {/* Chuyển chế độ Tải từ máy / Nhập link */}
        <div className="flex items-center border border-[#c8c5be] bg-white p-0.5 font-mono text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
              mode === "file"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>TẢI TỪ MÁY</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 flex items-center gap-1 transition-colors cursor-pointer ${
              mode === "url"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>NHẬP LINK</span>
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div className="space-y-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 hover:border-black p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-5 h-5 text-zinc-600" />
            <span className="text-xs font-mono font-bold uppercase text-zinc-900">
              BẤM ĐỂ CHỌN ẢNH TỪ MÁY TÍNH
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Hỗ trợ chọn nhiều ảnh cùng lúc (JPG, PNG, WEBP)
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-zinc-700 font-semibold text-xs font-sans">
            NHẬP LINK ẢNH (MỖI LINK MỘT DÒNG HOẶC NHẬP TỪNG LINK)
          </label>
          <div className="flex gap-2">
            <textarea
              rows={2}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/lookbook-1.jpg&#10;https://example.com/lookbook-2.jpg"
              className="flex-1 p-2 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono text-xs resize-y"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>THÊM LINK</span>
            </button>
          </div>
        </div>
      )}

      {/* Hiển thị danh sách ảnh đã chọn */}
      {images.length > 0 ? (
        <div className="space-y-2 pt-2 border-t border-zinc-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-600 font-bold">
              ALBUM ẢNH ({images.length}):
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>XÓA TẤT CẢ</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group border border-zinc-300 bg-white aspect-square overflow-hidden shadow-2xs"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100x100?text=Loi+Anh";
                  }}
                />
                <span className="absolute bottom-1 left-1 bg-black/70 text-white font-mono text-[9px] px-1 font-bold">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveOne(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                  title="Xóa ảnh này"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-zinc-50 border border-dashed border-zinc-300 flex items-center gap-2 text-zinc-400 text-xs font-mono">
          <ImageIcon className="w-4 h-4 text-zinc-400" />
          <span>Chưa có ảnh chi tiết nào trong album.</span>
        </div>
      )}
    </div>
  );
};

const CreateEditProduct = ({
  open,
  onClose,
  title = "THÊM MỚI SẢN PHẨM",
  initialValues,
  onSuccess,
}: CreateEditProductProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const isSubmitting = isCreating || isUpdating;

  // Lấy danh mục và bộ sưu tập để chọn (lấy toàn bộ, không giới hạn isActive để hiển thị đủ khi sửa)
  const { data: listCategories } = useGetAllCategories();
  const { data: listCollections } = useGetAllCollections();

  // Đảm bảo category của sản phẩm hiện tại luôn có trong options để hiển thị Tên thay vì ID
  const categoryOptions = useMemo(() => {
    const list = (listCategories?.categories || []).map((cat) => ({
      value: cat._id,
      label: cat.name,
    }));

    if (initialValues?.category) {
      const currentCatId =
        typeof initialValues.category === "object"
          ? initialValues.category._id
          : initialValues.category;
      const currentCatName =
        typeof initialValues.category === "object"
          ? initialValues.category.name
          : undefined;

      if (currentCatId && !list.some((item) => item.value === currentCatId)) {
        list.unshift({
          value: currentCatId,
          label: currentCatName || currentCatId,
        });
      }
    }

    return list;
  }, [listCategories, initialValues]);

  // Đảm bảo collections của sản phẩm hiện tại luôn có trong options để hiển thị Tên thay vì ID
  const collectionOptions = useMemo(() => {
    const list = (listCollections?.collections || []).map((col) => ({
      value: col._id,
      label: col.name,
    }));

    if (initialValues?.collections && Array.isArray(initialValues.collections)) {
      initialValues.collections.forEach((col: any) => {
        const colId = typeof col === "object" ? col?._id : col;
        const colName = typeof col === "object" ? col?.name : undefined;
        if (colId && !list.some((item) => item.value === colId)) {
          list.unshift({
            value: colId,
            label: colName || colId,
          });
        }
      });
    }

    return list;
  }, [listCollections, initialValues]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      original_price: undefined,
      category: "",
      collections: [],
      weight: 300,
      description: "",
      thumbnail: "",
      size_chart: "",
      imagesText: "",
      isFeatured: false,
      isActive: true,
      attributes: [
        { name: "CHẤT LIỆU", value: "100% Cotton Compact" },
        { name: "FORM DÁNG", value: "Boxy Oversize" },
      ],
      variants: [
        {
          color: "Màu Đen (Black)",
          image: "",
          sku: "",
          isActive: true,
          sizes: [
            { size: "S", stock: 15 },
            { size: "M", stock: 25 },
            { size: "L", stock: 10 },
          ],
        },
      ],
      seo: {
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
      },
    },
  });

  // Dynamic fields cho Attributes
  const {
    fields: attrFields,
    append: appendAttr,
    remove: removeAttr,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  // Dynamic fields cho Variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const watchedName = watch("name") || "";
  const watchedMetaTitle = watch("seo.metaTitle") || "";
  const watchedMetaDesc = watch("seo.metaDescription") || "";

  // Reset form khi mở modal hoặc thay đổi sản phẩm edit
  useEffect(() => {
    if (open) {
      if (initialValues) {
        // Edit mode
        setGalleryImages(initialValues.images || []);
        reset({
          name: initialValues.name || "",
          sku: initialValues.sku || "",
          price: initialValues.price || 0,
          original_price: initialValues.original_price || undefined,
          category:
            (typeof initialValues.category === "object"
              ? initialValues.category?._id
              : initialValues.category) || "",
          collections: (initialValues.collections || [])
            .map((c: any) => (typeof c === "object" ? c?._id : c))
            .filter(Boolean),
          weight: initialValues.weight || 300,
          description: initialValues.description || "",
          thumbnail: initialValues.thumbnail || "",
          size_chart: initialValues.size_chart || "",
          imagesText: (initialValues.images || []).join("\n"),
          isFeatured: initialValues.isFeatured ?? false,
          isActive: initialValues.isActive ?? true,
          attributes:
            initialValues.attributes && initialValues.attributes.length > 0
              ? initialValues.attributes.map((a) => ({
                  name: a.name,
                  value: a.value,
                }))
              : [{ name: "CHẤT LIỆU", value: "" }],
          variants:
            initialValues.variants && initialValues.variants.length > 0
              ? initialValues.variants.map((v) => ({
                  color: v.color,
                  image: v.image || "",
                  sku: v.sku || "",
                  isActive: v.isActive ?? true,
                  sizes: (v.sizes || []).map((s) => ({
                    size: s.size,
                    stock: s.stock,
                  })),
                }))
              : [
                  {
                    color: "Màu Tiêu Chuẩn",
                    image: "",
                    sku: "",
                    isActive: true,
                    sizes: [{ size: "FreeSize", stock: 10 }],
                  },
                ],
          seo: {
            metaTitle: initialValues.seo?.metaTitle || "",
            metaDescription: initialValues.seo?.metaDescription || "",
            metaKeywords: (initialValues.seo?.metaKeywords || []).join(", "),
          },
        });
      } else {
        // Create mode
        setGalleryImages([]);
        reset({
          name: "",
          sku: "",
          price: 0,
          original_price: undefined,
          category: categoryOptions[0]?.value || "",
          collections: [],
          weight: 300,
          description: "",
          thumbnail: "",
          size_chart: "",
          imagesText: "",
          isFeatured: false,
          isActive: true,
          attributes: [
            { name: "CHẤT LIỆU", value: "100% Cotton Compact" },
            { name: "FORM DÁNG", value: "Boxy Oversize" },
          ],
          variants: [
            {
              color: "Màu Đen (Black)",
              image: "",
              sku: "",
              isActive: true,
              sizes: [
                { size: "S", stock: 15 },
                { size: "M", stock: 25 },
                { size: "L", stock: 10 },
              ],
            },
          ],
          seo: {
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
          },
        });
      }
      setActiveTab("basic");
    }
  }, [open, initialValues, reset]);

  const onSubmit = (data: ProductFormValues) => {
    const imagesList =
      galleryImages.length > 0
        ? galleryImages
        : data.imagesText
        ? data.imagesText
            .split("\n")
            .map((img) => img.trim())
            .filter(Boolean)
        : [];

    const keywordsArray = data.seo?.metaKeywords
      ? data.seo.metaKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    const cleanedAttributes = (data.attributes || []).filter(
      (a) => a.name.trim() !== "" && a.value.trim() !== ""
    );

    const cleanedVariants = (data.variants || []).map((v) => ({
      color: v.color.trim(),
      image: v.image?.trim() || null,
      sku: v.sku?.trim() || undefined,
      isActive: v.isActive ?? true,
      sizes: (v.sizes || [])
        .filter((s) => s.size && s.size.trim() !== "")
        .map((s) => ({
          size: s.size.trim(),
          stock: Number(s.stock) || 0,
        })),
    }));

    if (initialValues) {
      // Cập nhật sản phẩm
      const payload: UpdateProductPayload = {
        name: data.name.trim(),
        sku: data.sku?.trim() || undefined,
        price: Number(data.price),
        original_price: data.original_price
          ? Number(data.original_price)
          : undefined,
        category: data.category,
        collections: data.collections,
        weight: Number(data.weight) || 300,
        description: data.description?.trim(),
        thumbnail: data.thumbnail?.trim() || null,
        size_chart: data.size_chart?.trim() || null,
        images: imagesList,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        attributes: cleanedAttributes,
        variants: cleanedVariants,
        seo: {
          metaTitle: data.seo?.metaTitle?.trim() || undefined,
          metaDescription: data.seo?.metaDescription?.trim() || undefined,
          metaKeywords: keywordsArray,
        },
      };

      updateProduct(
        { id: initialValues._id, payload },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        }
      );
    } else {
      // Tạo mới sản phẩm
      const payload: CreateProductPayload = {
        name: data.name.trim(),
        price: Number(data.price),
        original_price: data.original_price
          ? Number(data.original_price)
          : undefined,
        category: data.category,
        collections: data.collections,
        weight: Number(data.weight) || 300,
        description: data.description?.trim(),
        thumbnail: data.thumbnail?.trim() || null,
        size_chart: data.size_chart?.trim() || null,
        images: imagesList,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        attributes: cleanedAttributes,
        variants: cleanedVariants,
        seo: {
          metaTitle: data.seo?.metaTitle?.trim() || undefined,
          metaDescription: data.seo?.metaDescription?.trim() || undefined,
          metaKeywords: keywordsArray,
        },
      };

      createProduct(payload, {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={780}
      closeIcon={null}
      destroyOnClose
      maskClosable={!isSubmitting}
      className="font-mono text-zinc-900 [&_.ant-drawer-body]:!p-0 [&_.ant-drawer-content]:!bg-[#f4f3ef]"
      title={
        <div className="flex items-center justify-between px-5 py-3 border-b border-black bg-white">
          <div className="flex items-center gap-2 font-mono">
            <Shirt className="w-5 h-5 text-black" />
            <span className="font-bold text-sm tracking-wide uppercase text-zinc-900 font-sans">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-8 px-3 text-xs font-mono font-semibold border border-zinc-300 hover:bg-zinc-100 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>HỦY</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="h-8 px-4 text-xs font-mono font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{initialValues ? "LƯU THAY ĐỔI" : "TẠO SẢN PHẨM"}</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="bg-white border border-zinc-300 p-1 flex gap-1 font-mono text-xs">
          {[
            { id: "basic", label: "1. Thông tin & Giá", icon: Shirt },
            { id: "media", label: "2. Ảnh & Size Chart", icon: ImageIcon },
            { id: "variants", label: "3. Biến thể & Tồn kho", icon: Layers },
            { id: "attributes_seo", label: "4. Thuộc tính & SEO", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-2 flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-black text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: THÔNG TIN CƠ BẢN & GIÁ BÁN */}
        {activeTab === "basic" && (
          <div className="space-y-4">
            {/* Tên & SKU */}
            <div className="border border-zinc-300 bg-white p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-zinc-600" />
                NHẬN DIỆN SẢN PHẨM
              </h3>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                  TÊN SẢN PHẨM <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", {
                    required: "Tên sản phẩm không được để trống",
                    minLength: {
                      value: 2,
                      message: "Tên sản phẩm tối thiểu 2 ký tự",
                    },
                  })}
                  placeholder="VD: Áo khoác dù Amara Jacket chính hãng THE C.I.U"
                  className={`w-full h-9 px-3 border outline-none bg-white rounded-none font-sans text-xs ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-zinc-300 focus:border-black"
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 mt-1 font-mono">
                    {errors.name.message}
                  </p>
                )}
                {watchedName && (
                  <p className="text-[11px] text-zinc-400 font-mono mt-1">
                    Slug tự động: /{slugifyPreview(watchedName)}
                  </p>
                )}
              </div>

              {initialValues && (
                <div>
                  <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                    MÃ SKU CHÍNH
                  </label>
                  <input
                    {...register("sku")}
                    placeholder="VD: AKDAJ-9716"
                    className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono text-xs"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Nếu để trống, hệ thống sẽ tự động sinh SKU theo tên viết tắt.
                  </span>
                </div>
              )}

              {/* Danh mục & Bộ sưu tập */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                    DANH MỤC SẢN PHẨM <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="category"
                    rules={{ required: "Vui lòng chọn danh mục" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Chọn danh mục"
                        showSearch
                        filterOption={(input, option) =>
                          String(option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        className="w-full rounded-none h-9 [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-zinc-300"
                        options={categoryOptions}
                      />
                    )}
                  />
                  {errors.category && (
                    <p className="text-[11px] text-red-500 mt-1 font-mono">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                    BỘ SƯU TẬP (COLLECTION)
                  </label>
                  <Controller
                    control={control}
                    name="collections"
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        placeholder="Gán vào bộ sưu tập"
                        showSearch
                        filterOption={(input, option) =>
                          String(option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        className="w-full rounded-none min-h-[36px] [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!border-zinc-300"
                        options={collectionOptions}
                        allowClear
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Thiết lập Giá & Vận chuyển */}
            <div className="border border-zinc-300 bg-white p-4 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-zinc-600" />
                GIÁ BÁN & VẬN CHUYỂN
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                    GIÁ BÁN THỰC TẾ (₫) <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      required: "Giá bán là bắt buộc",
                      min: { value: 0, message: "Giá không được nhỏ hơn 0" },
                    }}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="VD: 450.000"
                        className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs font-bold"
                      />
                    )}
                  />
                  {errors.price && (
                    <p className="text-[11px] text-red-500 mt-1 font-mono">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                    GIÁ GỐC NIÊM YẾT (₫)
                  </label>
                  <Controller
                    name="original_price"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="VD: 550.000"
                        className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs text-zinc-500"
                      />
                    )}
                  />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Hiển thị gạch ngang giảm giá
                  </span>
                </div>

                <div>
                  <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                    TRỌNG LƯỢNG (GRAM)
                  </label>
                  <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <FormattedNumberInput
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs"
                      />
                    )}
                  />
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Dùng để tính cước vận chuyển
                  </span>
                </div>
              </div>

              {/* Công tắc Nổi bật & Hoạt động */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200">
                  <div>
                    <span className="text-xs font-sans font-bold block text-zinc-900 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      GHIM NỔI BẬT TRANG CHỦ
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Ưu tiên hiển thị tại trang chủ
                    </span>
                  </div>
                  <Controller
                    control={control}
                    name="isFeatured"
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onChange={onChange}
                        className="[&.ant-switch-checked]:!bg-black"
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200">
                  <div>
                    <span className="text-xs font-sans font-bold block text-zinc-900">
                      TRẠNG THÁI HIỂN THỊ
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Cho phép khách hàng xem & mua
                    </span>
                  </div>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value}
                        onChange={onChange}
                        className="[&.ant-switch-checked]:!bg-black"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="border border-zinc-300 bg-white p-4 space-y-2">
              <label className="block text-zinc-700 font-semibold text-xs font-sans">
                MÔ TẢ CHI TIẾT SẢN PHẨM
              </label>
              <textarea
                rows={4}
                {...register("description")}
                placeholder="Nhập thông tin câu chuyện sản phẩm, hướng dẫn giặt sấy, bảng size, chi tiết form dáng..."
                className="w-full p-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs resize-y"
              />
            </div>
          </div>
        )}

        {/* TAB 2: HÌNH ẢNH & THƯỚC ĐO KÍCH CỠ (DUAL MODE: MÁY & LINK) */}
        {activeTab === "media" && (
          <div className="space-y-4">
            {/* Ảnh Bìa (Thumbnail) */}
            <DualImageField
              label="ẢNH BÌA ĐẠI DIỆN (THUMBNAIL)"
              value={watch("thumbnail") || ""}
              onChange={(val) =>
                setValue("thumbnail", val, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              placeholder="https://example.com/images/product-thumb.jpg"
              description="Ảnh chính hiển thị ngoài danh sách sản phẩm, trang chủ và giỏ hàng"
            />

            {/* Bảng quy chuẩn kích cỡ (Size Chart) */}
            <DualImageField
              label="ẢNH BẢNG SIZE (SIZE CHART)"
              icon={<Info className="w-4 h-4 text-zinc-600" />}
              value={watch("size_chart") || ""}
              onChange={(val) =>
                setValue("size_chart", val, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              placeholder="https://example.com/images/size-chart.jpg"
              description="Bảng thông số kích cỡ (chiều cao, cân nặng, vai, ngực) để khách hàng chọn size"
            />

            {/* Danh sách ảnh chi tiết (Gallery) */}
            <GalleryDualImageField
              images={galleryImages}
              onChange={(imgs) => {
                setGalleryImages(imgs);
                setValue("imagesText", imgs.join("\n"), { shouldDirty: true });
              }}
            />
          </div>
        )}

        {/* TAB 3: BIẾN THỂ & TỒN KHO */}
        {activeTab === "variants" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white border border-zinc-300 p-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase text-zinc-900">
                  BIẾN THỂ MÀU SẮC & KÍCH THƯỚC KHO
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Quản lý từng màu và số lượng tồn kho của từng size
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  appendVariant({
                    color: `Màu mới #${variantFields.length + 1}`,
                    image: "",
                    sku: "",
                    isActive: true,
                    sizes: [
                      { size: "S", stock: 10 },
                      { size: "M", stock: 15 },
                    ],
                  })
                }
                className="h-8 px-3 text-xs font-mono font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                THÊM BIẾN THỂ MÀU
              </button>
            </div>

            {variantFields.map((variant, vIndex) => (
              <div
                key={variant.id}
                className="border border-black bg-white p-4 space-y-3 relative shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white">
                      #{String(vIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 uppercase">
                      Biến thể màu sắc
                    </span>
                  </div>

                  {variantFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIndex)}
                      className="text-red-600 hover:text-red-700 text-xs font-mono flex items-center gap-1 cursor-pointer"
                      title="Xóa biến thể màu này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa màu
                    </button>
                  )}
                </div>

                {/* Tên màu, Ảnh màu, SKU màu */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                      TÊN MÀU SẮC <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`variants.${vIndex}.color` as const, {
                        required: "Tên màu là bắt buộc",
                      })}
                      placeholder="VD: Xanh Mint, Đen Nhám..."
                      className="w-full h-8 px-2 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs"
                    />
                  </div>

                  <VariantDualImageField
                    value={watch(`variants.${vIndex}.image` as const) || ""}
                    onChange={(val) =>
                      setValue(`variants.${vIndex}.image` as const, val, {
                        shouldDirty: true,
                      })
                    }
                  />

                  <div>
                    <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                      MÃ SKU BIẾN THỂ
                    </label>
                    <input
                      {...register(`variants.${vIndex}.sku` as const)}
                      placeholder="VD: AKDAJ-9716-MNT"
                      className="w-full h-8 px-2 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Quản lý các Size của màu này */}
                <VariantSizesManager
                  vIndex={vIndex}
                  control={control}
                  register={register}
                />
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: THUỘC TÍNH & SEO */}
        {activeTab === "attributes_seo" && (
          <div className="space-y-4">
            {/* Thuộc tính thời trang (Attributes) */}
            <div className="border border-zinc-300 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-zinc-600" />
                    THUỘC TÍNH THỜI TRANG (ATTRIBUTES)
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Ví dụ: Chất liệu, Form dáng, Kiểu cổ áo, Xuất xứ...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => appendAttr({ name: "", value: "" })}
                  className="h-7 px-2.5 text-xs font-mono font-bold border border-zinc-300 hover:bg-zinc-100 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  THÊM THUỘC TÍNH
                </button>
              </div>

              <div className="space-y-2">
                {attrFields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      {...register(`attributes.${index}.name` as const)}
                      placeholder="Tên thuộc tính (VD: CHẤT LIỆU)"
                      className="flex-1 h-8 px-2.5 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-mono text-xs"
                    />
                    <input
                      {...register(`attributes.${index}.value` as const)}
                      placeholder="Giá trị (VD: Cotton Compact 260GSM)"
                      className="flex-1 h-8 px-2.5 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttr(index)}
                      className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 cursor-pointer"
                      title="Xóa dòng thuộc tính này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cấu hình SEO */}
            <div className="border border-zinc-300 bg-white p-4 space-y-3.5">
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
                <Globe className="w-4 h-4 text-zinc-600" />
                TỐI ƯU HÓA TÌM KIẾM (SEO)
              </h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-700 font-semibold text-xs font-sans">
                    TIÊU ĐỀ SEO (META TITLE)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      watchedMetaTitle.length > 70
                        ? "text-red-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {watchedMetaTitle.length}/70 ký tự
                  </span>
                </div>
                <input
                  {...register("seo.metaTitle")}
                  placeholder="VD: Áo khoác dù Amara Jacket chính hãng - The Luki Streetwear"
                  className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-700 font-semibold text-xs font-sans">
                    MÔ TẢ SEO (META DESCRIPTION)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      watchedMetaDesc.length > 160
                        ? "text-red-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {watchedMetaDesc.length}/160 ký tự
                  </span>
                </div>
                <textarea
                  rows={2}
                  {...register("seo.metaDescription")}
                  placeholder="Mô tả tóm tắt cho công cụ tìm kiếm Google..."
                  className="w-full p-2.5 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 mb-1 font-semibold text-xs font-sans">
                  TỪ KHÓA SEO (CÁCH NHAU BẰNG DẤU PHẨY)
                </label>
                <input
                  {...register("seo.metaKeywords")}
                  placeholder="ao khoac du, the luki, amara jacket, streetwear..."
                  className="w-full h-9 px-3 border border-zinc-300 focus:border-black outline-none bg-white rounded-none font-sans text-xs"
                />
              </div>

              {/* Google Preview Snippet */}
              <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1 font-mono">
                  Xem trước hiển thị tìm kiếm Google
                </span>
                <div className="space-y-0.5">
                  <div className="text-[11px] text-zinc-500 truncate font-mono">
                    https://theluki.vn/product/
                    {slugifyPreview(watchedName) || "ten-san-pham"}
                  </div>
                  <div className="text-sm font-semibold text-blue-700 truncate hover:underline cursor-pointer font-sans">
                    {watchedMetaTitle ||
                      watchedName ||
                      "Tên sản phẩm thời trang | The Luki Store"}
                  </div>
                  <div className="text-[11px] text-zinc-600 line-clamp-2 font-sans">
                    {watchedMetaDesc ||
                      "Khám phá sản phẩm thời trang phong cách Streetwear độc bản tại The Luki..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
};

export default CreateEditProduct;
