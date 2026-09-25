export const generateCounterVietQr = ({ orderCode, amount }) => {
    const bankName = process.env.SEPAY_BANK_NAME || "MB";
    const accountNo = process.env.SEPAY_ACCOUNT_NO || "0335906807";
    const accountName = process.env.SEPAY_ACCOUNT_NAME || "GIAP HONG QUAN";

    const finalAmount = Math.round(Number(amount));
    const description = `LUKI ${orderCode}`;

    const qrUrl = `https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankName}&amount=${finalAmount}&des=${encodeURIComponent(
        description
    )}&template=compact`;

    const backupQrUrl = `https://img.vietqr.io/image/${bankName}-${accountNo}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(
        description
    )}&accountName=${encodeURIComponent(accountName)}`;

    return {
        qrUrl,
        backupQrUrl,
        bankName,
        accountNo,
        accountName,
        amount: finalAmount,
        description,
        orderCode
    };
};

export const verifySepayWebhook = (headers, body) => {
    const authHeader = headers["authorization"] || headers["Authorization"] || "";
    const apiKey = process.env.SEPAY_API_KEY;

    let isAuthorized = false;
    if (apiKey) {
        if (authHeader === `Apikey ${apiKey}` || authHeader === `Bearer ${apiKey}` || authHeader === apiKey) {
            isAuthorized = true;
        }
    }

    const {
        id,
        gateway,
        accountNumber,
        content = "",
        transferType,
        transferAmount = 0,
        referenceCode
    } = body;

    const isMoneyIn = transferType === "in";

    let matchedOrderCode = null;
    const orderMatch = content.match(/ORD\d{8}-[A-Za-z0-9]+/i) || content.match(/LUKI\s+([A-Za-z0-9_-]+)/i);

    if (orderMatch) {
        matchedOrderCode = (orderMatch[1] || orderMatch[0]).replace(/^LUKI\s*/i, "").trim().toUpperCase();
    }

    return {
        isAuthorized,
        isSuccess: isAuthorized && isMoneyIn && !!matchedOrderCode,
        eventId: id ? String(id) : null,
        transactionCode: referenceCode || `SEPAY-${id}`,
        amount: Number(transferAmount),
        orderCode: matchedOrderCode,
        content,
        accountNumber,
        gateway,
        rawPayload: body
    };
};
