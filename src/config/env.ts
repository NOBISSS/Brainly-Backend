import dotenv from "dotenv";
dotenv.config();

interface Env{
    PORT:number;
    MONGO_URI:string;
    JWT_SECRET:string;
    NODE_ENV:"development" | "production"
}

const getEnv=():Env=>{
    const PORT=Number(process.env.PORT) || 3000;
    const MONGO_URI=process.env.MONGO_URI;
    const JWT_SECRET=process.env.JWT_SECRET;
     const NODE_ENV = process.env.NODE_ENV as "development" | "production" | undefined;

    if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI is missing");
  }

  if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is missing");
  }

  if (!NODE_ENV || !["development", "production"].includes(NODE_ENV)) {
    throw new Error("❌ NODE_ENV must be 'development' or 'production'");
  }

    if(!MONGO_URI || !JWT_SECRET){
        throw new Error("Missing Required Environment Variables");
    }
    return {PORT,MONGO_URI,JWT_SECRET,NODE_ENV}
};

export const env=getEnv();