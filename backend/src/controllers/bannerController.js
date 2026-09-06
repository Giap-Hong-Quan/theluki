import Banner from "../models/Banner.js";
import ApiError from "../exceptions/ApiError.js";
import { success } from "../utils/success.js";

// Tạo mới banner (Admin / Staff)
export const createBannerController = async (req, res, next) => {
    try {
        const { image, custom_image, position = "home_hero", isActive = true } = req.body;
        const finalImage = (image || custom_image || "").trim();

        if (!finalImage) {
            throw new ApiError(400, "Hình ảnh banner là bắt buộc");
        }

        const targetPosition = position === "popup" ? "popup" : "home_hero";
        const isItemActive = typeof isActive === "boolean" ? isActive : true;

        // Nếu banner mới được kích hoạt -> tắt toàn bộ banner cùng vị trí đang active
        if (isItemActive) {
            await Banner.updateMany(
                { position: targetPosition, isActive: true },
                { $set: { isActive: false } }
            );
        }

        const newBanner = await Banner.create({
            image: finalImage,
            position: targetPosition,
            isActive: isItemActive,
            createdBy: req.user?._id || req.user?.id || null
        });

        return success(res, newBanner, "Tạo banner thành công", 201);
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách toàn bộ banner (Public & Admin, không phân trang)
export const getAllBannersController = async (req, res, next) => {
    try {
        const { position, isActive } = req.query;

        const query = {};

        if (position && position.trim() !== "") {
            query.position = position.trim();
        }

        if (typeof isActive === "boolean") {
            query.isActive = isActive;
        }

        const [banners, totalBanner, totalHomeHero, totalPopup] = await Promise.all([
            Banner.find(query).sort({ createdAt: -1 }).lean(),
            Banner.countDocuments(),
            Banner.countDocuments({ position: "home_hero" }),
            Banner.countDocuments({ position: "popup" })
        ]);

        const result = {
            banners,
            totalBanner,
            totalHomeHero,
            totalPopup
        };

        return success(res, result, "Lấy danh sách banner thành công", 200);
    } catch (error) {
        next(error);
    }
};

// Lấy banner đang active cho Client (1 home_hero, 1 popup)
export const getActiveBannersController = async (req, res, next) => {
    try {
        const [homeHero, popup] = await Promise.all([
            Banner.findOne({ position: "home_hero", isActive: true }).lean(),
            Banner.findOne({ position: "popup", isActive: true }).lean()
        ]);

        return success(
            res,
            {
                home_hero: homeHero || null,
                popup: popup || null
            },
            "Lấy danh sách banner active thành công",
            200
        );
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết banner theo ID
export const getBannerByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id).lean();
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
        const { image, custom_image, position, isActive } = req.body;

        const existBanner = await Banner.findById(id);
        if (!existBanner) {
            throw new ApiError(404, "Không tìm thấy banner");
        }

        const targetPosition = position || existBanner.position;
        const willBeActive = typeof isActive === "boolean" ? isActive : existBanner.isActive;

        // Nếu banner này sẽ active (isActive: true) -> tắt tất cả các banner khác cùng vị trí
        if (willBeActive) {
            await Banner.updateMany(
                { _id: { $ne: id }, position: targetPosition, isActive: true },
                { $set: { isActive: false } }
            );
        }

        const updateData = {};
        const finalImage = (image || custom_image || "").trim();
        if (finalImage) updateData.image = finalImage;
        if (position) updateData.position = position;
        if (typeof isActive === "boolean") updateData.isActive = isActive;

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

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

        const newActiveState = !existBanner.isActive;

        // Nếu bật lên (newActiveState === true) -> tắt tất cả các banner khác cùng position
        if (newActiveState) {
            await Banner.updateMany(
                { _id: { $ne: id }, position: existBanner.position, isActive: true },
                { $set: { isActive: false } }
            );
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { $set: { isActive: newActiveState } },
            { new: true }
        );

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
