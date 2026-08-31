import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

export const createBannerZod = z.object({
    body: z.object({
        title: z
            .string({ required_error: "Tiêu đề banner là bắt buộc" })
            .trim()
            .min(1, "Tiêu đề banner không được để trống"),
        subtitle: z.string().trim().optional(),
        collection_id: z
            .string({ required_error: "ID bộ sưu tập là bắt buộc" })
            .refine(isValidObjectId, { message: "ID bộ sưu tập không đúng định dạng ObjectId" }),
        custom_image: z.string().trim().optional().nullable(),
        position: z.enum(["home_hero", "home_sub", "popup"]).optional().default("home_hero"),
        order: z.number().int().min(0).optional().default(0),
        isActive: z.boolean().optional().default(true)
    })
});

export const updateBannerZod = z.object({
    params: z.object({
        id: z.string().refine(isValidObjectId, { message: "ID banner không đúng định dạng ObjectId" })
    }),
    body: z.object({
        title: z.string().trim().min(1, "Tiêu đề banner không được để trống").optional(),
        subtitle: z.string().trim().optional(),
        collection_id: z
            .string()
            .refine(isValidObjectId, { message: "ID bộ sưu tập không đúng định dạng ObjectId" })
            .optional(),
        custom_image: z.string().trim().optional().nullable(),
        position: z.enum(["home_hero", "home_sub", "popup"]).optional(),
        order: z.number().int().min(0).optional(),
        isActive: z.boolean().optional()
    })
});

const parseBooleanQuery = z.enum(["true", "false"]).transform((val) => val === "true").optional();

export const getBannersQueryZod = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        sizePage: z.coerce.number().int().min(0).max(100).default(10),
        position: z.enum(["home_hero", "home_sub", "popup"]).optional(),
        isActive: parseBooleanQuery,
        search: z.string().trim().optional()
    })
});

export const bannerIdParamZod = z.object({
    params: z.object({
        id: z.string().refine(isValidObjectId, { message: "ID banner không đúng định dạng ObjectId" })
    })
});
