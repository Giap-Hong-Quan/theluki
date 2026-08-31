import express from "express";
import {
    getWishlistController,
    toggleWishlistController,
    removeWishlistItemController,
    clearWishlistController
} from "../controllers/wishlistController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const wishlistRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: API Quản lý danh sách sản phẩm yêu thích của người dùng
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Lấy danh sách toàn bộ sản phẩm yêu thích của người dùng đang đăng nhập
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm yêu thích thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy thông tin người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
wishlistRouter.get("/", verifyToken, getWishlistController);

/**
 * @swagger
 * /wishlist/toggle/{productId}:
 *   post:
 *     summary: Thêm hoặc Xóa sản phẩm khỏi danh sách yêu thích (Toggle Like/Unlike)
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm cần like/unlike
 *     responses:
 *       200:
 *         description: Cập nhật yêu thích thành công (trả về isFavorite và totalWishlist)
 *       400:
 *         description: ID sản phẩm không đúng định dạng ObjectId
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Sản phẩm không tồn tại hoặc đã bị xóa
 */
wishlistRouter.post("/toggle/:productId", verifyToken, toggleWishlistController);

/**
 * @swagger
 * /wishlist/{productId}:
 *   delete:
 *     summary: Xóa 1 sản phẩm cụ thể ra khỏi danh sách yêu thích
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm cần xóa khỏi wishlist
 *     responses:
 *       200:
 *         description: Xóa sản phẩm khỏi danh sách yêu thích thành công
 *       400:
 *         description: ID sản phẩm không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 */
wishlistRouter.delete("/:productId", verifyToken, removeWishlistItemController);

/**
 * @swagger
 * /wishlist:
 *   delete:
 *     summary: Xóa toàn bộ sản phẩm trong danh sách yêu thích
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa toàn bộ danh sách yêu thích thành công
 *       401:
 *         description: Chưa đăng nhập
 */
wishlistRouter.delete("/", verifyToken, clearWishlistController);

export default wishlistRouter;
