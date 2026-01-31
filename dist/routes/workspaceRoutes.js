"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workspaceController_1 = require("../controllers/workspaceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const workspaceAccess_1 = require("../middlewares/workspaceAccess");
const workspaceOwner_1 = require("../middlewares/workspaceOwner");
const router = express_1.default.Router();
router.post("/", authMiddleware_1.protect, workspaceController_1.createWorkspace);
router.get("/", authMiddleware_1.protect, workspaceController_1.getWorkspaces);
router.get("/:id", authMiddleware_1.protect, workspaceAccess_1.workspaceAccess, workspaceController_1.getWorkspaceById);
router.post("/:id/collaborators", authMiddleware_1.protect, workspaceAccess_1.workspaceAccess, workspaceOwner_1.workspaceOwner, workspaceController_1.addCollaborator);
router.delete("/:id/collaborators/:userId", authMiddleware_1.protect, workspaceAccess_1.workspaceAccess, workspaceOwner_1.workspaceOwner, workspaceController_1.removeCollaborator);
router.delete("/:id", authMiddleware_1.protect, workspaceAccess_1.workspaceAccess, workspaceOwner_1.workspaceOwner, workspaceController_1.deleteWorkspace);
exports.default = router;
