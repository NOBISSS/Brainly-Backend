"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceAccess = void 0;
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const isAdmin_1 = require("../utils/isAdmin");
const workspaceAccess = async (req, res, next) => {
    try {
        console.log("ENTERED");
        const user = req.user;
        // workspace id can come from params or body
        const workspaceId = req.params.id ||
            req.params.workspaceId ||
            req.body.workspace;
        const workspace = await workspaceModel_1.default.findById(workspaceId)
            .populate("owner", "name email")
            .populate("memebers", "name email");
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        // ✅ ADMIN BYPASS
        if ((0, isAdmin_1.isAdmin)(user)) {
            req.workspace = workspace;
            return next();
        }
        ;
        const isOwner = workspace.owner._id.toString() === user._id.toString();
        const isMember = workspace.members.some((m) => m._id.toString() === user._id.toString());
        if (!isOwner && !isMember) {
            return res.status(403).json({
                success: false,
                message: "Access denied to workspace",
            });
        }
        req.workspace = workspace;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.workspaceAccess = workspaceAccess;
