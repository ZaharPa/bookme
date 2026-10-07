import type { Response, Request } from "express";
import { db } from "../prisma/db";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";
import type {
  ForgetPassword,
  Login,
  Registartion,
  ResetPassword,
  VerifyEmail,
} from "../schemas/auth";
import { errorResponse, successResponse } from "../utils/response";
import { initializeRedisClient } from "../redis/client";
import { sendVerificationEmail } from "../utils/emailVerification";
import { sendForgetEmail } from "../utils/forgetEmail";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request<{}, {}, Login>, res: Response) {
  const { email, password } = req.body;

  const user = await db.orm.public.User.where({ email }).first();

  if (!user || !(await verifyPassword(password, user.password))) {
    return errorResponse(res, 401, "Invalid email or password");
  }
  if (user.bannedAt) return errorResponse(res, 403, "User is banned");

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken.token, REFRESH_COOKIE_OPTIONS);
  successResponse(
    res,
    200,
    {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        emailVerified: Boolean(user.emailVerifiedAt),
      },
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
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        emailVerified: false,
      },
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
    const remaining = payload.exp - Math.floor(Date.now() / 1000);

    const claimed = await redis.set(`blocklist:${payload.jti}`, "1", {
      EX: remaining,
      NX: true,
    });
    if (!claimed) return errorResponse(res, 401, "Token revoked");

    const user = await db.orm.public.User.where({ id: payload.userId }).first();
    if (!user) return errorResponse(res, 401, "User not found");
    if (user.bannedAt) return errorResponse(res, 403, "User is banned");
    if (user.passwordChangetAt) {
      const changedAt = Math.floor(
        new Date(user.passwordChangetAt).getTime() / 1000,
      );
      if (payload.iat < changedAt) {
        return errorResponse(res, 401, "Password was changed, log in again");
      }
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const newRefresh = generateRefreshToken(user.id);
    res.cookie("refreshToken", newRefresh.token, REFRESH_COOKIE_OPTIONS);
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
  res.clearCookie("refreshToken", {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: undefined,
  });
  return successResponse(res, 200, null, "Logged out");
}

export async function sendVerification(req: Request, res: Response) {
  const user = await db.orm.public.User.where({ id: req.user!.userId }).first();
  if (!user) return errorResponse(res, 404, "User not found");

  if (user.emailVerifiedAt)
    return errorResponse(res, 409, "Email is already verified");

  const redis = await initializeRedisClient();
  const allowed = await redis.set(`verify:cooldown:${user.id}`, "1", {
    EX: 60,
    NX: true,
  });
  if (!allowed)
    return errorResponse(
      res,
      429,
      "Wait a minute before requesting another email",
    );

  await sendVerificationEmail(user.id, user.email);
  return successResponse(res, 200, null, "Verification email sent");
}

export async function verifyEmail(
  req: Request<{}, {}, VerifyEmail>,
  res: Response,
) {
  const redis = await initializeRedisClient();

  const userId = await redis.getDel(`verify:${req.body.token}`);
  if (!userId) return errorResponse(res, 400, "Invalid or expired token");

  const user = await db.orm.public.User.where({ id: userId }).update({
    emailVerifiedAt: new Date().toISOString(),
  });
  if (!user) return errorResponse(res, 404, "User not found");

  return successResponse(res, 200, null, "Email verified successfully");
}

export async function forgetPassword(
  req: Request<{}, {}, ForgetPassword>,
  res: Response,
) {
  const user = await db.orm.public.User.where({
    email: req.body.email,
  }).first();

  if (user) {
    const redis = await initializeRedisClient();
    const allowed = await redis.set(`reset:cooldown:${user.id}`, "1", {
      EX: 60,
      NX: true,
    });

    if (allowed) {
      try {
        await sendForgetEmail(user.id, user.email);
      } catch (error) {
        console.error("Failed to set email", error);
      }
    }
  }

  return successResponse(res, 200, null, "Reset link has been sent");
}

export async function resetPassword(
  req: Request<{}, {}, ResetPassword>,
  res: Response,
) {
  const redis = await initializeRedisClient();

  const userId = await redis.getDel(`reset:${req.body.token}`);
  if (!userId) return errorResponse(res, 400, "Invalid or expired token");

  const hashedPassword = await hashPassword(req.body.newPassword);

  const user = await db.orm.public.User.where({ id: userId }).update({
    password: hashedPassword,
    passwordChangetAt: new Date().toISOString(),
  });
  if (!user) return errorResponse(res, 404, "User not found");

  return successResponse(res, 200, null, "Password has been reset");
}
