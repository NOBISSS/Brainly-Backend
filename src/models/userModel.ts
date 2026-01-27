import mongoose, { Schema, model, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    _id: Types.ObjectId,
    name: string;
    email: string;
    gender: string;
    password: string;
    avatar: string;
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    gender:{
        type:String,
        enum:["male","female","other"],
        required:true,
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
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

//THIS METHOD IS USED FOR COMPARE PASSWORD
userSchema.methods.comparePassword = async function (candidate: string) {

    return bcrypt.compare(candidate, this.password);
}

const User=model<IUser>("User",userSchema);
export default User;