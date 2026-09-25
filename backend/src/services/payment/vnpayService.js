import crypto from "crypto";
import qs from "qs";
import dayjs from "dayjs";

/**
 * Hàm sắp xếp object theo thứ tự bảng chữ cái A-Z của key
 * Chuẩn thuật toán mã hóa của VNPAY
 */
export function sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

/**
 * Lấy IP của client từ request (hỗ trợ reverse proxy / localhost IPv6)
 */
export function getClientIp(req) {
    let ip =
        req.headers["x-forwarded-for"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        "127.0.0.1";

    if (Array.isArray(ip)) ip = ip[0];
    if (typeof ip === "string" && ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";
    return ip;
}

/**
 * Tạo URL thanh toán VNPAY
 * @param {Object} params
 * @param {string} params.orderCode - Mã đơn hàng (VD: ORD20260924-A1B2)
 * @param {number} params.amount - Số tiền thanh toán (VND)
 * @param {string} [params.orderInfo] - Nội dung thanh toán
 * @param {string} [params.bankCode] - Mã ngân hàng nếu muốn chọn thẳng (VD: NCB, VNPAYQR, VISA)
 * @param {string} [params.ipAddr] - IP của client
 * @param {string} [params.locale] - Ngôn ngữ (vn | en)
 * @param {string} [params.returnUrl] - URL FE redirect về sau khi thanh toán
 */
export const createVnpayPaymentUrl = ({
    orderCode,
    amount,
    orderInfo,
    bankCode,
    ipAddr = "127.0.0.1",
    locale = "vn",
    returnUrl
}) => {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_HASH_SECRET;
    let vnpUrl = process.env.VNPAY_URL;

    if (!tmnCode || !secretKey || !vnpUrl) {
        throw new Error("Thiếu cấu hình VNPAY trong file .env (VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL)");
    }

    const createDate = dayjs().format("YYYYMMDDHHmmss");
    const expireDate = dayjs().add(15, "minute").format("YYYYMMDDHHmmss"); // Hết hạn sau 15 phút

    // VNPAY yêu cầu số tiền nhân 100 (đơn vị: đồng -> cents)
    const vnpAmount = Math.round(Number(amount) * 100);

    let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderCode,
        vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderCode}`,
        vnp_OrderType: "other",
        vnp_Amount: vnpAmount,
        vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
    };

    if (bankCode && bankCode.trim() !== "") {
        vnp_Params["vnp_BankCode"] = bankCode.trim();
    }

    // Sắp xếp param A-Z
    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;
    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;

    return {
        paymentUrl,
        orderCode,
        amount,
        expireDate
    };
};

/**
 * Xác thực chữ ký dữ liệu trả về từ VNPAY (dùng cho Return URL và IPN)
 * @param {Object} vnpParams - Toàn bộ query params nhận được từ VNPAY
 * @returns {{ isValid: boolean, isSuccess: boolean, data: Object, responseCode: string }}
 */
export const verifyVnpaySignature = (vnpParams) => {
    const secureHash = vnpParams["vnp_SecureHash"];
    const secretKey = process.env.VNPAY_HASH_SECRET;

    // Loại bỏ SecureHash và SecureHashType trước khi tạo hash kiểm tra
    const paramsToVerify = { ...vnpParams };
    delete paramsToVerify["vnp_SecureHash"];
    delete paramsToVerify["vnp_SecureHashType"];

    const sortedParams = sortObject(paramsToVerify);
    const signData = qs.stringify(sortedParams, { encode: false });

    const hmac = crypto.createHmac("sha512", secretKey);
    const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    const isValid = secureHash === checkHash;
    const isSuccess = isValid && vnpParams["vnp_ResponseCode"] === "00" && vnpParams["vnp_TransactionStatus"] === "00";

    return {
        isValid,
        isSuccess,
        responseCode: vnpParams["vnp_ResponseCode"],
        transactionStatus: vnpParams["vnp_TransactionStatus"],
        orderCode: vnpParams["vnp_TxnRef"],
        transactionNo: vnpParams["vnp_TransactionNo"],
        bankCode: vnpParams["vnp_BankCode"],
        bankTranNo: vnpParams["vnp_BankTranNo"],
        cardType: vnpParams["vnp_CardType"],
        payDate: vnpParams["vnp_PayDate"],
        amount: Number(vnpParams["vnp_Amount"]) / 100, // Đổi ngược lại VND
        rawParams: vnpParams
    };
};
