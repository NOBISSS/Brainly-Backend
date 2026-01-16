import jwt from "jsonwebtoken"
import { env } from "process"

//@ts-ignore
export const GenerateToken=(id:string)=>{
    const payload={
        id
    }
    const options={
        expiresIn:"7d"
    }
    //@ts-ignore
    const token=jwt.sign(payload,env.JWT_SECRET,options)

    return token;
}