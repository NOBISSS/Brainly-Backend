"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailSender = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
//const MAIL_USER = process.env.MAIL_USER;
//const MAIL_PASS = process.env.MAIL_PASS;
const mailSender = async ({ email, title, body }) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            //host: "smtp.gmail.com",
            // port: 587,
            // secure: false,
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
        let info = await transporter.sendMail({
            from: "Brainly",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        });
        console.log("TRANSPORTER:", transporter, "\n info:", info);
        return info;
    }
    catch (error) {
        console.log("Error occured while sending mail to user", error);
        throw error;
    }
};
exports.mailSender = mailSender;
