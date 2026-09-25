import type { Response, Request } from "express";
import { db } from "../prisma/db";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";
import type { Login, Registartion } from "../schemas/auth";
import { errorResponse, successResponse } from "../utils/response";
import { initializeRedisClient } from "../redis/client";

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

  res.cookie("refreshToken", refreshToken.token, REFRESH_COOKIE_OPTIONS);
  successResponse(
    res,
    200,
    {
      accessToken,
      user: { id: user.id, name: user.name, role: user.role },
    },
    "Logged in successfully",
  );
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

  res.cookie("refreshToken", refreshToken.token, REFRESH_COOKIE_OPTIONS);
  successResponse(
    res,
    201,
    {
      accessToken,
      user: { id: user.id, name: user.name, role: user.role },
    },
    "Registered successfully",
  );
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken;
  if (!token) return errorResponse(res, 401, "No refresh token");

  try {
    const redis = await initializeRedisClient();
    const payload = verifyRefreshToken(token);

    const isBlocked = await redis.get(`blocklist:${payload.jti}`);
    if (isBlocked) return errorResponse(res, 401, "Token revoked");

    const user = await db.orm.public.User.where({ id: payload.userId }).first();
    if (!user) return errorResponse(res, 401, "User not found");

    const accessToken = generateAccessToken(user.id, user.role);
    return successResponse(res, 200, { accessToken }, "Token refreshed");
  } catch (error) {
    return errorResponse(res, 401, "Invalid or expired refresh token");
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const redis = await initializeRedisClient();
      const payload = verifyRefreshToken(token);

      const remainingSeconds = payload.exp - Math.floor(Date.now() / 1000);
      if (remainingSeconds > 0) {
        await redis.set(`blocklist:${payload.jti}`, "1", {
          EX: remainingSeconds,
        });
      }
    } catch {}
  }
  res.clearCookie("refreshToken");
  return successResponse(res, 200, null, "Logged out");
}
