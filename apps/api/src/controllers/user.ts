import type { Request, Response } from "express";
import { db } from "../prisma/db";
import { errorResponse, successResponse } from "../utils/response";
import type { userPassword } from "../schemas/user";
import { hashPassword, verifyPassword } from "../utils/password";

export async function me(req: Request, res: Response) {
  const user = await db.orm.public.User.where({ id: req.user?.userId }).first();
  if (!user) return errorResponse(res, 404, "User not found");

  const { password, ...safeUser } = user;
  return successResponse(res, 200, safeUser);
}

export async function changePassword(
  req: Request<{}, {}, userPassword>,
  res: Response,
) {
  const user = await db.orm.public.User.where({ id: req.user!.userId }).first();
  if (!user) return errorResponse(res, 404, "User not found");

  if (!(await verifyPassword(req.body.oldPassword, user.password))) {
    return errorResponse(res, 400, "Old password is wrong");
  }

  const hashedPassword = await hashPassword(req.body.newPassword);

  await db.orm.public.User.where({ id: user.id }).update({
    password: hashedPassword,
  });

  return successResponse(res, 200, null, "Password updated successfully");
}
