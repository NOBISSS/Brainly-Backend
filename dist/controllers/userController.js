"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.getProfile = exports.loginUser = exports.registerUser = exports.googleSignin = exports.verifyOTP = exports.sendOTP = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const generateToken_1 = require("../utils/generateToken");
const otp_generator_1 = __importDefault(require("otp-generator"));
const emailQueue_1 = require("../queue/emailQueue");
const OAuth2Client_1 = require("../config/OAuth2Client");
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../config/redis"));
const constant_1 = require("../constants/constant");
const crypto_1 = __importDefault(require("crypto"));
const hashOtp_1 = require("../utils/hashOtp");
const telegram_1 = require("../utils/telegram");
const sendOTP = async (req, res) => {
    try {
        const { email, type = "register" } = req.body;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Valid Email Required"
            });
        }
        //rate limit
        const otpKey = `otp:${email}`;
        const attemptsKey = `otp_attempts:${email}`;
        const exist = await redis_1.default.exists(otpKey);
        if (exist) {
            return res.status(429).json({
                message: "OTP already sent.Please wait Before Retrying"
            });
        }
        //checking existance
        const existingUser = await userModel_1.default.findOne({ email });
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
        let otp = otp_generator_1.default.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        const hashedOtp = (0, hashOtp_1.hashOtp)(otp);
        await redis_1.default.set(otpKey, hashedOtp, "EX", constant_1.OTP_TTL);
        //reseting attempts counter
        await redis_1.default.del(attemptsKey);
        await emailQueue_1.emailQueue.add("send-otp-email", { email, otp });
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
        });
    }
    catch (error) {
        console.log("Error Occured WHile Sending OTP", error);
        res.status(500).json({
            success: false,
            message: "Failed to Send OTP"
        });
    }
};
exports.sendOTP = sendOTP;
const verifyOTP = async (req, res) => {
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
        const storedHashedOtp = await redis_1.default.get(otpKey);
        if (!storedHashedOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found"
            });
        }
        const hashedIncomingOtp = (0, hashOtp_1.hashOtp)(otp);
        if (hashedIncomingOtp !== storedHashedOtp) {
            // increment attempts
            await redis_1.default.incr(attemptsKey);
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        // OTP is correct → delete it
        await redis_1.default.del(otpKey);
        await redis_1.default.del(attemptsKey);
        const resetToken = crypto_1.default.randomUUID();
        await redis_1.default.set(`reset:${email}`, resetToken, "EX", 600);
        res.status(200).json({
            success: true,
            message: "OTP Verified Successfully",
            resetToken
        });
    }
    catch (error) {
        console.log("Verify OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
};
exports.verifyOTP = verifyOTP;
//google sign in
const googleSignin = async (req, res) => {
    try {
        const code = req.query.code;
        if (!req.query.code) {
            return res.status(400).json({ message: "Authorization Code Missing" });
        }
        const googleResponse = await OAuth2Client_1.oAuth2Client.getToken(code);
        OAuth2Client_1.oAuth2Client.setCredentials(googleResponse.tokens);
        const userRes = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`);
        let user = await userModel_1.default.findOne({ email: userRes.data.email });
        if (!user) {
            user = await userModel_1.default.create({
                username: userRes.data.name,
                email: userRes.data.email,
                method: "oauth",
            });
        }
        const accessToken = (0, generateToken_1.GenerateToken)(user._id.toString());
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        };
        res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .json({ message: "signin successfull", user });
        return;
    }
    catch (err) {
        res
            .status(500)
            .json({ message: err.message || "Something went wrong from ourside" });
    }
};
exports.googleSignin = googleSignin;
//REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, password, gender, otp } = req.body;
        const otpKey = `otp:${email}`;
        const attemptsKey = `otp_attempts:${email}`;
        if (!name || !email || !password || !otp)
            return res.status(400).json({ success: false, message: "All Fields are required" });
        const exists = await userModel_1.default.findOne({ email });
        if (exists) {
            return res.status(409).json({ message: "User Already Exists" });
        }
        const storedHashedOtp = await redis_1.default.get(`otp:${email}`);
        if (!storedHashedOtp) {
            return res.status(400).json({ message: "OTP Expired or not found" });
        }
        const attempts = await redis_1.default.incr(attemptsKey);
        if (attempts === 1) {
            await redis_1.default.expire(attemptsKey, 5 * 60);
        }
        if (attempts > 5) {
            await redis_1.default.del(otpKey);
            await redis_1.default.del(attemptsKey);
            return res.status(429).json({
                message: "Too Many Attempts.OTP invalidated",
            });
        }
        const hashedInputOtp = (0, hashOtp_1.hashOtp)(otp);
        if (storedHashedOtp !== hashedInputOtp) {
            return res.status(400).json({ message: "Invalid Otp" });
        }
        const user = await userModel_1.default.create({ name, email: email.toLowerCase(), password, gender });
        await redis_1.default.del(`otp:${email}`);
        const token = (0, generateToken_1.GenerateToken)(user._id.toString());
        (0, telegram_1.sendTelegramMessage)(`🎉 <b>New User Registered</b>
Name: ${user.name}
Email: ${user.email}
`);
        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            data: { user: { name: user.name, email: user.email, gender: user.gender, token } }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error Registering User", err });
    }
};
exports.registerUser = registerUser;
//LOGIN USER
const loginUser = async (req, res) => {
    try {
        //get Details from body
        const { email, password } = req.body;
        //Validate
        if (!email || !password)
            return res.status(400).json({ success: false, message: "All Fields are required" });
        //Verify
        const user = await userModel_1.default.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Please Enter Valid Credentials"
            });
        }
        //@ts-ignore
        const token = (0, generateToken_1.GenerateToken)(user._id.toString());
        res.cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        (0, telegram_1.sendTelegramMessage)(`🎉 <b>New User Logged</b>
Name: ${user.name}
Email: ${user.email}
`);
        //success/failure response
        return res.json({
            success: true,
            message: "Login Successful",
            data: { user: { name: user.name, email: user.email } }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Error Logging in",
            err
        });
    }
};
exports.loginUser = loginUser;
//Get Current User Profile
const getProfile = async (req, res) => {
    return res.json({ success: true, data: req.user });
};
exports.getProfile = getProfile;
const resetPassword = async (req, res) => {
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
        const storedToken = await redis_1.default.get(`reset:${email}`);
        if (!storedToken || storedToken !== resetToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset session",
            });
        }
        const user = await userModel_1.default.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        user.password = newPassword;
        await user.save();
        // 🔥 delete reset session
        await redis_1.default.del(`reset:${email}`);
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch (error) {
        console.log("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.resetPassword = resetPassword;
