import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { errorResponse } from "../utils/response";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse(res, 401, "No token provided");
  }

  try {
    const payload = verifyAccessToken(authHeader.slice(7));
    req.user = payload;
    next();
  } catch (error) {
    errorResponse(res, 401, "Invalid or expired token");
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, "Accec denied");
    }
    next();
  };
}
