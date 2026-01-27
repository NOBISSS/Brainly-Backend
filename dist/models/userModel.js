"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: { type: String, required: true, minLength: 6 },
    avatar: {
        type: String,
        default: function () {
            if (this.gender === "male") {
                return "https://res.cloudinary.com/dc9ukfxel/image/upload/v1768054837/portrait-man-cartoon-style_wdsudf.jpg";
            }
            return "https://res.cloudinary.com/dc9ukfxel/image/upload/v1768055060/portrait-3d-female-doctor_zvp3yq.jpg";
        }
    }
}, { timestamps: true });
//HASH PASSWORD BEFORE SAVING
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
//THIS METHOD IS USED FOR COMPARE PASSWORD
userSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
