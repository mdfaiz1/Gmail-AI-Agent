import { createClient } from "redis";

// 1. Create the client instance
const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// 2. Handle connection errors
redisClient.on("error", err => console.log("Redis Client Error", err));

export const redisConnection = async () => {
  try {
    const connection = await redisClient.connect();
    console.log("Redis Connection successfully", connection);
  } catch (error) {
    console.log("Error in redis", error);
  }
};

// 3. Export the client
// export { redisClient };
