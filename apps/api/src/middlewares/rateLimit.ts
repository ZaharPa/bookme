import rateLimit from "express-rate-limit";
import { initializeRedisClient } from "../redis/client";
import RedisStore from "rate-limit-redis";

const redis = await initializeRedisClient();

function createLimiter(name: string, limit: number, windowMs: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisStore({
      prefix: `rl:${name}:`,
      sendCommand: (...args: string[]) => redis.sendCommand(args),
    }),
    message: { success: false, error: "Too many attemsps, try again later" },
  });
}

export const loginLimiter = createLimiter("login", 5, 15 * 60 * 1000);
export const registerLimiter = createLimiter("register", 5, 60 * 60 * 1000);
export const passwordLimiter = createLimiter("password", 5, 60 * 60 * 1000);
export const refreshLimiter = createLimiter("refresh", 30, 15 * 60 * 1000);
export const emailLimiter = createLimiter("email", 5, 60 * 60 * 100);
