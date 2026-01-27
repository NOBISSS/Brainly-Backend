"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const process_1 = require("process");
//@ts-ignore
const GenerateToken = (id) => {
    const payload = {
        id
    };
    const options = {
        expiresIn: "7d"
    };
    //@ts-ignore
    const token = jsonwebtoken_1.default.sign(payload, process_1.env.JWT_SECRET, options);
    return token;
};
exports.GenerateToken = GenerateToken;
