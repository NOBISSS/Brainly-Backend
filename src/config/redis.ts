import {Redis} from "ioredis";

const redis=new Redis({
    host:"localhost",
    port:6379,
    maxRetriesPerRequest:null,
    lazyConnect:true
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export const connectRedis = async () => {
    await redis.connect();
    console.log("Redis Connected");
};
export default redis