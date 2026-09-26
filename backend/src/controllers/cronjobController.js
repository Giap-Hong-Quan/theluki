import * as cronjobService from "../services/cronjobService.js";

export const triggerDailyReportController = async (req, res, next) => {
    try {
        const stats = await cronjobService.generateDailyReport();
        return res.status(200).json({
            success: true,
            message: "Đã tổng kết và gửi báo cáo về Telegram thành công",
            data: stats
        });
    } catch (error) {
        next(error);
    }
};
