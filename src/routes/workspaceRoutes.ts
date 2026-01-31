import express from "express";
import { 
    createWorkspace,
    getWorkspaceById,
    getWorkspaces,
    addCollaborator,
    removeCollaborator,
    deleteWorkspace
 } from "../controllers/workspaceController";

import { protect } from "../middlewares/authMiddleware";
import { workspaceAccess } from "../middlewares/workspaceAccess";
import { workspaceOwner } from "../middlewares/workspaceOwner";

const router=express.Router();

router.post("/",protect,createWorkspace);

router.get("/",protect,getWorkspaces);

router.get("/:id",protect,workspaceAccess,getWorkspaceById);

router.post("/:id/collaborators",protect,workspaceAccess,workspaceOwner,addCollaborator);

router.delete("/:id/collaborators/:userId",protect,workspaceAccess,workspaceOwner,removeCollaborator);

router.delete("/:id",protect,workspaceAccess,workspaceOwner,deleteWorkspace);


export default router;

