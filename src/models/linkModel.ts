import mongoose, { Schema } from "mongoose";

export interface ILink extends Document{
    createdBy:mongoose.Schema.Types.ObjectId;
    title:string;
    url:string;
    category:"YOUTUBE" | "TWEET" | "GOOGLE DOCS" | "GOOGLE SHEET" | "ARTICLE" | "GENERAL" | "CANVA";//YT,TWEET,DOC
    thumbnail:string;
    tags?:string[];
    workspace?:mongoose.Schema.Types.ObjectId | null;
    createdAt?:Date;
    updatedAt?:Date;
}

const linkSchema=new Schema<ILink>({
    title:{type:String,required:true,trim:true},
    url:{type:String,required:true,unique:true},
    thumbnail:{
        type:String,
        default:"https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500"
    },
    category:{
        type:String,
        default:"GENERAL",
        enum:["YOUTUBE","TWEET","GOOGLE DOCS","GOOGLE SHEET","ARTICLE","GENERAL","CANVA"]
    },
    tags:{type:[String],default:[]},
    workspace:{type:Schema.Types.ObjectId,ref:"Workspace",index:true},
    createdBy:{type:Schema.Types.ObjectId,ref:"User",required:true},
},{timestamps:true}
)

linkSchema.index({user:1,createdAt:-1});
linkSchema.index({workspace:1});
linkSchema.index({tags:1});
linkSchema.index({user:1,url:1},{unique:true});

export default mongoose.model<ILink>("Link",linkSchema);