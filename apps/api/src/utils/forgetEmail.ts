import { randomBytes } from "crypto";
import { initializeRedisClient } from "../redis/client";
import { sendEmail } from "./mailer";

const TOKEN_TTL_SECONDS = 60 * 60;

export async function sendForgetEmail(userId: string, email: string) {
  const redis = await initializeRedisClient();

  const token = randomBytes(32).toString("hex");

  await redis.set(`reset:${token}`, userId, { EX: TOKEN_TTL_SECONDS });

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Reset your BookMe password",
    `<p>We received a request to reset your password.</p>
     <p><a href="${link}">Choose a new password</a></p>
     <p>The link is valid for 1 hour. If you didn't request this, ignore this email.</p>`,
  );
}
