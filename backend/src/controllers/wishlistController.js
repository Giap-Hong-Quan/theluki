import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import ApiError from "../exceptions/ApiError.js";
import { success } from "../utils/success.js";

// 1. Lấy danh sách sản phẩm yêu thích của người dùng đang đăng nhập
export const getWishlistController = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            throw new ApiError(401, "Bạn chưa đăng nhập");
        }

        const user = await User.findById(userId)
            .select("wishlist")
            .populate({
                path: "wishlist",
                match: { deletedAt: null },
                select: "name slug price original_price thumbnail images category stock isActive",
                populate: {
                    path: "category",
                    select: "name slug image"
                }
            })
            .lean();

        if (!user) {
            throw new ApiError(404, "Không tìm thấy thông tin người dùng");
        }

        return success(res, user.wishlist || [], "Lấy danh sách sản phẩm yêu thích thành công", 200);
    } catch (error) {
        next(error);
    }
};

// 2. Thêm / Xóa nhanh sản phẩm khỏi danh sách yêu thích (Toggle Like / Unlike)
export const toggleWishlistController = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { productId } = req.params;

        if (!userId) {
            throw new ApiError(401, "Bạn chưa đăng nhập");
        }

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new ApiError(400, "ID sản phẩm không đúng định dạng ObjectId");
        }

        // Kiểm tra sản phẩm có tồn tại và chưa bị xóa không
        const existProduct = await Product.findById(productId);
        if (!existProduct || existProduct.deletedAt !== null) {
            throw new ApiError(404, "Sản phẩm không tồn tại hoặc đã bị xóa");
        }

        const user = await User.findById(userId).select("wishlist");
        if (!user) {
            throw new ApiError(404, "Không tìm thấy thông tin người dùng");
        }

        const isExist = user.wishlist.some((id) => id.toString() === productId);
        let updatedUser;
        let isFavorite = false;
        let message = "";

        if (isExist) {
            // Đã có trong danh sách -> Xóa ra (Unlike)
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $pull: { wishlist: productId } },
                { new: true }
            ).select("wishlist");
            isFavorite = false;
            message = "Đã xóa sản phẩm khỏi danh sách yêu thích";
        } else {
            // Chưa có trong danh sách -> Thêm vào (Like)
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { wishlist: productId } },
                { new: true }
            ).select("wishlist");
            isFavorite = true;
            message = "Đã thêm sản phẩm vào danh sách yêu thích";
        }

        return success(
            res,
            {
                isFavorite,
                productId,
                totalWishlist: updatedUser.wishlist.length
            },
            message,
            200
        );
    } catch (error) {
        next(error);
    }
};

// 3. Xóa 1 sản phẩm cụ thể khỏi danh sách yêu thích
export const removeWishlistItemController = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const { productId } = req.params;

        if (!userId) {
            throw new ApiError(401, "Bạn chưa đăng nhập");
        }

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            throw new ApiError(400, "ID sản phẩm không đúng định dạng ObjectId");
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { wishlist: productId } },
            { new: true }
        ).select("wishlist");

        return success(
            res,
            { totalWishlist: updatedUser ? updatedUser.wishlist.length : 0 },
            "Đã xóa sản phẩm khỏi danh sách yêu thích",
            200
        );
    } catch (error) {
        next(error);
    }
};

// 4. Xóa toàn bộ sản phẩm trong danh sách yêu thích
export const clearWishlistController = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            throw new ApiError(401, "Bạn chưa đăng nhập");
        }

        await User.findByIdAndUpdate(userId, { $set: { wishlist: [] } });

        return success(res, { totalWishlist: 0 }, "Đã xóa toàn bộ danh sách yêu thích", 200);
    } catch (error) {
        next(error);
    }
};
