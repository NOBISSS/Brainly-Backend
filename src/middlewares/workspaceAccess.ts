import { Request, Response, NextFunction } from "express";
import Workspace from "../models/workspaceModel";
import { isAdmin } from "../utils/isAdmin";

export const workspaceAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("ENTERED");
    const user = req.user!;

    // workspace id can come from params or body
    const workspaceId =
      req.params.id ||
      req.params.workspaceId ||
      req.body.workspace;

    const workspace=await Workspace.findById(workspaceId)
    .populate("owner","name email")
    .populate("memebers","name email");
      
    if (!workspace){
        return res.status(404).json({message:"Workspace not found"})
    }

    // ✅ ADMIN BYPASS
    if (isAdmin(user)){
        req.workspace=workspace;
        return next()
    };

    const isOwner=workspace.owner._id.toString()===user._id.toString();

    const isMember=workspace.members.some(
        (m:any)=>m._id.toString()===user._id.toString()
    );

    

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied to workspace",
      });
    }
    req.workspace=workspace;
    next();
  } catch (err) {
    next(err);
  }
};
