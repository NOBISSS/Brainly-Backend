import mongoose, { model, Schema } from "mongoose";

export const connectDB=async()=>{
    try{
        const uri=process.env.MONGO_URI;
        if(!uri){
            throw new Error("MONGO_URI is not defined");
        }
        //@ts-ignore
        await mongoose.connect(uri);
        console.log("✅MongoDB Connected");
    }catch(err){
        console.error("❌MongoDB Connection Error:",err)
        process.exit(1);
    }
}