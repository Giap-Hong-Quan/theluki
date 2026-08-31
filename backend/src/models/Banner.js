import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        subtitle: {
            type: String,
            trim: true,
            default: ""
        },
        collection_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection",
            required: true
        },
        custom_image: {
            type: String,
            default: null // Nếu null sẽ tự lấy banner_url / thumbnail_url từ Collection
        },
        position: {
            type: String,
            enum: ["home_hero", "home_sub", "popup"],
            default: "home_hero"
        },
        order: {
            type: Number,
            default: 0
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
