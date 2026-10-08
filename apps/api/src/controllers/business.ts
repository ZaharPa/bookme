import type { Request, Response } from "express";
import type {
  Business,
  BusinessUpdate,
  Location,
  LocationUpdate,
  Resource,
  ResourceUpdate,
} from "../schemas/business";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import { initializeRedisClient } from "../redis/client";
import { publicUrl } from "../utils/s3";

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
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 10;

  const businesses = await db.orm.public.Business.where({
    status: "APPROVED",
    deletedAt: null,
  })
    .include("locations", (location) =>
      location
        .where({ deletedAt: null })
        .include("resources", (resource) =>
          resource.where({ deletedAt: null }),
        ),
    )
    .include("photos", (photo) => photo.where({ deletedAt: null }))
    .orderBy((b) => b.createdAt.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  const businessesWithPhotos = businesses.map((business) => ({
    ...business,
    photos: business.photos.map((photo) => ({
      id: photo.id,
      url: publicUrl(photo.key),
    })),
  }));
  return successResponse(res, 200, businessesWithPhotos);
}

export async function viewBusiness(
  req: Request<{ businessId: string }>,
  res: Response,
) {
  const business = await db.orm.public.Business.where({
    id: req.params.businessId,
    deletedAt: null,
  })
    .include("locations", (location) =>
      location
        .where({ deletedAt: null })
        .include("resources", (resource) =>
          resource.where({ deletedAt: null }),
        ),
    )
    .include("photos", (photo) => photo.where({ deletedAt: null }))
    .first();
  if (!business) {
    return errorResponse(res, 404, "Business not found");
  }

  const redis = await initializeRedisClient();
  const viewerKey = `business:viewed:${business.id}:${req.ip}`;
  const isNewView = await redis.set(viewerKey, "1", {
    EX: 60 * 60 * 24,
    NX: true,
  });

  if (isNewView) {
    await redis.incr(`business:views:${business.id}`);
  }

  const photos = business.photos.map((p) => ({
    id: p.id,
    url: publicUrl(p.key),
  }));
  return successResponse(res, 200, { ...business, photos });
}

export async function viewMyBusiness(req: Request, res: Response) {
  const userId = req.user?.userId;
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 10;

  const businesses = await db.orm.public.Business.where({ ownerId: userId })
    .include("locations", (location) => location.include("resources"))
    .orderBy((p) => p.createdAt.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();
  return successResponse(res, 200, businesses);
}

export async function updateBusiness(
  req: Request<{ businessId: string }, {}, BusinessUpdate>,
  res: Response,
) {
  const business = await db.orm.public.Business.where({
    id: req.params.businessId,
  }).update({ ...req.body });

  if (!business) return errorResponse(res, 404, "Business not found");

  return successResponse(res, 200, business, "Business updated");
}

export async function updateLocation(
  req: Request<{ locationId: string }, {}, LocationUpdate>,
  res: Response,
) {
  const location = await db.orm.public.Location.where({
    id: req.params.locationId,
  }).update({ ...req.body });

  if (!location) return errorResponse(res, 404, "Location not found");

  return successResponse(res, 200, location, "Location updated successfully");
}

export async function updateResource(
  req: Request<{ resourceId: string }, {}, ResourceUpdate>,
  res: Response,
) {
  const resource = await db.orm.public.Resource.where({
    id: req.params.resourceId,
  }).update({ ...req.body });

  if (!resource) return errorResponse(res, 404, "Resource not found");

  return successResponse(res, 200, resource, "Resource updated successfully");
}

export async function deleteBusiness(
  req: Request<{ businessId: string }>,
  res: Response,
) {
  const businessId = req.params.businessId;
  const now = new Date().toISOString();

  const business = await db.transaction(async (tx) => {
    const business = await tx.orm.public.Business.where({
      id: businessId,
    }).update({ deletedAt: now });

    if (!business) return null;

    const locations = await tx.orm.public.Location.where({ businessId }).all();
    const locationIds = locations.map((l) => l.id);

    await tx.orm.public.Location.where({ businessId }).update({
      deletedAt: now,
    });

    if (locationIds.length > 0) {
      await tx.orm.public.Resource.where((r) =>
        r.locationId.in(locationIds),
      ).update({
        deletedAt: now,
      });
    }

    return business;
  });

  if (!business) return errorResponse(res, 404, "Business not found");

  return successResponse(res, 200, business, "Business deleted successfully");
}

export async function deleteLocation(
  req: Request<{ locationId: string }>,
  res: Response,
) {
  const locationId = req.params.locationId;
  const now = new Date().toISOString();

  const location = await db.transaction(async (tx) => {
    const location = await tx.orm.public.Location.where({
      id: locationId,
    }).update({ deletedAt: now });
    if (!location) return null;

    await tx.orm.public.Resource.where({ locationId }).update({
      deletedAt: now,
    });

    return location;
  });

  if (!location) return errorResponse(res, 404, "Location not found");

  return successResponse(res, 200, location, "Location deleted successfully");
}

export async function deleteResource(
  req: Request<{ resourceId: string }>,
  res: Response,
) {
  const resource = await db.orm.public.Resource.where({
    id: req.params.resourceId,
  }).update({ deletedAt: new Date().toISOString() });

  if (!resource) return errorResponse(res, 404, "Resource not found");
  return successResponse(res, 200, resource, "Resource deleted successfully");
}
