import type { Request, Response } from "express";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import { StatsQuerySchema, type BusinessStatus } from "../schemas/admin";

export async function allBusinesses(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 10;

  const businesses = await db.orm.public.Business.orderBy((b) =>
    b.createdAt.desc(),
  )
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  return successResponse(res, 200, businesses);
}

export async function allUsers(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 20;
  const users = await db.orm.public.User.orderBy((b) => b.createdAt.desc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();
  const resUsers = users.map(({ password, ...rest }) => rest);

  return successResponse(res, 200, resUsers);
}

export async function stats(req: Request, res: Response) {
  const parsed = StatsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return errorResponse(res, 400, "Invalid stats query");
  }

  const from = parsed.data.from.toISOString();
  const to = parsed.data.to.toISOString();
  console.log(from, to);
  const users = await db.orm.public.User.where((u) => u.createdAt.gte(from))
    .where((u) => u.createdAt.lt(to))
    .aggregate((a) => ({ total: a.count() }));

  const businesses = await db.orm.public.Business.where((b) =>
    b.createdAt.gte(from),
  )
    .where((b) => b.createdAt.lt(to))
    .aggregate((a) => ({ total: a.count() }));

  return successResponse(res, 200, {
    newUsers: users.total,
    newBusinesses: businesses.total,
  });
}

export async function banUser(req: Request<{ userId: string }>, res: Response) {
  const target = await db.orm.public.User.where({
    id: req.params.userId,
  }).first();

  if (!target) return errorResponse(res, 404, "User not found");
  if (target?.role === "ADMIN")
    return errorResponse(res, 403, "Forbidden to ban admin");

  const user = await db.orm.public.User.where({ id: req.params.userId }).update(
    {
      bannedAt: new Date().toISOString(),
    },
  );

  const { password, ...resUser } = user!;

  return successResponse(res, 200, resUser, "User is banned");
}

export async function unBanUser(
  req: Request<{ userId: string }>,
  res: Response,
) {
  const user = await db.orm.public.User.where({ id: req.params.userId }).update(
    {
      bannedAt: null,
    },
  );
  if (!user) return errorResponse(res, 404, "User not found");

  const { password, ...resUser } = user;

  return successResponse(res, 200, resUser, "User is unbanned");
}

export async function changeBusinessStatus(
  req: Request<{ businessId: string }, {}, BusinessStatus>,
  res: Response,
) {
  const business = await db.transaction(async (tx) => {
    const business = await tx.orm.public.Business.where({
      id: req.params.businessId,
    }).update({
      status: req.body.status,
    });
    if (!business) return null;

    if (req.body.status === "APPROVED") {
      await tx.orm.public.User.where({
        id: business.ownerId,
        role: "CUSTOMER",
      }).update({ role: "BUSINESS_OWNER" });
    }

    return business;
  });
  if (!business) return errorResponse(res, 404, "Business not found");

  return successResponse(res, 200, business, "Status has been changed");
}
