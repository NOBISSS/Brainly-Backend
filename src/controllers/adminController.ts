import { Request, Response } from "express";
import User from "../models/userModel";
import Workspace from "../models/workspaceModel";
import Link from "../models/linkModel";

/**
 * GET ADMIN STATS
 * returns analytics numbers for dashboard
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // today start time (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      users,
      workspaces,
      links,
      todayUsers,
      todayLinks
    ] = await Promise.all([
      User.countDocuments(),
      Workspace.countDocuments(),
      Link.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      Link.countDocuments({ createdAt: { $gte: today } })
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

  } catch (error: any) {
    console.log("Error Fetching Admin Stats:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats"
    });
  }
};


/**
 * Optional: Health check (good for EC2 monitoring)
 */
export const healthCheck = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Server running healthy 🚀"
  });
};
