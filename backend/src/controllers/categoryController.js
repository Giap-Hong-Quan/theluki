import mongoose from "mongoose";
import { success } from "../utils/success.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../exceptions/ApiError.js";
import removeVietnameseTones from "../utils/removeVietnameseTones.js";

// 1. Tạo mới danh mục
export const createCategoryController = async (req, res, next) => {
    try {
        const { name } = req.body;
        const existCategory = await Category.findOne({ name });
        if (existCategory) {
            throw new ApiError(409, "Danh mục đã tồn tại");
        }
        const category = await Category.create(req.body);
        success(res, category, "Tạo danh mục thành công", 201);
    } catch (error) {
        next(error);
    }
};

// 2. Cập nhật thông tin danh mục
export const updateCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Id danh mục không đúng định dạng");
        }

        const existCategory = await Category.findById(id);
        if (!existCategory) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        const { name } = req.body;
        if (name && name !== existCategory.name) {
            const nameConflict = await Category.findOne({ name, _id: { $ne: id } });
            if (nameConflict) {
                throw new ApiError(409, "Tên danh mục đã tồn tại");
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        success(res, updatedCategory, "Cập nhật danh mục thành công", 200);
    } catch (error) {
        next(error);
    }
};

// 4. Lấy chi tiết danh mục theo ID (Admin)
export const getCategoryByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Id danh mục không đúng định dạng");
        }

        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        success(res, category, `Lấy chi tiết danh mục: ${category.name}`, 200);
    } catch (error) {
        next(error);
    }
};

// 5. Lấy chi tiết danh mục theo slug (Client / SEO)
export const getCategoryBySlugController = async (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!slug || typeof slug !== "string") {
            throw new ApiError(400, "Slug danh mục không hợp lệ");
        }

        const category = await Category.findOne({ slug, deletedAt: null });
        if (!category) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        success(res, category, `Lấy chi tiết danh mục: ${category.name}`, 200);
    } catch (error) {
        next(error);
    }
};

// 6. Bật / Tắt trạng thái danh mục (Admin)
export const activeCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Id danh mục không đúng định dạng");
        }

        const existCategory = await Category.findById(id);
        if (!existCategory) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        if (existCategory.deletedAt !== null) {
            throw new ApiError(409, "Không thể cập nhật trạng thái của danh mục đã bị xóa");
        }

        const active = await Category.findByIdAndUpdate(
            id,
            { isActive: !existCategory.isActive },
            { new: true }
        );

        success(res, active, "Cập nhật trạng thái danh mục thành công", 200);
    } catch (error) {
        next(error);
    }
};

// 7. Xóa danh mục (Soft Delete)
export const deleteCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Id danh mục không đúng định dạng");
        }

        const existCategory = await Category.findById(id);
        if (!existCategory) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        if (existCategory.deletedAt !== null) {
            throw new ApiError(409, "Danh mục đã được xóa từ trước");
        }

        const deleteCategory = await Category.findByIdAndUpdate(
            id,
            { isActive: false, deletedAt: new Date() },
            { new: true }
        );

        success(res, deleteCategory, "Xóa danh mục thành công", 200);
    } catch (error) {
        next(error);
    }
};

// 8. Khôi phục danh mục đã xóa
export const restoreCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Id danh mục không đúng định dạng");
        }

        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        if (!category.deletedAt) {
            throw new ApiError(409, "Danh mục này chưa bị xóa");
        }

        const restoreCategory = await Category.findByIdAndUpdate(
            id,
            { deletedAt: null, isActive: true },
            { new: true }
        );

        success(res, restoreCategory, "Khôi phục danh mục thành công", 200);
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách toàn bộ danh mục (Tìm kiếm + Lọc mở rộng: isDeleted, isActive - Không phân trang)
export const getAllCategoryController = async (req, res, next) => {
    try {
        const { search, isDeleted, isActive } = req.query;
        const query = {};
        if (isDeleted === true || isDeleted === "true") {
            query.deletedAt = { $ne: null };
        } else {
            query.deletedAt = null;
        }
        if (isActive === true || isActive === "true") {
            query.isActive = true;
        } else if (isActive === false || isActive === "false") {
            query.isActive = false;
        }
        if (search && search.trim() !== "") {
            const searchTrim = search.trim();
            const cleanSearch = removeVietnameseTones(searchTrim);
            query.$or = [
                { name: { $regex: searchTrim, $options: "i" } },
                { noAccentName: { $regex: cleanSearch, $options: "i" } }
            ];
        }
        const [categories, totalCategory, totalActive, totalInactive] = await Promise.all([
            Category.find(query)
                .sort({ createdAt: -1 })
                .lean(),
            Category.countDocuments(query),
            query.isActive === false ? 0 : Category.countDocuments({ ...query, isActive: true }),
            query.isActive === true ? 0 : Category.countDocuments({ ...query, isActive: false })
        ]);

        // Đếm số lượng sản phẩm chuẩn thời gian thực qua MongoDB Aggregate
        const categoryIds = categories.map((c) => c._id);
        const productCounts = categoryIds.length > 0
            ? await Product.aggregate([
                  {
                      $match: {
                          category: { $in: categoryIds },
                          deletedAt: null
                      }
                  },
                  {
                      $group: {
                          _id: "$category",
                          count: { $sum: 1 }
                      }
                  }
              ])
            : [];

        const countMap = new Map(productCounts.map((item) => [item._id.toString(), item.count]));

        const categoriesWithCount = categories.map((cat) => ({
            ...cat,
            productCount: countMap.get(cat._id.toString()) || 0
        }));

        const result = {
            categories: categoriesWithCount,
            totalCategory,
            totalActive,
            totalInactive
        };
        success(res, result, "Lấy danh sách danh mục thành công", 200);
    } catch (error) {
        next(error);
    }
};

// 10. Xóa vĩnh viễn danh mục (Hard Delete / Force Delete)
export const forceDeleteCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Id danh mục không đúng định dạng");
        }

        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, "Danh mục không tồn tại");
        }

        await Category.findByIdAndDelete(id);

        success(res, null, "Xóa vĩnh viễn danh mục thành công", 200);
    } catch (error) {
        next(error);
    }
};