import mongoose,{Schema,Document} from "mongoose";

export interface IWorkspace extends Document{
    name:string;
    description?:string;
    owner:mongoose.Types.ObjectId;
    members:mongoose.Types.ObjectId[];
    links:mongoose.Types.ObjectId[];
    createdAt?:Date;
    updatedAt?:Date;
}

const workspaceSchema=new Schema<IWorkspace>({
    name:{type:String,required:true,trim:true},
    description:{type:String,trim:true},
    owner:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
    members:[{type:Schema.Types.ObjectId,ref:"User"}],
    links: [{ type: Schema.Types.ObjectId, ref: "Link" }],
},{
    timestamps:true
});

workspaceSchema.index({owner:1,createdAt:-1});
workspaceSchema.index({members:1});
workspaceSchema.index({"links":1});

export default mongoose.model<IWorkspace>("Workspace",workspaceSchema);