import { Request,Response } from "express";
import Workspace from "../models/workspaceModel";
import Link from "../models/linkModel";
import User from "../models/userModel";
import mongoose, { Types } from "mongoose";

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

//old
// export const getWorkspaceById = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const workspace = await Workspace.findOne({
//             _id: id,
//             $or: [{ owner: req.user!._id }, { members: req.user!._id }],
//         })
//             .populate("owner", "name email")
//             .populate("members", "name email")
//             .populate("links");

//         if (!workspace) return res.status(404).json({ message: "Workspace not found" });

//         const isMember = workspace.members.some((m) => m._id.toString() === req.user!._id.toString());

//         if (!isMember && workspace.owner.toString() !== req.user!._id.toString()) {
//             return res.status(403).json({ success: false, message: "Access Denied" })
//         }

//         res.status(200).json({ success: true, data: workspace })
//     } catch (error) {
//         res.status(500).json({ message: "Error Fetching Workspaces", error })
//     }
// }

//Add Collaborator

//updated
export const getWorkspaceById = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.workspace
  });
};

//old
// export const addCollaborator = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         //const {userId}=req.body;
//         const { email } = req.body;
//         //Check Wheather particular user is exist on system or not
//         const workspace = await Workspace.findById(id);
//         if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found" });
//         if (workspace.owner.toString() !== req.user!._id.toString()) {
//             return res.status(403).json({ success: false, message: "Only Owner can Add Members" });
//         }


//         const user = await User.findOne({ email: email.toLowerCase() })
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not Found"
//             })
//         }


//         const isMember = workspace.members.some((m) => m.toString() === user._id.toString());

//         if (isMember) {
//             return res.status(400).json({ success: false, message: "User Already in Workspace" });
//         }

//         workspace.members.push(user._id as Types.ObjectId);
//         await workspace.save();

//         res.status(200).json({ success: true, message: "Collaborator Added", data: workspace });
//     } catch (error) {
//         res.status(500).json({
//             message: "Failed to Add Member in workspace",
//             error
//         })
//     }
// };

//Remove Collaborator

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

    res.json({
      success: true,
      message: "Collaborator added",
      data: workspace,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};


//old
// export const removeCollaborator = async (req: Request, res: Response) => {
//     try {
//         const { id, userId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "Invalid Workspace ID" });
//         }
//         const workspace = await Workspace.findById(id);

//         if (!workspace) return res.status(404).json({
//             message: "Workspace Not Found"
//         })

//         if (userId === workspace.owner.toString()) {
//             return res.status(400).json({
//                 message: "Owner Cannot be Removed",
//             })
//         }

//         //check that owner id 
//         if (workspace.owner.toString() !== req.user!._id.toString())
//             return res.status(403).json({ message: "Only Owner Can Remove Collaborator" });

//         await Workspace.findByIdAndUpdate(
//             id,
//             { $addToSet: { members: userId } }
//         );


//         res.status(200).json({ success: true, message: "Collaborator Removed", data: workspace });
//     } catch (error) {
//         res.status(500).json({ message: "Failed to remove Collaborator", error })
//     }
// }

//new
export const removeCollaborator = async (req: Request, res: Response) => {
  try {
    const workspace = req.workspace!;
    const { userId } = req.params;

    if (userId === workspace.owner.toString()) {
      return res.status(400).json({
        message: "Owner cannot be removed",
      });
    }

    workspace.members = workspace.members.filter(
      (m: any) => m.toString() !== userId
    );

    await workspace.save();

    res.json({
      success: true,
      message: "Collaborator removed",
      data: workspace,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};


// export const shareWorkspace = async (req: Request, res: Response) => {
//     const share = req.body.share;

// }

//old
// export const deleteWorkspace = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid workspace ID" });
//     }

//     const workspace = await Workspace.findById(id);
//     if (!workspace) {
//       return res.status(404).json({ message: "Workspace not found" });
//     }

//     if (workspace.owner.toString() !== req.user!._id.toString()) {
//       return res.status(403).json({
//         message: `Only owner can delete ${workspace.name} workspace`,
//       });
//     }

//     await Link.deleteMany({ workspace: id });
//     await Workspace.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: "Workspace deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to delete workspace",
//       error,
//     });
//   }
// };

//new
export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const workspace = req.workspace!;

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