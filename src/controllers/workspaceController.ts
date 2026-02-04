import { Request,Response } from "express";
import Workspace from "../models/workspaceModel";
import Link from "../models/linkModel";
import User from "../models/userModel";
import mongoose, { Types } from "mongoose";
import { sendTelegramMessage } from "../utils/telegram";
import { io } from "../index";
//create Workspace
export const createWorkspace = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name is Required" });

        const exists = await Workspace.findOne({
            owner: req.user!._id,
            name
        })

        if (exists) {
            return res.status(409).json({
                message: "Workspace With This Name Already Exists"
            })
        }

        const workspace = await Workspace.create({
            name,
            description,
            owner: req.user!._id,
            members: [req.user!._id]
        });

sendTelegramMessage(`📂 <b>New Workspace Created</b>
<b>Name:</b> ${workspace.name}
<b>Owner:</b> ${req.user!.email}
<b>Members:</b> ${workspace.members.length}
`);

// send only to owner initially
// io.to(workspace.owner._id.toString()).emit("workspaceCreated", workspace);


        res.status(201).json(
            {
                success: true,
                message: "Workspace Created",
                data: workspace
            });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to Create Workspace", error })
    }
}

//Get All Workspace
export const getWorkspaces = async (req: Request, res: Response) => {
    try {
        const workspaces = await Workspace.find({
            $or: [{ owner: req.user!._id }, { members: req.user!._id }],
        })
            .populate("owner", "name email")
            .populate("members", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: workspaces });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch Workspaces", error })
    }
}

//updated
export const getWorkspaceById = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.workspace
  });
};

//updated
export const addCollaborator = async (req: Request, res: Response) => {
  try {
    const workspace = req.workspace!; // 🔥 from middleware
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMember = workspace.members.some(
      (m: any) => m.toString() === user._id.toString()
    );

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
  } catch (error) {
    res.status(500).json({ error });
  }
};

//new
export const removeCollaborator = async (req: Request, res: Response) => {
  try {
    const workspace = req.workspace!;
    const { userId } = req.params;
    const requesterId = req.user!._id.toString();

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

    await Workspace.updateOne(
      { _id: workspace._id },
      { $pull: { members: userId } }
    );

    // io.to(workspace._id.toString()).emit("memberRemoved",user);

    return res.json({
      success: true,
      message: "Collaborator removed successfully",
      data:workspace
    });

  } catch (error: any) {
    console.error("Remove collaborator error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove collaborator",
    });
  }
};

//new
export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const workspace = req.workspace!;

    //io.emit("workspaceDeleted", workspace._id);

    await Link.deleteMany({ workspace: workspace._id });
    await workspace.deleteOne();

    res.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};