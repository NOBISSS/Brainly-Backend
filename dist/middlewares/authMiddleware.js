"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = __importDefault(require("../config/redis"));
const userModel_1 = __importDefault(require("../models/userModel"));
const isAdmin_1 = require("../utils/isAdmin");
const JWT_SECRET = process.env.JWT_SECRET || "BRAINLY";
const protect = async (req, res, next) => {
    let token;
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
        const isBlacklisted = await redis_1.default.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: "Token expired or invalid",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await userModel_1.default.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed",
            error: err
        });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    //if (req.user?.email !== "henry12@gmal.com") {
    if (!(0, isAdmin_1.isAdmin)(req.user)) {
        return res.status(403).json({ message: "Admin only access" });
    }
    next();
};
exports.adminOnly = adminOnly;
const logout = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;
    if (token) {
        await redis_1.default.set(`blacklist:${token}`, "true", "EX", 7 * 24 * 60 * 60);
    }
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" }).status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
