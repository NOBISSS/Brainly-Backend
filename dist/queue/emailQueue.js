"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const mailSender_1 = require("../utils/mailSender");
const otpTemplate_1 = require("../mail/templates/otpTemplate");
exports.emailQueue = new bullmq_1.Queue("email-queue", {
    connection: redis_1.default,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
    }
});
new bullmq_1.Worker("email-queue", async (job) => {
    const { email, otp } = job.data;
    const html = (0, otpTemplate_1.otpTemp)(otp);
    await (0, mailSender_1.mailSender)({ email, title: "Your Brainly OTP Code", body: html });
    console.log(`OTP email sent to ${email}`);
}, {
    connection: redis_1.default,
    concurrency: 10
});
process.on("SIGINT", async () => {
    await exports.emailQueue.close();
    process.exit();
});
