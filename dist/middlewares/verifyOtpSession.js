"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpSession = void 0;
const verifyOtpSession = (req, res, next) => {
    const otpData = req.cookies?.otp_data;
    if (!otpData || !otpData.email || !otpData.type) {
        return res.status(401).json({
            message: "OTP session expired or invalid",
        });
    }
    next();
};
exports.verifyOtpSession = verifyOtpSession;
