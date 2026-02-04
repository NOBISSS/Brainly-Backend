import axios from "axios";

export const sendTelegramMessage=async(message:string):Promise<void>=>{
    try{
        await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
            {
                chat_id:process.env.TELEGRAM_CHAT_ID,
                text:message,
                parse_mode:"HTML"
            }
        );
        console.log("MESSAGE SEND SUCCSSFULLY");
    }catch(error:any){
        console.log("TELEGRAM FAILED:",error.message);
    }
}