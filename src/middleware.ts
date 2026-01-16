import { NextFunction,Response,Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "./config/env";



export const userMiddlware=(req:Request,res:Response,next:NextFunction)=>{
    const header=req.headers["authorization"];
    try{
    const decoded=jwt.verify(header as string,env.JWT_SECRET);
    if(decoded){
        //@ts-ignore
        req.userId=decoded.id;
        next();
    }else{
        res.status(403).json({
            message:"You are not logged Please Logged in"
        })
    }
    }catch(error){
        return res.status(500).json({
            message:"FAILED TO VERIFY TOKEN ",
            error
        })
    }
    

}

//override the types of the express request object