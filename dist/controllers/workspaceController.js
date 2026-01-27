"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorkspace = exports.removeCollaborator = exports.addCollaborator = exports.getWorkspaceById = exports.getWorkspaces = exports.createWorkspace = void 0;
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const linkModel_1 = __importDefault(require("../models/linkModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importStar(require("mongoose"));
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
const getWorkspaceById = async (req, res) => {
    try {
        const { id } = req.params;
        const workspace = await workspaceModel_1.default.findOne({
            _id: id,
            $or: [{ owner: req.user._id }, { members: req.user._id }],
        })
            .populate("owner", "name email")
            .populate("members", "name email")
            .populate("links");
        if (!workspace)
            return res.status(404).json({ message: "Workspace not found" });
        const isMember = workspace.members.some((m) => m._id.toString() === req.user._id.toString());
        if (!isMember && workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access Denied" });
        }
        res.status(200).json({ success: true, data: workspace });
    }
    catch (error) {
        res.status(500).json({ message: "Error Fetching Workspaces", error });
    }
};
exports.getWorkspaceById = getWorkspaceById;
//Add Collaborator
const addCollaborator = async (req, res) => {
    try {
        const { id } = req.params;
        //const {userId}=req.body;
        const { email } = req.body;
        //Check Wheather particular user is exist on system or not
        const workspace = await workspaceModel_1.default.findById(id);
        if (!workspace)
            return res.status(404).json({ success: false, message: "Workspace not found" });
        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only Owner can Add Members" });
        }
        const user = await userModel_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not Found"
            });
        }
        const isMember = workspace.members.some((m) => m.toString() === user._id.toString());
        if (isMember) {
            return res.status(400).json({ success: false, message: "User Already in Workspace" });
        }
        workspace.members.push(user._id);
        await workspace.save();
        res.status(200).json({ success: true, message: "Collaborator Added", data: workspace });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to Add Member in workspace",
            error
        });
    }
};
exports.addCollaborator = addCollaborator;
//Remove Collaborator
const removeCollaborator = async (req, res) => {
    try {
        const { id, userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Workspace ID" });
        }
        const workspace = await workspaceModel_1.default.findById(id);
        if (!workspace)
            return res.status(404).json({
                message: "Workspace Not Found"
            });
        if (userId === workspace.owner.toString()) {
            return res.status(400).json({
                message: "Owner Cannot be Removed",
            });
        }
        //check that owner id 
        if (workspace.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ message: "Only Owner Can Remove Collaborator" });
        await workspaceModel_1.default.findByIdAndUpdate(id, { $addToSet: { members: userId } });
        res.status(200).json({ success: true, message: "Collaborator Removed", data: workspace });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to remove Collaborator", error });
    }
};
exports.removeCollaborator = removeCollaborator;
// export const shareWorkspace = async (req: Request, res: Response) => {
//     const share = req.body.share;
// }
const deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid workspace ID" });
        }
        const workspace = await workspaceModel_1.default.findById(id);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only owner can delete workspace",
            });
        }
        await linkModel_1.default.deleteMany({ workspace: id });
        await workspaceModel_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Workspace deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete workspace",
            error,
        });
    }
};
exports.deleteWorkspace = deleteWorkspace;
// export const getUsersWorkspaces=async(req:Request,res:Response){
//     try{
//         const userId=req.user._id;
//         const res=await Workspace.find({})
//     }catch(error){
//         res.status(500).json({
//             success:false,
//             message:"Failed to fetch Users Workspaces"
//         })
//     }
// }
