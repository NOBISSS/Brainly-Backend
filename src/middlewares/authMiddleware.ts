import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redis from "../config/redis";
import User from "../models/userModel";



const JWT_SECRET = process.env.JWT_SECRET || "BRAINLY";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token expired or invalid",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      error:err
    });
  }
};

export const adminOnly = (req:Request, res:Response, next:NextFunction) => {
  if (req.user?.email !== "henry12@gmal.com") {
    return res.status(403).json({ message: "Admin only access" });
  }
  next();
};


export const logout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

  if (token) {
    await redis.set(`blacklist:${token}`, "true", "EX", 7 * 24 * 60 * 60);
  }

  res.clearCookie("accessToken",{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production"}).status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

