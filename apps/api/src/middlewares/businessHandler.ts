import { db } from "../prisma/db";
import { errorResponse } from "../utils/response";
import type { Request, Response, NextFunction } from "express";

export async function businessOwner(
  req: Request<{ businessId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const business = await db.orm.public.Business.where({
      id: req.params.businessId,
    }).first();
    if (!business) return errorResponse(res, 404, "Business not found");
    if (business.ownerId !== req.user?.userId) {
      return errorResponse(res, 403, "Access denied");
    }
    next();
  } catch (error) {
    next(error);
  }
}

export async function locationCheck(
  req: Request<{ locationId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const location = await db.orm.public.Location.where({
      id: req.params.locationId,
    }).first();
    if (!location) return errorResponse(res, 404, "Location not found");

    const business = await db.orm.public.Business.where({
      id: location.businessId,
    }).first();
    if (!business) return errorResponse(res, 404, "Business not found");

    if (business.ownerId !== req.user?.userId) {
      return errorResponse(res, 403, "Access denied");
    }
    next();
  } catch (error) {
    next(error);
  }
}
