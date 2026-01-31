import { Request, Response, NextFunction } from "express";
import { isAdmin } from "../utils/isAdmin";

export const workspaceOwner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;
  const workspace = req.workspace;

  if (!workspace) {
    return res.status(500).json({ message: "Workspace not attached" });
  }

  // admin bypass
  if (isAdmin(user)) return next();

  if (workspace.owner.toString() !== user._id.toString()) {
    return res.status(403).json({
      message: "Only owner allowed",
    });
  }

  next();
};
