import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

export const createBannerZod = z.object({
    body: z.object({
        image: z
            .string({ required_error: "Hình ảnh banner là bắt buộc" })
            .trim()
            .min(1, "Hình ảnh banner không được để trống"),
        position: z.enum(["home_hero", "popup"]).optional().default("home_hero"),
        isActive: z.boolean().optional().default(true)
    })
});

export const updateBannerZod = z.object({
    params: z.object({
        id: z.string().refine(isValidObjectId, { message: "ID banner không đúng định dạng ObjectId" })
    }),
    body: z.object({
        image: z.string().trim().min(1, "Hình ảnh banner không được để trống").optional(),
        position: z.enum(["home_hero", "popup"]).optional(),
        isActive: z.boolean().optional()
    })
});

const parseBooleanQuery = z.enum(["true", "false"]).transform((val) => val === "true").optional();

export const getBannersQueryZod = z.object({
    query: z.object({
        position: z.enum(["home_hero", "popup"]).optional(),
        isActive: parseBooleanQuery
    })
});

export const bannerIdParamZod = z.object({
    params: z.object({
        id: z.string().refine(isValidObjectId, { message: "ID banner không đúng định dạng ObjectId" })
    })
});
