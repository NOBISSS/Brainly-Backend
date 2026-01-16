import redis from "../config/redis.js";
import bcrypt from "bcryptjs";

const OTP_TTL=5*60;//5min
const RESEND_BLOCK_TIME=120; //2min


//GENERATE OTP
export const generateOTP= ()=> {
    return Math.floor(100000+Math.random()*900000).toString();
};


//SAVE OTP IN REDIS
export const saveOTP=async({
    email,
    otp,
    data={},
}: {email:string;otp:string;data?:Record<string,any>})=>{
    const existing=(await getOTPData(email)) || {};
    const hashedOtp=await bcrypt.hash(otp,10);
    const payload={
        ...existing,
        ...data,//for temporary variables like flag or something
        otp:hashedOtp,
    };

    await redis.set(`otp:${email}`,JSON.stringify(payload),"EX",OTP_TTL);
};


//GET OTPDATA FROM REDIS
export const getOTPData=async(email:string)=>{
    const data=await redis.get(`otp:${email}`);
    return data?JSON.parse(data):null;
};

//CHECK RESEND ELIGIBILITY
export const canResendOTP=async(email:string)=>{
    const ttl=await redis.ttl(`otp:${email}`);
    return ttl<=OTP_TTL-RESEND_BLOCK_TIME;
};


//verifyOTP
export const verifyOTP=async (email:string,userOtp:string)=>{
    const data=await getOTPData(email);
    if(!data) return null;

    const isValid=await bcrypt.compare(userOtp,data.otp);
    if(!isValid) return null;

    await redis.del(`otp:${email}`);
    return data;
};

