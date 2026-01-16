import nodemailer from "nodemailer";
import { Resend } from "resend";

//const resend=new Resend(process.env.RESEND_API_KEY);

interface emailProps {
    email: string;
    title: string;
    body: string;
}

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
export const mailSender = async ({ email, title, body }: emailProps) => {
    try {
        const transporter = nodemailer.createTransport({
            //host: "smtp.gmail.com",
            // port: 587,
            // secure: false,
            service: "gmail",
            auth: {
                user: MAIL_USER,
                pass: MAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: "Brainly",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        console.log("TRANSPORTER:",transporter,"\n info:",info);
        return info;
    } catch (error: any) {
        console.log("Error occured while sending mail to user", error);
        throw error;
    }
}