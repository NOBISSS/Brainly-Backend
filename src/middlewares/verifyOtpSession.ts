import type { Request, Response, NextFunction } from "express";

export const verifyOtpSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const otpData = req.cookies?.otp_data;

  if (!otpData || !otpData.email || !otpData.type) {
    return res.status(401).json({
      message: "OTP session expired or invalid",
    });
  }

  next();
};
