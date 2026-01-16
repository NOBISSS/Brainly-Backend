import mongoose,{Schema,Document} from "mongoose";

export interface IBlock extends Document{
    title:string;
    link:string;
    type:"youtube" | "tweet" | "doc" | "link";
    tags?:string[];
    createdBy:mongoose.Types.ObjectId;
    workspaceId?:mongoose.Types.ObjectId;
}

const blockSchema=new Schema<IBlock>({
    title:{type:String,required:true},
    link:{type:String,required:true},
    type:{type:String,enum:["youtube","tweet","doc","link"],default:"link"},
    tags:[{type:String}],
    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
    workspaceId:{type:Schema.Types.ObjectId,ref:"Workspace"}
});

export default mongoose.model<IBlock>("Block",blockSchema);