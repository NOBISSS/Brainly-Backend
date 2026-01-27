"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLink = exports.getLinks = exports.createLink = void 0;
const linkModel_1 = __importDefault(require("../models/linkModel"));
const workspaceModel_1 = __importDefault(require("../models/workspaceModel"));
const open_graph_scraper_1 = __importDefault(require("open-graph-scraper"));
const mongoose_1 = __importDefault(require("mongoose"));
const getPlantformThumbnail_1 = require("../utils/getPlantformThumbnail");
const getFavicon_1 = require("../utils/getFavicon");
const constant_1 = require("../constants/constant");
//CREATE LINK
const createLink = async (req, res) => {
    try {
        const { title, url, category, tags, workspace } = req.body;
        const userId = req.user._id;
        if (workspace) {
            const ws = await workspaceModel_1.default.findOne({
                _id: workspace,
                $or: [{ owner: userId }, { members: userId }],
            });
            if (!ws) {
                return res.status(403).json({
                    success: false,
                    message: "No access to this workspace",
                });
            }
        }
        if (!url || !category) {
            return res.status(400).json({ message: "URL and Category are required" });
        }
        try {
            new URL(url);
        }
        catch {
            return res.status(400).json({ success: false, message: "Invalid URL" });
        }
        ;
        let thumbnail = constant_1.DEFAULT_THUMBNAIL;
        let fetchedTitle = title;
        try {
            const { result } = await (0, open_graph_scraper_1.default)({ url, timeout: 3000, onlyGetOpenGraphInfo: true });
            if (result.success) {
                thumbnail = result.ogImage?.[0]?.url || (0, getPlantformThumbnail_1.getPlatformThumbnail)(url) || (0, getFavicon_1.getFavicon)(url) || constant_1.DEFAULT_THUMBNAIL;
                fetchedTitle = result.ogTitle || fetchedTitle;
                console.log("FETCHED TITLE:::", fetchedTitle);
            }
        }
        catch (error) {
            console.log("OG Fetch Failed for:", url);
        }
        const link = await linkModel_1.default.create({
            createdBy: req.user._id,
            title: fetchedTitle || title,
            url,
            category: String(category).toUpperCase(),
            tags: Array.isArray(tags) ? tags : [],
            workspace: workspace || null,
            thumbnail
        });
        if (workspace) {
            await workspaceModel_1.default.findByIdAndUpdate(workspace, {
                $addToSet: {
                    links: link._id
                }
            });
        }
        res.status(201).json({ success: true, message: "Link Created Successfully", data: link });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error Occured While Creating Link",
            error: error.message || error
        });
    }
};
exports.createLink = createLink;
//GET LINK
const getLinks = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id;
        if (!workspaceId) {
            return res.status(400).json({ success: false, message: "Workspace Id is required" });
        }
        const workspace = await workspaceModel_1.default.findOne({
            _id: workspaceId,
            $or: [{ owner: userId }, { members: userId }]
        });
        if (!workspace) {
            return res.status(404).json({ success: false, message: "Access Denied Or Workspace not found" });
        }
        const links = await linkModel_1.default.find({ workspace: workspaceId })
            .populate("createdBy", "name avatar")
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({
            success: true,
            count: links.length,
            data: links
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Error Fetching Links", error: err });
    }
};
exports.getLinks = getLinks;
const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Link ID" });
        }
        const userId = req.user._id;
        const link = await linkModel_1.default.findOne({ _id: id, createdBy: userId });
        if (!link) {
            return res.status(404).json({
                message: "Link not found or Not Owned By You"
            });
        }
        if (link.workspace) {
            await workspaceModel_1.default.findByIdAndUpdate(link.workspace, { $pull: { links: link._id } });
        }
        await linkModel_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Link deleted Successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to Delete Link Content",
            error
        });
    }
};
exports.deleteLink = deleteLink;
// export const moveLinkToWorkspace = async (req: Request, res: Response) => {
//     try {
//         const { linkId, workspaceId } = req.body;
//         const userId=req.user._id;
//         const link = await Link.findOne({_id:linkId,user:userId});
//         if (!link) return res.status(404).json({success:false, message: "Link not Found" });
//         //check permission
//         const targetWorkspace=await Workspace.findOne({
//             _id:workspaceId,
//             $or:[{owner:userId},{member:userId}]
//         })
//         if(!targetWorkspace) return res.status(403).json({success:false,message:"No Access to move this link"});
//         if(link.workspace){
//             await Workspace.findByIdAndUpdate(link.workspace,{$pull:{links:link._id}});
//         }
//         link.workspace=workspaceId;
//         await link.save();
//         await Workspace.findByIdAndUpdate(workspaceId,{$push:{link._id}});
//         res.status(200).json({success:true, message: "Link Moved Successfully",data:link });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to Move Link", error })
//     }
// }
