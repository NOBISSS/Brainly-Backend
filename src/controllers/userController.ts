import { Request, Response } from "express";
import User from "../models/userModel"
import { GenerateToken } from "../utils/generateToken";
import OTPMODAL from "../models/OTP-MODAL";
import otpGenerator from "otp-generator";
import { emailQueue } from "../queue/emailQueue";
import { oAuth2Client } from "../config/OAuth2Client";
import axios from "axios";
import redis from "../config/redis";
import { OTP_TTL } from "../constants/constant";
import crypto from "crypto";
import { hashOtp } from "../utils/hashOtp";
import { sendTelegramMessage } from "../utils/telegram";

export const sendOTP = async (req: Request, res: Response) => {
    try {
        const { email, type = "register" } = req.body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Valid Email Required"
            })
        }

        //rate limit
        const otpKey = `otp:${email}`;
        const attemptsKey = `otp_attempts:${email}`;

        const exist = await redis.exists(otpKey);
        if (exist) {
            return res.status(429).json({
                message: "OTP already sent.Please wait Before Retrying"
            });
        }

        //checking existance
        const existingUser = await User.findOne({ email });

        if (type === "register") {
            if (existingUser) {
                return res.status(401).json({
                    success: false,
                    message: "User Already Registered"
                });
            }
        }

        if (type === "forgot") {
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: "User Not Found",
                });
            }
        }

        //sending otp here
        let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        const hashedOtp = hashOtp(otp);

        await redis.set(otpKey, hashedOtp, "EX", OTP_TTL);

        //reseting attempts counter
        await redis.del(attemptsKey);

        await emailQueue.add("send-otp-email", { email, otp })

        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
        });
    } catch (error: any) {
        console.log("Error Occured WHile Sending OTP", error);
        res.status(500).json({
            success: false,
            message: "Failed to Send OTP"
        });
    }
}

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const otpKey = `otp:${email}`;
        const attemptsKey = `otp_attempts:${email}`;

        const storedHashedOtp = await redis.get(otpKey);

        if (!storedHashedOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found"
            });
        }

        const hashedIncomingOtp = hashOtp(otp);

        if (hashedIncomingOtp !== storedHashedOtp) {
            // increment attempts
            await redis.incr(attemptsKey);
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // OTP is correct → delete it
        await redis.del(otpKey);
        await redis.del(attemptsKey);

        const resetToken = crypto.randomUUID();
        await redis.set(`reset:${email}`, resetToken, "EX", 600);

        res.status(200).json({
            success: true,
            message: "OTP Verified Successfully",
            resetToken
        });
    } catch (error) {
        console.log("Verify OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
};

//google sign in
export const googleSignin = async (req: Request, res: Response) => {
    try {
        const code = req.query.code;

        if (!req.query.code) {
            return res.status(400).json({ message: "Authorization Code Missing" });
        }

        const googleResponse = await oAuth2Client.getToken(code as string);
        oAuth2Client.setCredentials(googleResponse.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`
        );

        let user = await User.findOne({ email: userRes.data.email });
        if (!user) {
            user = await User.create({
                username: userRes.data.name,
                email: userRes.data.email,
                method: "oauth",
            });
        }
        const accessToken = GenerateToken(user._id.toString());
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: <"none">"none",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
        res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .json({ message: "signin successfull", user });
        return;
    } catch (err: any) {
        res
            .status(500)
            .json({ message: err.message || "Something went wrong from ourside" });
    }
};

//REGISTER USER
export const registerUser = async (req: Request, res: Response) => {
    try {

        const { name, email, password, gender, otp } = req.body;
        const otpKey = `otp:${email}`;
        const attemptsKey = `otp_attempts:${email}`;

        if (!name || !email || !password || !otp)
            return res.status(400).json({ success: false, message: "All Fields are required" });

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "User Already Exists" });
        }

        const storedHashedOtp = await redis.get(`otp:${email}`);

        if (!storedHashedOtp) {
            return res.status(400).json({ message: "OTP Expired or not found" });
        }

        const attempts = await redis.incr(attemptsKey);

        if (attempts === 1) {
            await redis.expire(attemptsKey, 5 * 60);
        }

        if (attempts > 5) {
            await redis.del(otpKey);
            await redis.del(attemptsKey);
            return res.status(429).json({
                message: "Too Many Attempts.OTP invalidated",
            })
        }

        const hashedInputOtp = hashOtp(otp);

        if (storedHashedOtp !== hashedInputOtp) {
            return res.status(400).json({ message: "Invalid Otp" });
        }

        const user = await User.create({ name, email: email.toLowerCase(), password, gender });
        await redis.del(`otp:${email}`);

        const token = GenerateToken(user._id.toString());

        sendTelegramMessage(`🎉 <b>New User Registered</b>
Name: ${user.name}
Email: ${user.email}
`);

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            data: { user: { name: user.name, email: user.email, gender: user.gender, token } }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error Registering User", err })
    }
}

//LOGIN USER
export const loginUser = async (req: Request, res: Response) => {
    try {
        //get Details from body
        const { email, password } = req.body;

        //Validate
        if (!email || !password)
            return res.status(400).json({ success: false, message: "All Fields are required" });

        //Verify
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Please Enter Valid Credentials"
            })
        }

        //@ts-ignore
        const token = GenerateToken(user._id.toString());

        res.cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        sendTelegramMessage(`🎉 <b>New User Logged</b>
Name: ${user.name}
Email: ${user.email}
`);
        //success/failure response
        return res.json({
            success: true,
            message: "Login Successful",
            data: { user: { name: user.name, email: user.email } }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error Logging in",
            err
        });
    }
}

//Get Current User Profile
export const getProfile = async (req: Request, res: Response) => {
    return res.json({ success: true, data: req.user });
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword, confirmPassword, resetToken } = req.body;

        if (!email || !newPassword || !confirmPassword || !resetToken) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        // 🔥 VERIFY RESET TOKEN (NOT OTP)
        const storedToken = await redis.get(`reset:${email}`);

        if (!storedToken || storedToken !== resetToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset session",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.password = newPassword;
        await user.save();

        // 🔥 delete reset session
        await redis.del(`reset:${email}`);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch (error) {
        console.log("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
