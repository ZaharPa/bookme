import type { Request, Response } from "express";
import type { Business, Location, Resource } from "../schemas/business";
import { db } from "../prisma/db";
import { successResponse } from "../utils/response";

export async function AddBusiness(
  req: Request<{}, {}, Business>,
  res: Response,
) {
  const business = await db.orm.public.Business.create({
    ...req.body,
    ownerId: req.user!.userId,
  });
  return successResponse(res, 201, business, "Business created successfully");
}

export async function AddLocation(
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

export async function AddResource(
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
