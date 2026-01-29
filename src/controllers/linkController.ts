import { Request, Response } from "express"
import Link from "../models/linkModel";
import Workspace from "../models/workspaceModel"
import ogs from "open-graph-scraper";
import mongoose from "mongoose";
import { getPlatformThumbnail } from "../utils/getPlantformThumbnail";
import { getFavicon } from "../utils/getFavicon";
import { DEFAULT_THUMBNAIL } from "../constants/constant";

//CREATE LINK
export const createLink = async (req: Request, res: Response) => {
    try {
        const { title, url, category, tags, workspace } = req.body;
        const userId = req.user!._id;

        if (workspace) {
            const ws = await Workspace.findOne({
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

        try { new URL(url); } catch { return res.status(400).json({ success: false, message: "Invalid URL" }) };

        let thumbnail = DEFAULT_THUMBNAIL;
        let fetchedTitle = title;

        try {
            const { result } = await ogs({ url, timeout: 3000,onlyGetOpenGraphInfo:true });
            if (result.success) {
                thumbnail = result.ogImage?.[0]?.url || getPlatformThumbnail(url) || getFavicon(url) ||DEFAULT_THUMBNAIL;
                fetchedTitle =result.ogTitle ||fetchedTitle;
                console.log("FETCHED TITLE:::",fetchedTitle)
            }
        } catch (error) {
            console.log("OG Fetch Failed for:", url);
        }

        const link = await Link.create({
            createdBy: req.user!._id,
            title: fetchedTitle || title,
            url,
            category: String(category).toUpperCase(),
            tags:Array.isArray(tags)?tags:[],
            workspace: workspace || null,
            thumbnail
        });

        const populatedLink = await Link.findById(link._id)
  .populate("createdBy", "name avatar email")
  .lean();

        if (workspace) {
            await Workspace.findByIdAndUpdate(workspace, {
                $addToSet: {
                    links: link._id
                }
            })
        }

        res.status(201).json({ success: true, message: "Link Created Successfully", data: populatedLink });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error Occured While Creating Link",
            error: error.message || error
        })
    }
}

//GET LINK
export const getLinks = async (req: Request, res: Response) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user!._id;

        if (!workspaceId) {
            return res.status(400).json({ success: false, message: "Workspace Id is required" });
        }

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            $or: [{ owner: userId }, { members: userId }]
        });

        if (!workspace) {
            return res.status(404).json({ success: false, message: "Access Denied Or Workspace not found" });
        }

        const links = await Link.find({ workspace: workspaceId })
            .populate("createdBy","name avatar")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: links.length,
            data: links
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error Fetching Links", error: err })
    }
}

export const deleteLink = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"Invalid Link ID"});
        }
        const userId = req.user!._id;
        const link = await Link.findOne({ _id: id, createdBy: userId });
        if (!link) {
            return res.status(404).json({
                message: "Link not found or Not Owned By You"
            })
        }

        if (link.workspace) {
            await Workspace.findByIdAndUpdate(link.workspace, { $pull: { links: link._id } });
        }

        await Link.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Link deleted Successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to Delete Link Content",
            error
        })
    }
}


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


