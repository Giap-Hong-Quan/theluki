import express from "express";
import {
    createBannerController,
    getAllBannersController,
    getActiveBannersController,
    getBannerByIdController,
    updateBannerController,
    toggleActiveBannerController,
    deleteBannerController
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
 *   description: API Quản lý Banner tối giản (ảnh, loại/vị trí, trạng thái kích hoạt)
 */

/**
 * @swagger
 * /banner:
 *   get:
 *     summary: Lấy danh sách toàn bộ banner (Public & Admin, không phân trang)
 *     tags: [Banner]
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [home_hero, popup]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lấy danh sách banner thành công
 */
bannerRouter.get("/", validate(getBannersQueryZod), getAllBannersController);

/**
 * @swagger
 * /banner/active:
 *   get:
 *     summary: Lấy banner đang active cho Client (1 banner home_hero, 1 banner popup)
 *     tags: [Banner]
 *     responses:
 *       200:
 *         description: Lấy banner active thành công
 */
bannerRouter.get("/active", getActiveBannersController);

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
 *     summary: Tạo mới banner (Admin / Staff)
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
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 example: "https://res.cloudinary.com/.../banner.jpg"
 *               position:
 *                 type: string
 *                 enum: [home_hero, popup]
 *                 default: "home_hero"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Tạo banner thành công
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [home_hero, popup]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật banner thành công
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
 * /banner/{id}/toggle-active:
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
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
bannerRouter.patch(
    "/:id/toggle-active",
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
 *     responses:
 *       200:
 *         description: Xóa banner thành công
 */
bannerRouter.delete(
    "/:id",
    validate(bannerIdParamZod),
    verifyToken,
    authorizeRoles("admin"),
    deleteBannerController
);

export default bannerRouter;
