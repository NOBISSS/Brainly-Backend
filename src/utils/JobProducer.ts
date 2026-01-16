import Bull from "bull";

const emailQueue=new Bull('email');


type EmailType={
    from:string;
    to:string;
    subject:string;
    text:string;
}

export const sendNewmail=async (email:EmailType)=>{
    emailQueue.add({...email});
}