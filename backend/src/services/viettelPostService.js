import axios from "axios";
import ApiError from "../exceptions/ApiError.js";

let cachedToken = null;

/**
 * Lấy token ViettelPost (Tự động đăng nhập bằng tài khoản trong .env nếu chưa có hoặc hết hạn)
 */
export const getVTPToken = async (forceRefresh = false) => {
    if (cachedToken && !forceRefresh) {
        return cachedToken;
    }

    const loginUrl = "https://partnerdev.viettelpost.vn/v2/user/Login";
    const username = process.env.VIETTELPOST_USERNAME;
    const password = process.env.VIETTELPOST_PASSWORD;

    if (!username || !password) {
        // Fallback sang token cứng trong .env nếu không có username/password
        return process.env.TOKEN_VTP || process.env.VIETTELPOST_TOKEN || "";
    }

    try {
        console.log("[ViettelPost] Đang đăng nhập lấy token mới...");
        const res = await axios.post(loginUrl, {
            USERNAME: username,
            PASSWORD: password,
        });

        if (res.data?.status === 200 && res.data?.data?.token) {
            cachedToken = res.data.data.token;
            console.log("[ViettelPost] Đăng nhập lấy token thành công!");
            return cachedToken;
        } else {
            console.error("[ViettelPost] Đăng nhập thất bại:", res.data);
            throw new Error(res.data?.message || "Đăng nhập ViettelPost thất bại");
        }
    } catch (error) {
        console.error("[ViettelPost] Lỗi đăng nhập:", error.response?.data || error.message);
        // Nếu lỗi login thì thử dùng token trong .env làm fallback
        return process.env.TOKEN_VTP || process.env.VIETTELPOST_TOKEN || "";
    }
};

/**
 * Tạo đơn hàng ViettelPost (Tự động refresh token nếu Token invalid)
 */
export const createOrderVTP = async (order, retryCount = 0) => {
    const API_URL = "https://partnerdev.viettelpost.vn/v2/order/createOrderNlp";
    const token = await getVTPToken();

    try {
        const res = await axios.post(API_URL, order, {
            headers: {
                Token: token,
                "Content-Type": "application/json",
            },
        });

        // Nếu token hết hạn hoặc invalid, tự động refresh token và thử lại 1 lần
        if (
            (res.data?.status === 201 || res.data?.status === 202) &&
            res.data?.message?.toLowerCase()?.includes("token") &&
            retryCount < 1
        ) {
            console.warn("[ViettelPost] Token đã hết hạn, tự động làm mới và thử lại...");
            await getVTPToken(true); // Ép refresh token mới
            return await createOrderVTP(order, retryCount + 1);
        }

        if (res.data.status === 200) {
            return res.data.data;
        } else {
            console.error("Lỗi từ ViettelPost:", res.data);
            throw new ApiError(400, res.data.message || "Tạo đơn hàng ViettelPost thất bại");
        }
    } catch (error) {
        // Nếu lỗi 401 hoặc token invalid ở tầng HTTP catch
        if (
            error.response?.data?.message?.toLowerCase()?.includes("token") &&
            retryCount < 1
        ) {
            console.warn("[ViettelPost] Bắt được lỗi token trong catch, tự động làm mới...");
            await getVTPToken(true);
            return await createOrderVTP(order, retryCount + 1);
        }

        console.error("Lỗi kết nối ViettelPost:", error.response?.data || error.message);
        throw new ApiError(
            error.statusCode || 400,
            error.response?.data?.message || error.message || "Lỗi tạo đơn ViettelPost"
        );
    }
};
