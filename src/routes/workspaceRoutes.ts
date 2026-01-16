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

const router=express.Router();

router.post("/",protect,createWorkspace);
router.delete("/:id",protect,deleteWorkspace);
router.get("/",protect,getWorkspaces);
router.get("/:id",protect,getWorkspaceById);
router.post("/:id/collaborators",protect,addCollaborator);
router.delete("/:id/collaborators/:userId",protect,removeCollaborator);

export default router;

