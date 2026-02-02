import {Queue,Worker} from "bullmq";
import redis from "../config/redis";
import { mailSender } from "../utils/mailSender";
import {otpTemp} from "../mail/templates/otpTemplate";

export const emailQueue=new Queue("email-queue",{
    connection:redis,
    defaultJobOptions:{
        attempts:3,
        backoff:{type:"exponential",delay:5000},
        removeOnComplete:true,
        removeOnFail:false,
    }
});

new Worker(
    "email-queue",
    async(job)=>{
        const {email,otp}=job.data;
        const html=otpTemp(otp);
        await mailSender({email,title:"Your Brainly OTP Code",body:html});
        
    },
    {
        connection:redis,
        concurrency:10
    }
);

process.on("SIGINT",async()=>{
    await emailQueue.close();
    process.exit();
})

