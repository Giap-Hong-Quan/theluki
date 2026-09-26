import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import cron from "node-cron";
import Order from "../models/Order.js";
import { notifyDailySummary } from "./telegramService.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const generateDailyReport = async () => {
    const nowVn = dayjs().tz('Asia/Ho_Chi_Minh');
    const startOfDate = nowVn.startOf('day').toDate();
    const endOfDate = nowVn.endOf('day').toDate();
    const [result] = await Order.aggregate([
        {
            $match: { createdAt: { $gte: startOfDate, $lte: endOfDate } }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                pending: {
                    $sum: { $cond: [{ $eq: ["$orderStatus", "PENDING"] }, 1, 0] }
                },
                processing: {
                    $sum: { $cond: [{ $eq: ["$orderStatus", "PROCESSING"] }, 1, 0] }
                },
                shipping: {
                    $sum: { $cond: [{ $eq: ["$orderStatus", "SHIPPING"] }, 1, 0] }
                },
                delivered: {
                    $sum: { $cond: [{ $eq: ["$orderStatus", "DELIVERED"] }, 1, 0] }
                },
                cancelled: {
                    $sum: { $cond: [{ $eq: ["$orderStatus", "CANCELLED"] }, 1, 0] }
                },
                // Doanh thu tính trên các đơn đã thanh toán hoặc đã giao thành công
                totalRevenue: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $eq: ["$paymentInfo.status", "PAID"] },
                                    { $eq: ["$orderStatus", "DELIVERED"] }
                                ]
                            },
                            "$financials.finalAmount",
                            0
                        ]
                    }
                }
            }
        }
    ])
    const stats = result || {
        totalOrders: 0,
        pending: 0,
        processing: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0
    };
    // 3. Bắn tin nhắn báo cáo về nhóm Telegram
    await notifyDailySummary(stats);
    return stats;
}
export const initDailyCron = () => {
    // Chạy tổng kết vào 22:00 (10h tối) hàng ngày theo giờ Việt Nam
    const cronTime = "30 22 * * *"; 
    const job = cron.schedule(cronTime, async () => {
        try {
            console.log("⏰ [Cronjob] Đang tiến hành tổng kết đơn hàng cuối ngày...");
            await generateDailyReport();
        } catch (err) {
            console.error("❌ Lỗi khi chạy cronjob báo cáo ngày:", err);
        }
    }, {
        timezone: "Asia/Ho_Chi_Minh"
    });
    console.log("⏰ Daily Order Report Cron Job đã được kích hoạt (22:00 hàng ngày)".cyan);
    return job;
};
