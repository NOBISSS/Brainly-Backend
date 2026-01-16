import mongoose, { Schema } from "mongoose";

export interface IOTP extends Document{
    email:String;
    otp:String;
    createdAt:Date;
}

const OTPSchema=new Schema<IOTP>({
    email:{
        type:String,
        required:true,
        index:true
    },
    otp:{
        type:String,
        required:true,
    },
    },
    {
        timestamps:true,
        expires:2*60,
    },
);

OTPSchema.index({email:1,createdAt:-1});

export default mongoose.model<IOTP>("OTP",OTPSchema);

