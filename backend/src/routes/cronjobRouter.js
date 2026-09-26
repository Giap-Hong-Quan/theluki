import express from "express";
import { triggerDailyReportController } from "../controllers/cronjobController.js";

const cronjobRouter = express.Router();

// Route test thủ công: GET /api/cronjob/daily-report
cronjobRouter.get("/daily-report", triggerDailyReportController);

export default cronjobRouter;
