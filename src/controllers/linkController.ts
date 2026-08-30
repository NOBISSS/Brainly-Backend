import { Request, Response } from "express";
import Link from "../models/linkModel";
import Workspace from "../models/workspaceModel";
import ogs from "open-graph-scraper";
import mongoose from "mongoose";

import { getPlatformThumbnail } from "../utils/getPlantformThumbnail";
import { getFavicon } from "../utils/getFavicon";
import { DEFAULT_THUMBNAIL } from "../constants/constant";

import { io } from "../index";

export const createLink = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            title,
            url,
            category,
            tags,
            workspace,
        } = req.body;

        const userId = req.user!._id;

        if (!url || !category) {
            return res.status(400).json({
                success: false,
                message: "URL and Category are required",
            });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL",
            });
        }

        let workspaceId:
            | mongoose.Types.ObjectId
            | null = null;

        if (workspace) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    workspace
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Workspace ID",
                });
            }

            workspaceId =
                new mongoose.Types.ObjectId(workspace);
        }

        if (workspaceId) {
            const ws = await Workspace.findOne({
                _id: workspaceId,
                $or: [
                    { owner: userId },
                    { members: userId },
                ],
            });

            if (!ws) {
                return res.status(403).json({
                    success: false,
                    message: "No access to this workspace",
                });
            }
        }

        const duplicate = await Link.findOne({
            url,
            createdBy: userId,
            workspace: workspaceId || null,
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message:
                    "You've already saved this link in this workspace",
            });
        }

        const recentDuplicate = await Link.findOne({
            url,
            workspace: workspaceId || null,
            createdAt: {
                $gte: new Date(
                    Date.now() - 10000
                ),
            },
        });

        if (recentDuplicate) {
            return res.status(409).json({
                success: false,
                message:
                    "Link is already being created. Please wait.",
            });
        }

        let thumbnail = DEFAULT_THUMBNAIL;
        let fetchedTitle = title;

        try {
            const { result } = await ogs({
                url,
                timeout: 3000,
                onlyGetOpenGraphInfo: true,
            });

            if (result.success) {
                thumbnail =
                    result.ogImage?.[0]?.url ||
                    getPlatformThumbnail(url) ||
                    getFavicon(url) ||
                    DEFAULT_THUMBNAIL;

                fetchedTitle =
                    result.ogTitle ||
                    fetchedTitle;
            }
        } catch (error) {
            console.log(
                "OG Fetch Failed:",
                url
            );
        }

        const link = await Link.create({
            createdBy: userId,
            title:
                fetchedTitle ||
                title ||
                "Untitled",
            url,
            category:
                String(category).toUpperCase(),
            tags: Array.isArray(tags)
                ? tags
                : [],
            workspace: workspaceId || null,
            thumbnail,
        });

        const populatedLink =
            await Link.findById(link._id)
                .populate(
                    "createdBy",
                    "name avatar email"
                )
                .lean();

        if (workspaceId) {
            await Workspace.findByIdAndUpdate(
                workspaceId,
                {
                    $addToSet: {
                        links: link._id,
                    },
                }
            );

            io.to(workspaceId.toString()).emit(
                "link:new",
                populatedLink
            );
        }

        return res.status(201).json({
            success: true,
            message: "Link Created Successfully",
            data: populatedLink,
        });
    } catch (error: any) {
        console.error(
            "CREATE LINK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Error Occurred While Creating Link",
            error:
                error?.message ||
                error,
        });
    }
};

export const getLinks = async (
    req: Request,
    res: Response
) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user!._id;

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "Workspace ID is required",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                workspaceId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Workspace ID",
            });
        }

        const workspace =
            await Workspace.findOne({
                _id: workspaceId,
                $or: [
                    { owner: userId },
                    { members: userId },
                ],
            });

        if (!workspace) {
            return res.status(404).json({
                success: false,
                message:
                    "Access denied or workspace not found",
            });
        }

        const links = await Link.find({
            workspace: workspaceId,
        })
            .populate(
                "createdBy",
                "name avatar"
            )
            .sort({
                createdAt: -1,
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: links.length,
            data: links,
        });
    } catch (error: any) {
        console.error(
            "GET LINKS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error Fetching Links",
            error:
                error?.message ||
                error,
        });
    }
};

export const deleteLink = async (
    req: Request,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Link ID",
            });
        }

        const userId = req.user!._id;

        const ownedWorkspaceIds =
            await Workspace.find({
                owner: userId,
            }).distinct("_id");

        const link = await Link.findOne({
            _id: id,
            $or: [
                { createdBy: userId },
                {
                    workspace: {
                        $in: ownedWorkspaceIds,
                    },
                },
            ],
        });

        if (!link) {
            return res.status(404).json({
                success: false,
                message: "Link not owned by you",
            });
        }

        const workspaceId =
            link.workspace?.toString();

        if (workspaceId) {
            await Workspace.findByIdAndUpdate(
                workspaceId,
                {
                    $pull: {
                        links: link._id,
                    },
                }
            );
        }

        await Link.findByIdAndDelete(id);

        if (workspaceId) {
            io.to(workspaceId).emit(
                "link:deleted",
                {
                    linkId: id,
                }
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "Link deleted successfully",
            data: {
                linkId: id,
            },
        });
    } catch (error: any) {
        console.error(
            "DELETE LINK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to Delete Link Content",
            error:
                error?.message ||
                error,
        });
    }
};