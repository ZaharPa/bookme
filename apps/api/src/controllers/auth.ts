import type { Response, Request } from "express";
import { db } from "../prisma/db";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";
import type { Login, Registartion } from "../schemas/auth";
import { errorResponse, successResponse } from "../utils/response";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request<{}, {}, Login>, res: Response) {
  const { email, password } = req.body;

  const user = await db.orm.public.User.where({ email }).first();

  if (!user || !(await verifyPassword(password, user.password))) {
    return errorResponse(res, 401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  successResponse(res, 201, {
    accessToken,
    user: { id: user.id, name: user.name, role: user.role },
  });
}

export async function register(
  req: Request<{}, {}, Registartion>,
  res: Response,
) {
  const { email, password, name } = req.body;

  const existing = await db.orm.public.User.where({ email }).first();
  if (existing) {
    return errorResponse(res, 409, "Email already registed");
  }

  const hashedPassword = await hashPassword(password);
  const user = await db.orm.public.User.create({
    email: email,
    password: hashedPassword,
    name: name,
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  successResponse(res, 201, {
    accessToken,
    user: { id: user.id, name: user.name, role: user.role },
  });
}
