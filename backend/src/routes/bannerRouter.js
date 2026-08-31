import express from "express";
import {
    createBannerController,
    getAllBannersController,
    getBannerByIdController,
    updateBannerController,
    toggleActiveBannerController,
    deleteBannerController,
    reorderBannersController
} from "../controllers/bannerController.js";
import { validate } from "../middlewares/validate.js";
import {
    createBannerZod,
    updateBannerZod,
    getBannersQueryZod,
    bannerIdParamZod
} from "../validators/bannerZod.js";
import { verifyToken, authorizeRoles } from "../middlewares/authMiddleware.js";

const bannerRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Banner
 *   description: API Quản lý Banner chiến dịch liên kết Bộ sưu tập (Lookbook Hero Banner)
 */

/**
 * @swagger
 * /banner:
 *   get:
 *     summary: Lấy danh sách banner (Public & Admin)
 *     tags: [Banner]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang hiện tại
 *       - in: query
 *         name: sizePage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng banner mỗi trang (0 để lấy toàn bộ)
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [home_hero, home_sub, popup]
 *         description: Vị trí hiển thị của banner
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái hiển thị (true/false)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề banner
 *     responses:
 *       200:
 *         description: Lấy danh sách banner thành công
 *       500:
 *         description: Lỗi máy chủ
 */
bannerRouter.get("/", validate(getBannersQueryZod), getAllBannersController);

/**
 * @swagger
 * /banner/reorder:
 *   put:
 *     summary: Sắp xếp lại thứ tự banner (Admin / Staff)
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67a8aecbf19fc340b0062caf"
 *                     order:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       200:
 *         description: Cập nhật thứ tự banner thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 */
bannerRouter.put(
    "/reorder",
    verifyToken,
    authorizeRoles("admin", "staff"),
    reorderBannersController
);

/**
 * @swagger
 * /banner/{id}:
 *   get:
 *     summary: Lấy chi tiết banner theo ID
 *     tags: [Banner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     responses:
 *       200:
 *         description: Lấy chi tiết banner thành công
 *       404:
 *         description: Không tìm thấy banner
 */
bannerRouter.get("/:id", validate(bannerIdParamZod), getBannerByIdController);

/**
 * @swagger
 * /banner:
 *   post:
 *     summary: Tạo mới banner liên kết với Bộ sưu tập (Admin / Staff)
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - collection_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: "GROWING LOOKBOOK 2026"
 *               subtitle:
 *                 type: string
 *                 example: "Phong cách tối giản thanh lịch đương đại"
 *               collection_id:
 *                 type: string
 *                 example: "6a8c269aaa51edb3e0597db2"
 *                 description: ID của Bộ sưu tập được liên kết
 *               custom_image:
 *                 type: string
 *                 example: "https://example.com/banner.jpg"
 *                 description: URL ảnh riêng (nếu null sẽ lấy banner_url của Collection)
 *               position:
 *                 type: string
 *                 enum: [home_hero, home_sub, popup]
 *                 default: "home_hero"
 *               order:
 *                 type: integer
 *                 default: 0
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Tạo banner thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Bộ sưu tập không tồn tại
 *       401:
 *         description: Chưa đăng nhập
 */
bannerRouter.post(
    "/",
    validate(createBannerZod),
    verifyToken,
    authorizeRoles("admin", "staff"),
    createBannerController
);

/**
 * @swagger
 * /banner/{id}:
 *   put:
 *     summary: Cập nhật thông tin banner (Admin / Staff)
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               collection_id:
 *                 type: string
 *               custom_image:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [home_hero, home_sub, popup]
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật banner thành công
 *       404:
 *         description: Không tìm thấy banner hoặc bộ sưu tập
 *       401:
 *         description: Chưa đăng nhập
 */
bannerRouter.put(
    "/:id",
    validate(updateBannerZod),
    verifyToken,
    authorizeRoles("admin", "staff"),
    updateBannerController
);

/**
 * @swagger
 * /banner/{id}/status:
 *   patch:
 *     summary: Bật / Tắt trạng thái hiển thị banner (Admin / Staff)
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái hiển thị thành công
 *       404:
 *         description: Không tìm thấy banner
 *       401:
 *         description: Chưa đăng nhập
 */
bannerRouter.patch(
    "/:id/status",
    validate(bannerIdParamZod),
    verifyToken,
    authorizeRoles("admin", "staff"),
    toggleActiveBannerController
);

/**
 * @swagger
 * /banner/{id}:
 *   delete:
 *     summary: Xóa banner vĩnh viễn (Admin)
 *     tags: [Banner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của banner
 *     responses:
 *       200:
 *         description: Xóa banner thành công
 *       404:
 *         description: Không tìm thấy banner
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập
 */
bannerRouter.delete(
    "/:id",
    validate(bannerIdParamZod),
    verifyToken,
    authorizeRoles("admin"),
    deleteBannerController
);

export default bannerRouter;
