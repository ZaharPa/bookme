import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("ACCEES_SECRET and REFRESH_SECTER must be set in .env");
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string): {
  token: string;
  jti: string;
} {
  const jti = randomUUID();
  const token = jwt.sign({ userId, jti }, REFRESH_SECRET, { expiresIn: "7d" });
  return { token, jti };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as unknown as {
    userId: string;
    role: string;
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as unknown as {
    userId: string;
    jti: string;
    exp: number;
  };
}
