import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: [true, "Hình ảnh banner là bắt buộc"],
            trim: true
        },
        position: {
            type: String,
            enum: ["home_hero", "popup"],
            default: "home_hero"
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model("Banner", BannerSchema);
