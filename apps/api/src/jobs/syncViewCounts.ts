import { db } from "../prisma/db";
import { initializeRedisClient } from "../redis/client";

export async function syncViewCounts() {
  const redis = await initializeRedisClient();

  for await (const keys of redis.scanIterator({
    MATCH: "business:views:*",
    COUNT: 100,
  })) {
    for (const key of keys) {
      const businessId = key.split(":")[2];

      const value = await redis.get(key);
      const count = Number(value);

      if (!count) continue;

      const business = await db.orm.public.Business.where({
        id: businessId,
      }).first();

      if (!business) continue;

      await db.orm.public.Business.where({ id: businessId }).update({
        viewCount: business.viewCount + count,
      });

      await redis.decrBy(key, count);
    }
  }
}
