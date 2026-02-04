"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
require("./queue/emailQueue");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
//Routers
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const linkRoutes_1 = __importDefault(require("./routes/linkRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://second-brainly-jet.vercel.app"
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// allow prefligh
//app.options("/*",cors());
// app.use(cors({
//   origin: true,
//   credentials: true
// }));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/health", (_, res) => {
    res.status(200).json({ status: "Ok" });
});
//Routes
app.use("/api/v1/users", userRoutes_1.default);
app.use("/api/v1/admin", adminRoutes_1.default);
app.use("/api/links", linkRoutes_1.default);
app.use("/api/workspaces", workspaceRoutes_1.default);
const httpServer = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
});
exports.io.on("connection", (socket) => {
    console.log("🟢 socket connected:", socket.id);
    socket.on("joinWorkspace", (workspaceId) => {
        socket.join(workspaceId);
        console.log(`Joined room ${workspaceId}`);
    });
    socket.on("joinUser", (userId) => {
        socket.join(userId);
    });
    socket.on("disconnect", () => {
        console.log("🔴 socket disconnected:", socket.id);
    });
});
const PORT = process.env.PORT || 3000;
async function startServer() {
    await (0, db_1.connectDB)();
    //await connectRedis();
    // const server = app.listen(PORT, () => {
    //   console.log(`🚀 Server running on PORT ${PORT}`);
    // });
    const server = httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on PORT ${PORT}`);
    });
    const shutdown = () => {
        console.log("Gracefully Shutting Down...");
        server.close(() => process.exit(0));
    };
    process.on("SIGTERM", () => shutdown);
    process.on("SIGINT", () => shutdown);
}
startServer();
