"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.canResendOTP = exports.getOTPData = exports.saveOTP = exports.generateOTP = void 0;
const redis_js_1 = __importDefault(require("../config/redis.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const OTP_TTL = 5 * 60; //5min
const RESEND_BLOCK_TIME = 120; //2min
//GENERATE OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
//SAVE OTP IN REDIS
const saveOTP = async ({ email, otp, data = {}, }) => {
    const existing = (await (0, exports.getOTPData)(email)) || {};
    const hashedOtp = await bcryptjs_1.default.hash(otp, 10);
    const payload = {
        ...existing,
        ...data, //for temporary variables like flag or something
        otp: hashedOtp,
    };
    await redis_js_1.default.set(`otp:${email}`, JSON.stringify(payload), "EX", OTP_TTL);
};
exports.saveOTP = saveOTP;
//GET OTPDATA FROM REDIS
const getOTPData = async (email) => {
    const data = await redis_js_1.default.get(`otp:${email}`);
    return data ? JSON.parse(data) : null;
};
exports.getOTPData = getOTPData;
//CHECK RESEND ELIGIBILITY
const canResendOTP = async (email) => {
    const ttl = await redis_js_1.default.ttl(`otp:${email}`);
    return ttl <= OTP_TTL - RESEND_BLOCK_TIME;
};
exports.canResendOTP = canResendOTP;
//verifyOTP
const verifyOTP = async (email, userOtp) => {
    const data = await (0, exports.getOTPData)(email);
    if (!data)
        return null;
    const isValid = await bcryptjs_1.default.compare(userOtp, data.otp);
    if (!isValid)
        return null;
    await redis_js_1.default.del(`otp:${email}`);
    return data;
};
exports.verifyOTP = verifyOTP;
