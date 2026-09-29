import type { Request, Response } from "express";
import type { Business, Location, Resource } from "../schemas/business";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import { initializeRedisClient } from "../redis/client";

export async function addBusiness(
  req: Request<{}, {}, Business>,
  res: Response,
) {
  const business = await db.orm.public.Business.create({
    ...req.body,
    ownerId: req.user!.userId,
  });
  return successResponse(res, 201, business, "Business created successfully");
}

export async function addLocation(
  req: Request<{ businessId: string }, {}, Location>,
  res: Response,
) {
  const businessId = req.params.businessId;
  const location = await db.orm.public.Location.create({
    ...req.body,
    businessId,
  });
  return successResponse(res, 201, location, "Location created successfully");
}

export async function addResource(
  req: Request<{ locationId: string }, {}, Resource>,
  res: Response,
) {
  const locationId = req.params.locationId;
  const resource = await db.orm.public.Resource.create({
    ...req.body,
    locationId,
  });
  return successResponse(res, 201, resource, "Resource created successfully");
}

export async function viewAllBusinesses(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const perPage = 10;

  const businesses = await db.orm.public.Business.where({ status: "APPROVED" })
    .include("locations", (location) => location.include("resources"))
    .orderBy((p) => p.createdAt.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  return successResponse(res, 200, businesses);
}

export async function viewBusiness(
  req: Request<{ businessId: string }>,
  res: Response,
) {
  const business = await db.orm.public.Business.where({
    id: req.params.businessId,
  })
    .include("locations", (location) => location.include("resources"))
    .first();
  if (!business) {
    return errorResponse(res, 404, "Business not found");
  }

  const redis = await initializeRedisClient();
  const viewerKey = `business:viewed:${business.id}:${req.ip}`;
  const alreadyViewed = await redis.get(viewerKey);

  if (!alreadyViewed) {
    const viewsKey = `business:views:${business.id}`;

    await redis.incr(`business:views:${business.id}`);
    await redis.set(viewerKey, "1", { EX: 60 * 60 * 24 });
    console.log("View counted:", {
      viewsKey,
      viewerKey,
      count: await redis.get(viewsKey),
    });
  }

  return successResponse(res, 200, business);
}

export async function viewMyBusiness(req: Request, res: Response) {
  const userId = req.user?.userId;
  const page = Number(req.query.page) || 1;
  const perPage = 10;

  const businesses = await db.orm.public.Business.where({ ownerId: userId })
    .include("locations", (location) => location.include("resources"))
    .orderBy((p) => p.createdAt.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();
  return successResponse(res, 200, businesses);
}
