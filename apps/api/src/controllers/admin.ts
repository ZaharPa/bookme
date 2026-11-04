import type { Request, Response } from "express";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import { StatsQuerySchema, type BusinessStatus } from "../schemas/admin";

const BUSINESS_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
const DAY_MS = 86_400_000;
const MAX_DAYS = 92;

export async function allBusinesses(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 10;

  const status = BUSINESS_STATUSES.find((s) => s === req.query.status);
  const filter = status ? { status } : {};

  const [businesses, count] = await Promise.all([
    db.orm.public.Business.where(filter)
      .orderBy((b) => b.createdAt.desc())
      .limit(perPage)
      .offset((page - 1) * perPage)
      .all(),
    db.orm.public.Business.where(filter).aggregate((a) => ({
      total: a.count(),
    })),
  ]);

  return successResponse(res, 200, {
    items: businesses,
    total: count.total,
    page,
    perPage,
    totalPages: Math.ceil(count.total / perPage),
  });
}

export async function allUsers(req: Request, res: Response) {
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  const perPage = 20;

  const [users, count] = await Promise.all([
    db.orm.public.User.orderBy((b) => b.createdAt.desc())
      .limit(perPage)
      .offset((page - 1) * perPage)
      .all(),
    db.orm.public.User.aggregate((a) => ({ total: a.count() })),
  ]);

  const resUsers = users.map(({ password, ...rest }) => rest);

  return successResponse(res, 200, {
    items: resUsers,
    total: count.total,
    page,
    perPage,
    totalPages: Math.ceil(count.total / perPage),
  });
}

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export async function stats(req: Request, res: Response) {
  const parsed = StatsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return errorResponse(res, 400, "Invalid stats query");
  }

  const timeZone =
    typeof req.query.timeZone === "string" ? req.query.timeZone : "UTC";
  if (!isValidTimeZone(timeZone))
    return errorResponse(res, 400, "Invalid time zone");

  const { from, to } = parsed.data;
  if ((to.getTime() - from.getTime()) / DAY_MS > MAX_DAYS)
    return errorResponse(res, 400, `Range is limited to ${MAX_DAYS} days`);

  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const [users, businesses, bookings] = await Promise.all([
    db.orm.public.User.where((u) => u.createdAt.gte(fromIso))
      .where((u) => u.createdAt.lt(toIso))
      .select("createdAt")
      .all(),
    db.orm.public.Business.where((b) => b.createdAt.gte(fromIso))
      .where((b) => b.createdAt.lt(toIso))
      .select("createdAt")
      .all(),
    db.orm.public.Booking.where((b) => b.createdAt.gte(fromIso))
      .where((b) => b.createdAt.lt(toIso))
      .where((b) => b.status.in(["COMPLETED", "CONFIRMED"]))
      .select("createdAt", "totalAmountCents")
      .all(),
  ]);

  const dayFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayOf = (value: string) => dayFormat.format(new Date(value));

  const days = new Map<
    string,
    {
      date: string;
      newUsers: number;
      newBusinesses: number;
      bookings: number;
      revenueCents: number;
    }
  >();

  for (let t = from.getTime() + DAY_MS / 2; t < to.getTime(); t += DAY_MS) {
    const date = dayFormat.format(t);
    days.set(date, {
      date,
      newUsers: 0,
      newBusinesses: 0,
      bookings: 0,
      revenueCents: 0,
    });
  }

  for (const row of users) {
    const day = days.get(dayOf(row.createdAt));
    if (day) day.newUsers++;
  }
  for (const row of businesses) {
    const day = days.get(dayOf(row.createdAt));
    if (day) day.newBusinesses++;
  }
  for (const row of bookings) {
    const day = days.get(dayOf(row.createdAt));
    if (day) {
      day.bookings++;
      day.revenueCents += row.totalAmountCents;
    }
  }

  return successResponse(res, 200, {
    newUsers: users.length,
    newBusinesses: businesses.length,
    bookings: {
      count: bookings.length,
      totalCents: bookings.reduce((sum, b) => sum + b.totalAmountCents, 0),
    },
    daily: [...days.values()],
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
