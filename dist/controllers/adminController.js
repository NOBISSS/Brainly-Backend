"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.getAdminStats = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const linkModel_1 = __importDefault(require("../models/linkModel"));
/**
 * GET ADMIN STATS
 * returns analytics numbers for dashboard
 */
const getAdminStats = async (req, res) => {
    try {
        // today start time (00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [users, workspaces, links, todayUsers, todayLinks] = await Promise.all([
            userModel_1.default.countDocuments(),
            workspaceModel_1.default.countDocuments(),
            linkModel_1.default.countDocuments(),
            userModel_1.default.countDocuments({ createdAt: { $gte: today } }),
            linkModel_1.default.countDocuments({ createdAt: { $gte: today } })
        ]);
        return res.status(200).json({
            success: true,
            message: "Admin stats fetched successfully",
            data: {
                users,
                workspaces,
                links,
                todayUsers,
                todayLinks
            }
        });
    }
    catch (error) {
        console.log("Error Fetching Admin Stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin stats"
        });
    }
};
exports.getAdminStats = getAdminStats;
/**
 * Optional: Health check (good for EC2 monitoring)
 */
const healthCheck = async (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "Server running healthy 🚀"
    });
};
exports.healthCheck = healthCheck;
