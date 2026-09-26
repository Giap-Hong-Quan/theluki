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

/**
 * Lấy tất cả các gói cước vận chuyển ViettelPost khả dụng cho địa chỉ nhận hàng
 */
export const getShippingServices = async ({
    receiverAddress,
    weight = 500,
    price = 0,
    codAmount = 0,
    retryCount = 0
}) => {
    const API_URL = "https://partnerdev.viettelpost.vn/v2/order/getPriceAllNlp";
    const token = await getVTPToken();

    const senderAddress = process.env.SENDER_ADDRESS || "Xã Cát Minh, Huyện Phù Cát, Tỉnh Bình Định";
    const addressStr = typeof receiverAddress === "object"
        ? [receiverAddress.detailAddress, receiverAddress.ward, receiverAddress.district, receiverAddress.province].filter(Boolean).join(", ")
        : String(receiverAddress || "");

    const payload = {
        SENDER_ADDRESS: senderAddress,
        RECEIVER_ADDRESS: addressStr,
        PRODUCT_TYPE: "HH",
        PRODUCT_WEIGHT: Math.max(100, Math.round(Number(weight) || 500)),
        PRODUCT_PRICE: Math.max(0, Math.round(Number(price) || 0)),
        MONEY_COLLECTION: Math.max(0, Math.round(Number(codAmount) || 0)),
        TYPE: 1
    };

    try {
        const res = await axios.post(API_URL, payload, {
            headers: {
                Token: token,
                "Content-Type": "application/json"
            }
        });

        // Token hết hạn
        if (
            (res.data?.status === 201 || res.data?.status === 202) &&
            res.data?.message?.toLowerCase()?.includes("token") &&
            retryCount < 1
        ) {
            await getVTPToken(true);
            return await getShippingServices({ receiverAddress, weight, price, codAmount, retryCount: retryCount + 1 });
        }

        const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (Array.isArray(rawList) && rawList.length > 0) {
            return rawList
                .filter(item => item && Number(item.GIA_CUOC) > 0)
                .map(item => ({
                    serviceCode: item.MA_DV_CHINH,
                    serviceName: item.TEN_DICHVU,
                    fee: Number(item.GIA_CUOC),
                    expectedDelivery: item.THOI_GIAN || null,
                    exchangeWeight: item.EXCHANGE_WEIGHT || 0
                }));
        }

        return [];
    } catch (error) {
        if (error.response?.data?.message?.toLowerCase()?.includes("token") && retryCount < 1) {
            await getVTPToken(true);
            return await getShippingServices({ receiverAddress, weight, price, codAmount, retryCount: retryCount + 1 });
        }
        console.warn("[ViettelPost] getShippingServices warning:", error.response?.data || error.message);
        return [];
    }
};

/**
 * Tự động tìm và chọn ra phương thức vận chuyển có PHÍ RẺ NHẤT (Cheapest Service)
 * Nếu ViettelPost lỗi mạng/địa chỉ sai, tự động fallback an toàn (20k nội tỉnh, 30k ngoại tỉnh)
 */
export const getCheapestShippingService = async ({
    receiverAddress,
    weight = 500,
    price = 0,
    codAmount = 0
}) => {
    try {
        const services = await getShippingServices({ receiverAddress, weight, price, codAmount });

        if (services && services.length > 0) {
            // Sắp xếp tăng dần theo giá cước (GIA_CUOC)
            const sorted = [...services].sort((a, b) => a.fee - b.fee);
            const cheapest = sorted[0];

            return {
                serviceCode: cheapest.serviceCode,
                serviceName: cheapest.serviceName,
                fee: cheapest.fee,
                expectedDelivery: cheapest.expectedDelivery,
                allServices: sorted,
                isFallback: false
            };
        }
    } catch (err) {
        console.warn("[ViettelPost] Lỗi tính cước tự động, kích hoạt fallback:", err.message);
    }

    // Fallback thông minh: Kiểm tra cùng tỉnh Bình Định hay khác tỉnh
    const addressStr = typeof receiverAddress === "object"
        ? (receiverAddress.province || "")
        : String(receiverAddress || "");

    const isSameProvince = addressStr
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đð]/gi, "d")
        .includes("binh dinh");

    const fallbackFee = isSameProvince ? 20000 : 30000;

    return {
        serviceCode: "VTK",
        serviceName: isSameProvince ? "Giao hàng nội tỉnh (Tiết kiệm)" : "Giao hàng liên tỉnh (Tiết kiệm)",
        fee: fallbackFee,
        expectedDelivery: isSameProvince ? "24-48 giờ" : "48-72 giờ",
        allServices: [
            {
                serviceCode: "VTK",
                serviceName: "Chuyển phát tiết kiệm",
                fee: fallbackFee,
                expectedDelivery: isSameProvince ? "24-48 giờ" : "48-72 giờ"
            }
        ],
        isFallback: true
    };
};
