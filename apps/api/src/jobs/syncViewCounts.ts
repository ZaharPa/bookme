import { db } from "../prisma/db";
import { initializeRedisClient } from "../redis/client";

export async function syncViewCounts() {
  const redis = await initializeRedisClient();
  const keys = await redis.keys("business:views:*");

  for (const key of keys) {
    const businessId = key.split(":")[2];

    const value = await redis.getDel(key);
    const count = Number(value);

    if (!count) continue;

    const business = await db.orm.public.Business.where({
      id: businessId,
    }).first();

    if (!business) continue;

    await db.orm.public.Business.where({ id: businessId }).update({
      viewCount: business.viewCount + count,
    });
  }
}
