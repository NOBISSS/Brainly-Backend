"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspace = exports.removeCollaborator = exports.addCollaborator = exports.getWorkspaceById = exports.getWorkspaces = exports.createWorkspace = void 0;
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const linkModel_1 = __importDefault(require("../models/linkModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const telegram_1 = require("../utils/telegram");
//create Workspace
const createWorkspace = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name)
            return res.status(400).json({ success: false, message: "Name is Required" });
        const exists = await workspaceModel_1.default.findOne({
            owner: req.user._id,
            name
        });
        if (exists) {
            return res.status(409).json({
                message: "Workspace With This Name Already Exists"
            });
        }
        const workspace = await workspaceModel_1.default.create({
            name,
            description,
            owner: req.user._id,
            members: [req.user._id]
        });
        (0, telegram_1.sendTelegramMessage)(`📂 <b>New Workspace Created</b>
<b>Name:</b> ${workspace.name}
<b>Owner:</b> ${req.user.email}
<b>Members:</b> ${workspace.members.length}
`);
        // send only to owner initially
        // io.to(workspace.owner._id.toString()).emit("workspaceCreated", workspace);
        res.status(201).json({
            success: true,
            message: "Workspace Created",
            data: workspace
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to Create Workspace", error });
    }
};
exports.createWorkspace = createWorkspace;
//Get All Workspace
const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await workspaceModel_1.default.find({
            $or: [{ owner: req.user._id }, { members: req.user._id }],
        })
            .populate("owner", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: workspaces });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch Workspaces", error });
    }
};
exports.getWorkspaces = getWorkspaces;
//updated
const getWorkspaceById = async (req, res) => {
    res.json({
        success: true,
        data: req.workspace
    });
};
exports.getWorkspaceById = getWorkspaceById;
//updated
const addCollaborator = async (req, res) => {
    try {
        const workspace = req.workspace; // 🔥 from middleware
        const { email } = req.body;
        const user = await userModel_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const isMember = workspace.members.some((m) => m.toString() === user._id.toString());
        if (isMember) {
            return res.status(400).json({
                success: false,
                message: "User already in workspace",
            });
        }
        workspace.members.push(user._id);
        await workspace.save();
        //  io.to(workspace._id.toString()).emit("memberAdded",user);
        // console.log("EMITTING memberAdded to room:", workspace._id.toString());
        res.json({
            success: true,
            message: "Collaborator added",
            data: workspace,
        });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.addCollaborator = addCollaborator;
//new
const removeCollaborator = async (req, res) => {
    try {
        const workspace = req.workspace;
        const { userId } = req.params;
        const requesterId = req.user._id.toString();
        if (workspace.owner._id.toString() !== requesterId) {
            return res.status(403).json({
                success: false,
                message: "Only owner can remove collaborators",
            });
        }
        if (workspace.owner.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "Owner cannot be removed",
            });
        }
        await workspaceModel_1.default.updateOne({ _id: workspace._id }, { $pull: { members: userId } });
        // io.to(workspace._id.toString()).emit("memberRemoved",user);
        return res.json({
            success: true,
            message: "Collaborator removed successfully",
            data: workspace
        });
    }
    catch (error) {
        console.error("Remove collaborator error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove collaborator",
        });
    }
};
exports.removeCollaborator = removeCollaborator;
//new
const deleteWorkspace = async (req, res) => {
    try {
        const workspace = req.workspace;
        //io.emit("workspaceDeleted", workspace._id);
        await linkModel_1.default.deleteMany({ workspace: workspace._id });
        await workspace.deleteOne();
        res.json({
            success: true,
            message: "Workspace deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error });
    }
};
exports.deleteWorkspace = deleteWorkspace;
