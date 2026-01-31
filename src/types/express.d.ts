import { IUser } from "../models/userModel";
import { IWorkspace } from "../models/workspaceModel";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      workspace?:IWorkspace
    }
  }
}

export {};
