"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddlware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("./config/env");
const userMiddlware = (req, res, next) => {
    const header = req.headers["authorization"];
    try {
        const decoded = jsonwebtoken_1.default.verify(header, env_1.env.JWT_SECRET);
        if (decoded) {
            //@ts-ignore
            req.userId = decoded.id;
            next();
        }
        else {
            res.status(403).json({
                message: "You are not logged Please Logged in"
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            message: "FAILED TO VERIFY TOKEN ",
            error
        });
    }
};
exports.userMiddlware = userMiddlware;
//override the types of the express request object
