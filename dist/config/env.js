"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnv = () => {
    const PORT = Number(process.env.PORT) || 3000;
    const MONGO_URI = process.env.MONGO_URI;
    const JWT_SECRET = process.env.JWT_SECRET;
    const NODE_ENV = process.env.NODE_ENV;
    if (!MONGO_URI) {
        throw new Error("❌ MONGO_URI is missing");
    }
    if (!JWT_SECRET) {
        throw new Error("❌ JWT_SECRET is missing");
    }
    if (!NODE_ENV || !["development", "production"].includes(NODE_ENV)) {
        throw new Error("❌ NODE_ENV must be 'development' or 'production'");
    }
    if (!MONGO_URI || !JWT_SECRET) {
        throw new Error("Missing Required Environment Variables");
    }
    return { PORT, MONGO_URI, JWT_SECRET, NODE_ENV };
};
exports.env = getEnv();
