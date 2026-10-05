import { randomUUID } from "crypto";
import { initializeRedisClient } from "./client";

const RELEASE_SCRIPT = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end;
`;

export async function acquireLock(key: string, ttlSeconds = 10) {
  const redis = await initializeRedisClient();
  const token = randomUUID();
  const ok = await redis.set(key, token, { EX: ttlSeconds, NX: true });

  return ok ? token : null;
}

export async function releaseLock(key: string, token: string) {
  const redis = await initializeRedisClient();
  await redis.eval(RELEASE_SCRIPT, { keys: [key], arguments: [token] });
}
