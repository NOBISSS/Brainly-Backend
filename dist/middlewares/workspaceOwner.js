"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceOwner = void 0;
const isAdmin_1 = require("../utils/isAdmin");
const workspaceOwner = (req, res, next) => {
    const user = req.user;
    const workspace = req.workspace;
    if (!workspace) {
        return res.status(500).json({ message: "Workspace not attached" });
    }
    // admin bypass
    if ((0, isAdmin_1.isAdmin)(user))
        return next();
    if (workspace.owner.toString() !== user._id.toString()) {
        return res.status(403).json({
            message: "Only owner allowed",
        });
    }
    next();
};
exports.workspaceOwner = workspaceOwner;
