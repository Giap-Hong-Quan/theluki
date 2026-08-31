import mongoose from "mongoose";
import Banner from "../models/Banner.js";
import Collection from "../models/Collection.js";
import ApiError from "../exceptions/ApiError.js";
import { success } from "../utils/success.js";

// Tạo mới banner (Admin / Staff)
export const createBannerController = async (req, res, next) => {
    try {
        const { title, subtitle, collection_id, custom_image, position, order, isActive } = req.body;

        // 1. Kiểm tra tồn tại Bộ sưu tập
        const existCollection = await Collection.findById(collection_id);
        if (!existCollection || existCollection.deletedAt !== null) {
            throw new ApiError(404, "Bộ sưu tập được chọn không tồn tại hoặc đã bị xóa");
        }

        // 2. Tạo mới banner
        const newBanner = await Banner.create({
            title: title.trim(),
            subtitle: subtitle ? subtitle.trim() : "",
            collection_id,
            custom_image: custom_image || null,
            position: position || "home_hero",
            order: typeof order === "number" ? order : 0,
            isActive: typeof isActive === "boolean" ? isActive : true,
            createdBy: req.user?._id || req.user?.id || null
        });

        const populatedBanner = await Banner.findById(newBanner._id).populate(
            "collection_id",
            "name slug banner_url thumbnail_url description"
        );

        return success(res, populatedBanner, "Tạo banner thành công", 201);
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách banner (Public & Admin)
export const getAllBannersController = async (req, res, next) => {
    try {
        const { page = 1, sizePage = 10, position, isActive, search } = req.query;

        const query = {};

        if (position && position.trim() !== "") {
            query.position = position.trim();
        }

        if (typeof isActive === "boolean") {
            query.isActive = isActive;
        }

        if (search && search.trim() !== "") {
            query.title = { $regex: search.trim(), $options: "i" };
        }

        const limit = Number(sizePage);
        const skip = limit > 0 ? (Number(page) - 1) * limit : 0;

        const [banners, count] = await Promise.all([
            Banner.find(query)
                .populate("collection_id", "name slug banner_url thumbnail_url description")
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Banner.countDocuments(query)
        ]);

        const result = {
            banners,
            totalBanner: count,
            totalPage: limit > 0 ? Math.ceil(count / limit) : 1,
            currentPage: Number(page),
            sizePage: limit
        };

        return success(res, result, "Lấy danh sách banner thành công", 200);
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết banner theo ID
export const getBannerByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id).populate(
            "collection_id",
            "name slug banner_url thumbnail_url description"
        );

        if (!banner) {
            throw new ApiError(404, "Không tìm thấy banner");
        }

        return success(res, banner, "Lấy chi tiết banner thành công", 200);
    } catch (error) {
        next(error);
    }
};

// Cập nhật thông tin banner (Admin / Staff)
export const updateBannerController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, subtitle, collection_id, custom_image, position, order, isActive } = req.body;

        const existBanner = await Banner.findById(id);
        if (!existBanner) {
            throw new ApiError(404, "Không tìm thấy banner");
        }

        // Nếu đổi sang Bộ sưu tập khác -> kiểm tra tồn tại
        if (collection_id && collection_id !== existBanner.collection_id.toString()) {
            const existCollection = await Collection.findById(collection_id);
            if (!existCollection || existCollection.deletedAt !== null) {
                throw new ApiError(404, "Bộ sưu tập mới không tồn tại hoặc đã bị xóa");
            }
        }

        const updateData = { ...req.body };
        if (title) updateData.title = title.trim();
        if (subtitle !== undefined) updateData.subtitle = subtitle.trim();

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("collection_id", "name slug banner_url thumbnail_url description");

        return success(res, updatedBanner, "Cập nhật banner thành công", 200);
    } catch (error) {
        next(error);
    }
};

// Bật / Tắt trạng thái hiển thị banner (Admin / Staff)
export const toggleActiveBannerController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existBanner = await Banner.findById(id);
        if (!existBanner) {
            throw new ApiError(404, "Không tìm thấy banner");
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { isActive: !existBanner.isActive },
            { new: true }
        ).populate("collection_id", "name slug banner_url thumbnail_url description");

        return success(
            res,
            updatedBanner,
            `Banner đã được ${updatedBanner.isActive ? "bật hiển thị" : "tắt ẩn"} thành công`,
            200
        );
    } catch (error) {
        next(error);
    }
};

// Xóa banner (Admin)
export const deleteBannerController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existBanner = await Banner.findById(id);
        if (!existBanner) {
            throw new ApiError(404, "Không tìm thấy banner");
        }

        await Banner.findByIdAndDelete(id);

        return success(res, null, "Xóa banner thành công", 200);
    } catch (error) {
        next(error);
    }
};

// Cập nhật thứ tự hiển thị banner (Admin / Staff)
export const reorderBannersController = async (req, res, next) => {
    try {
        const { items } = req.body; // Mảng [{ id: "...", order: 1 }, ...]

        if (!Array.isArray(items) || items.length === 0) {
            throw new ApiError(400, "Danh sách sắp xếp không hợp lệ");
        }

        const bulkOps = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { $set: { order: item.order } }
            }
        }));

        await Banner.bulkWrite(bulkOps);

        return success(res, null, "Cập nhật thứ tự banner thành công", 200);
    } catch (error) {
        next(error);
    }
};
