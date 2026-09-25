import crypto from "crypto";
import axios from "axios";

/**
 * Tạo chữ ký HMAC-SHA256 cho MoMo
 */
function createMomoSignature(rawSignature, secretKey) {
    return crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
}

/**
 * 1. Gọi MoMo v2 API để tạo liên kết thanh toán (payUrl / qrCodeUrl)
 * @param {Object} params
 * @param {string} params.orderCode - Mã đơn hàng
 * @param {number} params.amount - Số tiền thanh toán (VND)
 * @param {string} [params.orderInfo] - Mô tả đơn hàng
 * @param {string} [params.extraData] - Dữ liệu kèm thêm (base64 hoặc rỗng)
 */
export const createMomoPaymentUrl = async ({
    orderCode,
    amount,
    orderInfo,
    extraData = ""
}) => {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const apiUrl = process.env.MOMO_API_URL || "https://test-payment.momo.vn/v2/gateway/api/create";
    const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:3000/orders/momo-return";
    const ipnUrl = process.env.MOMO_IPN_URL || "http://localhost:8000/api/payment/momo/ipn";

    if (!partnerCode || !accessKey || !secretKey) {
        throw new Error("Thiếu cấu hình MOMO trong file .env (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY)");
    }

    const orderId = `${orderCode}_${Date.now()}`;
    const requestId = `${partnerCode}_${Date.now()}`;
    const requestType = "captureWallet"; // Hỗ trợ quét mã QR, Ví MoMo, Thẻ ATM NAPAS
    const finalOrderInfo = orderInfo || `Thanh toan don hang ${orderCode}`;
    const finalAmount = Math.round(Number(amount));

    // Chuỗi mã hóa theo đúng chuẩn thứ tự của MoMo v2
    const rawSignature = `accessKey=${accessKey}&amount=${finalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${finalOrderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = createMomoSignature(rawSignature, secretKey);

    const payload = {
        partnerCode,
        partnerName: "THE LUKI",
        storeId: "TheLukiStore",
        requestId,
        amount: finalAmount,
        orderId,
        orderInfo: finalOrderInfo,
        redirectUrl,
        ipnUrl,
        lang: "vi",
        extraData,
        requestType,
        signature
    };

    const response = await axios.post(apiUrl, payload, {
        headers: {
            "Content-Type": "application/json"
        },
        timeout: 15000
    });

    const data = response.data;

    if (data.resultCode !== 0) {
        throw new Error(`MoMo Error [${data.resultCode}]: ${data.message}`);
    }

    return {
        paymentUrl: data.payUrl,
        shortLink: data.shortLink,
        deeplink: data.deeplink,
        qrCodeUrl: data.qrCodeUrl,
        orderId,
        requestId,
        orderCode,
        amount: finalAmount
    };
};

/**
 * 2. Xác thực chữ ký IPN callback do MoMo gửi về
 * @param {Object} body - Dữ liệu POST JSON từ MoMo
 */
export const verifyMomoSignature = (body) => {
    const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
    } = body;

    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    // Chuỗi xác thực theo đúng định dạng IPN của MoMo
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ""}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = createMomoSignature(rawSignature, secretKey);

    const isValid = signature === expectedSignature;
    const isSuccess = isValid && Number(resultCode) === 0;

    // Bóc tách lại mã orderCode gốc từ orderId (format: orderCode_timestamp)
    let parsedOrderCode = orderId;
    if (orderId && orderId.includes("_")) {
        parsedOrderCode = orderId.split("_")[0];
    }

    return {
        isValid,
        isSuccess,
        orderCode: parsedOrderCode,
        orderId,
        transId,
        amount: Number(amount),
        resultCode: Number(resultCode),
        message,
        payType,
        rawPayload: body
    };
};
