import axios from "axios";
import ApiError from "../exceptions/ApiError.js";

// Tạo đơn hàng viettel post 
export const createOrderVTP = async (order) => {
    const API_URL = "https://partnerdev.viettelpost.vn/v2/order/createOrderNlp";
    const TOKEN = process.env.TOKEN_VTP || process.env.VIETTELPOST_TOKEN || "";
    try {
        const res = await axios.post(API_URL, order, {
            headers: {
                Token: TOKEN,
                "Content-Type": "application/json",
            },
        });
        if (res.data.status == 200) {
            return res.data.data;
        } else {
            console.error("Lỗi từ ViettelPost:", res.data);
            throw new ApiError(400, res.data.message || "Tạo đơn hàng ViettelPost thất bại");
        }
    } catch (error) {
        console.error("Lỗi kết nối ViettelPost:", error.response?.data || error.message);
        throw new ApiError(error.statusCode || 500, error.response?.data?.message || error.message || "Lỗi tạo đơn ViettelPost");
    }
};
