"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewmail = void 0;
const bull_1 = __importDefault(require("bull"));
const emailQueue = new bull_1.default('email');
const sendNewmail = async (email) => {
    emailQueue.add({ ...email });
};
exports.sendNewmail = sendNewmail;
