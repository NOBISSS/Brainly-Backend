import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import "./queue/emailQueue";
import cookieParser from "cookie-parser";
//Routers
import http from "http";
import {Server} from "socket.io";
import userRoutes from "./routes/userRoutes";
import linkRoutes from "./routes/linkRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";
import adminRoutes from "./routes/adminRoutes";
const app=express();
app.set("trust proxy",1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://second-brainly-jet.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// allow prefligh
//app.options("/*",cors());

// app.use(cors({
//   origin: true,
//   credentials: true
// }));


app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/health",(_,res)=>{
  res.status(200).json({status:"Ok"});
})

//Routes
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/admin",adminRoutes);
app.use("/api/links",linkRoutes);
app.use("/api/workspaces",workspaceRoutes);

const httpServer=http.createServer(app);

export const io=new Server(httpServer,{
  cors:{
    origin:allowedOrigins,
    credentials:true,
  }
})

io.on("connection",(socket)=>{
  console.log("🟢 socket connected:",socket.id);

  socket.on("joinWorkspace",(workspaceId:string)=>{
    socket.join(workspaceId);
    console.log(`Joined room ${workspaceId}`)
  });

  socket.on("joinUser",(userId:string)=>{
    socket.join(userId);
  })

  socket.on("disconnect",()=>{
    console.log("🔴 socket disconnected:",socket.id);
  });
});


const PORT=process.env.PORT || 3000

async function startServer() {
  await connectDB();
  //await connectRedis();

  // const server = app.listen(PORT, () => {
  //   console.log(`🚀 Server running on PORT ${PORT}`);
  // });

  const server = httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`);
  });

  const shutdown=()=>{
    console.log("Gracefully Shutting Down...");
    server.close(()=>process.exit(0));
  };

  process.on("SIGTERM", () => shutdown);
  process.on("SIGINT", () => shutdown);
}
startServer();