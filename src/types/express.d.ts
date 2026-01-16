import { IUser } from "../models/userModel";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}
