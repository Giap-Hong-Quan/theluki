import mongoose from "mongoose";
import removeVietnameseTones from "../utils/removeVietnameseTones.js";
import slugifyModel from "../utils/slugifyModel.js";

const CollectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        noAccentName: { // Dùng cho tìm kiếm không dấu
            type: String,
            index: true
        },
        slug: { // Đường dẫn chuẩn SEO cho bộ sưu tập
            type: String,
            unique: true,
            lowercase: true
        },
        description: { // Mô tả ngắn / câu chuyện về bộ sưu tập
            type: String,
            trim: true,
            default: ""
        },
        banner_url: { // URL ảnh banner rộng ngang hiển thị ở đầu trang / landing page
            type: String,
            default: null
        },
        thumbnail_url: { // URL ảnh bìa đại diện card bộ sưu tập
            type: String,
            default: null
        },
        productCount: { // Số lượng sản phẩm trong bộ sưu tập (tính toán động qua aggregate)
            type: Number,
            default: 0
        },
        isFeatured: { // Đánh dấu bộ sưu tập nổi bật hiển thị ở Trang chủ
            type: Boolean,
            default: false
        },
        seo: { // Chuẩn SEO cho trang Bộ sưu tập
            metaTitle: { type: String, trim: true, maxlength: 70, default: "" },
            metaDescription: { type: String, trim: true, maxlength: 160, default: "" },
            metaKeywords: [{ type: String, trim: true }]
        },
        isActive: { // Trạng thái ẩn / hiện bộ sưu tập
            type: Boolean,
            default: true
        },
        deletedAt: { // Xóa mềm (Thùng rác)
            type: Date,
            default: null
        },
        createdBy: { // ID của Admin / Staff tạo bộ sưu tập này
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    { timestamps: true, versionKey: false }
);

// Middleware pre-save: Tự động tạo noAccentName và slug
CollectionSchema.pre("save", async function () {
    if (this.isModified("name")) {
        this.noAccentName = removeVietnameseTones(this.name);
        this.slug = slugifyModel(this.name);
    }
});

// Middleware pre-findOneAndUpdate: Tự động cập nhật noAccentName và slug
CollectionSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();
    if (!update) return;

    if (update.name || update.$set?.name) {
        const nameVal = update.name || update.$set.name;
        const noAccent = removeVietnameseTones(nameVal);
        const slugVal = slugifyModel(nameVal);

        if (update.$set) {
            update.$set.noAccentName = noAccent;
            update.$set.slug = slugVal;
        } else {
            update.noAccentName = noAccent;
            update.slug = slugVal;
        }
    }
});

export default mongoose.model("Collection", CollectionSchema);