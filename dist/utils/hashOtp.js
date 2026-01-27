"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const hashOtp = (otp) => {
    return crypto_1.default
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};
exports.hashOtp = hashOtp;
