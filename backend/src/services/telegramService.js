import axios from "axios";

/**
 * Gửi tin nhắn định dạng HTML về nhóm Telegram cấu hình trong .env
 */
export const sendTelegramMessage = async (htmlMessage) => {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return;
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        await axios.post(
            url,
            {
                chat_id: chatId,
                text: htmlMessage,
                parse_mode: "HTML"
            },
            { timeout: 8000 }
        );
    } catch (error) {
        console.warn("[Telegram] Lỗi gửi thông báo:", error.response?.data?.description || error.message);
    }
};

/**
 * 1. Thông báo khi có ĐƠN HÀNG MỚI
 */
export const notifyNewOrder = async (order) => {
    try {
        const itemsList = (order.items || [])
            .map(
                (item) =>
                    `  • <b>${item.name}</b> (${item.color} / ${item.size}) x${item.quantity} - ${(
                        item.price * item.quantity
                    ).toLocaleString("vi-VN")}đ`
            )
            .join("\n") || "  • Không có chi tiết";

        const address = [
            order.shippingAddress?.detailAddress,
            order.shippingAddress?.ward,
            order.shippingAddress?.district,
            order.shippingAddress?.province
        ]
            .filter(Boolean)
            .join(", ");

        const shippingDesc = order.shippingInfo?.serviceName
            ? `${order.shippingInfo.serviceName} (${order.shippingInfo.serviceCode})`
            : "Chuyển phát tiết kiệm (VTK)";

        const message = `
🛍️ <b>ĐƠN HÀNG MỚI #[${order.orderCode}]</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${order.shippingAddress?.receiverName || "Khách lẻ"}
📞 <b>Điện thoại:</b> <code>${order.shippingAddress?.receiverPhone || "Chưa có"}</code>
📍 <b>Địa chỉ:</b> ${address}
🚚 <b>Vận chuyển:</b> ${shippingDesc}
💳 <b>Thanh toán:</b> ${order.paymentInfo?.method} (${
            order.paymentInfo?.status === "PAID" ? "✅ ĐÃ THANH TOÁN" : "⏳ CHỜ THANH TOÁN"
        })

📦 <b>Danh sách sản phẩm:</b>
${itemsList}

💰 <b>Tổng thanh toán:</b> <b>${Number(order.financials?.finalAmount || 0).toLocaleString("vi-VN")} đ</b>
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")} - ${new Date().toLocaleDateString("vi-VN")}
        `.trim();

        await sendTelegramMessage(message);
    } catch (err) {
        console.error("[Telegram] notifyNewOrder error:", err.message);
    }
};

/**
 * 2. Thông báo khi ĐƠN HÀNG ĐƯỢC THANH TOÁN THÀNH CÔNG
 */
export const notifyOrderPaid = async (order, gateway = "") => {
    try {
        const message = `
💰 <b>XÁC NHẬN THANH TOÁN THÀNH CÔNG #[${order.orderCode}]</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${order.shippingAddress?.receiverName}
💳 <b>Cổng thanh toán:</b> ${gateway || order.paymentInfo?.method}
💵 <b>Số tiền:</b> <b>${Number(order.financials?.finalAmount || 0).toLocaleString("vi-VN")} đ</b>
🔖 <b>Mã giao dịch:</b> <code>${order.paymentInfo?.transactionId || "N/A"}</code>
✅ <b>Trạng thái đơn:</b> Đang chuẩn bị đóng gói & xuất kho
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")} - ${new Date().toLocaleDateString("vi-VN")}
        `.trim();

        await sendTelegramMessage(message);
    } catch (err) {
        console.error("[Telegram] notifyOrderPaid error:", err.message);
    }
};

/**
 * 3. Thông báo khi ĐƠN HÀNG BỊ HỦY
 */
export const notifyOrderCancelled = async (order, reason = "") => {
    try {
        const message = `
⚠️ <b>ĐƠN HÀNG ĐÃ BỊ HỦY #[${order.orderCode}]</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Khách hàng:</b> ${order.shippingAddress?.receiverName}
💸 <b>Giá trị đơn:</b> ${Number(order.financials?.finalAmount || 0).toLocaleString("vi-VN")} đ
❌ <b>Lý do hủy:</b> ${reason || order.cancelReason || "Hệ thống tự hủy do quá hạn"}
🔄 <b>Tồn kho:</b> Đã hoàn trả lại số lượng cho các sản phẩm trong đơn
⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")} - ${new Date().toLocaleDateString("vi-VN")}
        `.trim();

        await sendTelegramMessage(message);
    } catch (err) {
        console.error("[Telegram] notifyOrderCancelled error:", err.message);
    }
};


export const notifyDailySummary = async (stats) => {
    const message = `
📊 <b>BÁO CÁO TỔNG KẾT ĐƠN HÀNG HÔM NAY</b>
📅 <i>Ngày: ${new Date().toLocaleDateString("vi-VN")}</i>
━━━━━━━━━━━━━━━━━━━━━
📦 <b>Tổng đơn phát sinh:</b> <b>${stats.totalOrders}</b> đơn

🔹 Chờ xử lý (PENDING): <b>${stats.pending}</b>
🔹 Đang đóng gói (PROCESSING): <b>${stats.processing}</b>
🔹 Đang vận chuyển (SHIPPING): <b>${stats.shipping}</b>
✅ Giao thành công (DELIVERED): <b>${stats.delivered}</b>
❌ Đơn bị hủy (CANCELLED): <b>${stats.cancelled}</b>

💰 <b>Doanh thu hôm nay:</b> <b>${stats.totalRevenue.toLocaleString("vi-VN")} đ</b>
━━━━━━━━━━━━━━━━━━━━━
⏰ <i>Báo cáo tự động được tạo lúc 22:00 (10h tối)</i>
    `.trim();

    await sendTelegramMessage(message);
};
