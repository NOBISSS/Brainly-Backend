"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTelegramMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const sendTelegramMessage = async (message) => {
    try {
        await axios_1.default.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML"
        });
        console.log("MESSAGE SEND SUCCSSFULLY");
    }
    catch (error) {
        console.log("TELEGRAM FAILED:", error.message);
    }
};
exports.sendTelegramMessage = sendTelegramMessage;
