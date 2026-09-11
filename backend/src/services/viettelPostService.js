import axios from "axios";

/**
 * Chuẩn hóa địa chỉ sang dạng chuỗi tự nhiên 3 cấp:
 * "Số nhà tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
 */
export const formatAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr.trim();

    const parts = [
        addr.detailAddress || addr.detail || addr.address_detail,
        addr.ward,
        addr.district,
        addr.province
    ].filter((item) => item && typeof item === "string" && item.trim() !== "");

    return parts.join(", ");
};

/**
 * Kiểm tra xem địa chỉ nhận có cùng tỉnh/thành phố với Shop hay không.
 * Mặc định Shop đặt tại Bình Định (có thể override qua SENDER_PROVINCE hoặc trích xuất từ SENDER_ADDRESS).
 */
export const isSameProvince = (receiverAddress) => {
    // 1. Kiểm tra nhanh qua mã tỉnh ViettelPost (Bình Định = 40)
    const pId = typeof receiverAddress === "object" ? Number(receiverAddress?.provinceId) : null;
    if (pId === 40) return true;

    // 2. Kiểm tra qua chuỗi địa chỉ
    const senderAddr = process.env.SENDER_ADDRESS || "Tỉnh Bình Định";
    const receiverAddrStr = formatAddress(receiverAddress);

    const getProvincePart = (str) => {
        if (!str) return "";
        const parts = str.split(",").map((p) => p.trim());
        return parts[parts.length - 1] || "";
    };

    const clean = (str) =>
        (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đð]/gi, "d")
            .replace(/^(tinh|thanh pho|tp\.?|tp)\s+/i, "")
            .trim();

    const senderProvince = clean(process.env.SENDER_PROVINCE || getProvincePart(senderAddr));
    const receiverProvince = clean(
        (typeof receiverAddress === "object" ? receiverAddress?.province : null) || getProvincePart(receiverAddrStr)
    );

    if (!senderProvince || !receiverProvince) return false;

    return (
        senderProvince === receiverProvince ||
        senderProvince.includes(receiverProvince) ||
        receiverProvince.includes(senderProvince) ||
        receiverProvince.includes("binh dinh")
    );
};

/**
 * Tính cước vận chuyển theo chính sách nội bộ của Shop:
 * - Cùng tỉnh (Bình Định): 20.000đ
 * - Ngoài tỉnh: 30.000đ
 * - Đơn hàng từ 300.000đ trở lên: Miễn phí vận chuyển (0đ)
 */
export const calculateShopShippingFee = ({ receiverAddress, productPrice = 0 }) => {
    const FREE_SHIP_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD) || 300000;
    const sameProvince = isSameProvince(receiverAddress);

    const baseFee = sameProvince ? 20000 : 30000;
    const isFreeShipping = Number(productPrice) >= FREE_SHIP_THRESHOLD;
    const fee = isFreeShipping ? 0 : baseFee;

    return {
        fee,
        baseFee,
        isFreeShipping,
        isSameProvince: sameProvince,
        deliveryTime: sameProvince ? "Trong 24 giờ" : "1 - 3 ngày",
        freeShipThreshold: FREE_SHIP_THRESHOLD
    };
};

/**
 * Hàm tính cước trả về cho Checkout khách hàng:
 * Không gọi ViettelPost ở bước này, phản hồi tức thì bảng giá cố định của Shop.
 */
export const calculateFee = async ({ receiverAddress, productPrice = 0 }) => {
    const calculation = calculateShopShippingFee({ receiverAddress, productPrice });

    return [
        {
            serviceCode: "STANDARD",
            serviceName: "Giao hàng tiêu chuẩn",
            label: "Giao hàng tiêu chuẩn",
            fee: calculation.fee,
            baseFee: calculation.baseFee,
            isFreeShipping: calculation.isFreeShipping,
            deliveryTime: calculation.deliveryTime,
            description: calculation.isFreeShipping
                ? "Đơn từ 300.000đ - Miễn phí giao hàng toàn quốc"
                : calculation.isSameProvince
                ? "Nội tỉnh (Bình Định) - Đồng giá 20.000đ"
                : "Ngoại tỉnh - Đồng giá 30.000đ"
        }
    ];
};

/**
 * Gọi API https://partnerdev.viettelpost.vn/v2/order/getPriceAllNlp
 * Lấy toàn bộ danh sách dịch vụ khả dụng của ViettelPost cho đơn hàng,
 * tìm và trả về dịch vụ có cước phí rẻ nhất để sử dụng khi tạo vận đơn ViettelPost.
 */
export const getCheapestViettelPostService = async ({
    receiverAddress,
    weight = 300,
    productPrice = 0,
    codAmount = 0
}) => {
    try {
        const baseUrl = process.env.VIETTELPOST_BASE_URL || "https://partnerdev.viettelpost.vn";
        const token = process.env.VIETTELPOST_TOKEN;
        const senderAddress = process.env.SENDER_ADDRESS;
        const receiverAddressStr = formatAddress(receiverAddress);

        if (!receiverAddressStr) {
            console.warn("ViettelPost getPriceAllNlp: Địa chỉ người nhận đang trống");
            return null;
        }

        const res = await axios.post(
            `${baseUrl}/v2/order/getPriceAllNlp`,
            {
                PRODUCT_WEIGHT: Number(weight || 300),
                PRODUCT_PRICE: Number(productPrice || 0),
                MONEY_COLLECTION: Number(codAmount || 0),
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
                },
                timeout: 10000
            }
        );

        const list = res.data?.RESULT || (Array.isArray(res.data) ? res.data : res.data?.data) || [];

        if (!Array.isArray(list) || list.length === 0) {
            console.warn("ViettelPost getPriceAllNlp: Không tìm thấy dịch vụ khả dụng:", res.data);
            return null;
        }

        const validServices = list
            .map((item) => {
                const fee =
                    typeof item.MONEY_TOTAL === "number" && item.MONEY_TOTAL > 0
                        ? item.MONEY_TOTAL
                        : typeof item.GIA_CUOC === "number" && item.GIA_CUOC > 0
                        ? item.GIA_CUOC
                        : null;
                return {
                    serviceCode: item.MA_DV_CHINH,
                    serviceName: item.TEN_DICHVU,
                    fee,
                    deliveryTime: item.THOI_GIAN
                };
            })
            .filter((s) => s.fee !== null);

        if (validServices.length === 0) return null;

        // Sắp xếp tăng dần theo giá cước, lấy dịch vụ rẻ nhất
        validServices.sort((a, b) => a.fee - b.fee);
        const cheapest = validServices[0];

        return cheapest;
    } catch (error) {
        console.error("ViettelPost getPriceAllNlp error:", error.response?.data || error.message);
        return null;
    }
};

