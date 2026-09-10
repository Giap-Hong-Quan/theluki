import axios from "axios";

// Danh sách dịch vụ cho khách chọn - cố định 2 loại theo đúng ViettelPost cung cấp
const SHIPPING_SERVICES = [
    {
        code: "VCN",
        label: "Chuyển phát nhanh",
        description: "1 - 3 ngày, giao bằng đường hàng không/xe tải nhanh",
        defaultFee: 35000
    },
    {
        code: "VTK",
        label: "Chuyển phát tiết kiệm",
        description: "3 - 7 ngày, giao bằng đường bộ, phù hợp hàng nặng/cồng kềnh",
        defaultFee: 25000
    }
];

/**
 * Chuẩn hóa địa chỉ sang dạng chuỗi tự nhiên 3 cấp:
 * "Số nhà tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
 */
export const formatAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr.trim();

    const parts = [
        addr.detailAddress,
        addr.ward,
        addr.district,
        addr.province
    ].filter((item) => item && typeof item === "string" && item.trim() !== "");

    return parts.join(", ");
};

/**
 * Gọi API tính cước /v2/order/getPriceNlp cho 1 mã dịch vụ cụ thể
 * Dùng địa chỉ text tự nhiên 3 cấp (không dùng ID)
 */
const getPriceByService = async ({
    receiverAddress,
    weight,
    productPrice,
    codAmount,
    orderService
}) => {
    try {
        const baseUrl = process.env.VIETTELPOST_BASE_URL || "https://partnerdev.viettelpost.vn";
        const token = process.env.VIETTELPOST_TOKEN;
        const senderAddress =
            process.env.SENDER_ADDRESS || "Xã Cát Minh, Huyện Phù Cát, Tỉnh Bình Định";
        const receiverAddressStr = formatAddress(receiverAddress);

        if (!receiverAddressStr) {
            console.warn("ViettelPost getPriceNlp: Địa chỉ người nhận đang trống");
            return null;
        }

        const res = await axios.post(
            `${baseUrl}/v2/order/getPriceNlp`,
            {
                PRODUCT_WEIGHT: Number(weight || 300),
                PRODUCT_PRICE: Number(productPrice || 0),
                MONEY_COLLECTION: Number(codAmount || 0),
                ORDER_SERVICE: orderService,
                SENDER_ADDRESS: senderAddress,
                RECEIVER_ADDRESS: receiverAddressStr,
                PRODUCT_TYPE: "HH",
                NATIONAL_TYPE: 1,
                TYPE: 1
            },
            {
                headers: {
                    Token: token,
                    "Content-Type": "application/json"
                }
            }
        );

        if (res.data?.status === 200 && res.data?.data) {
            return res.data.data;
        }

        console.warn(`ViettelPost getPriceNlp warning (${orderService}):`, res.data?.message || res.data);
        return null;
    } catch (error) {
        console.error(`ViettelPost getPriceNlp error (${orderService}):`, error.response?.data || error.message);
        return null;
    }
};

/**
 * Tính cước cho CẢ 2 dịch vụ cùng lúc (song song bằng Promise.all),
 * trả về mảng gồm cước thực tế từ ViettelPost NLP (có fallback an toàn khi sandbox bảo trì)
 */
export const calculateFee = async (params) => {
    const results = await Promise.all(
        SHIPPING_SERVICES.map(async (service) => {
            const priceData = await getPriceByService({
                ...params,
                orderService: service.code
            });

            const fee =
                typeof priceData?.MONEY_TOTAL === "number"
                    ? priceData.MONEY_TOTAL
                    : typeof priceData?.GIA_CUOC === "number"
                    ? priceData.GIA_CUOC
                    : service.defaultFee;

            return {
                serviceCode: service.code,
                label: service.label,
                description: service.description,
                fee
            };
        })
    );

    return results;
};