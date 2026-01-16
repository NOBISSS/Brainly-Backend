import crypto from "crypto";

export const hashOtp = (otp: string) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};
