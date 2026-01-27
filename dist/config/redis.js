"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const ioredis_1 = require("ioredis");
const redis = new ioredis_1.Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
    lazyConnect: true
});
redis.on("error", (err) => {
    console.error("Redis Client Error", err);
});
const connectRedis = async () => {
    await redis.connect();
    console.log("Redis Connected");
};
exports.connectRedis = connectRedis;
exports.default = redis;
