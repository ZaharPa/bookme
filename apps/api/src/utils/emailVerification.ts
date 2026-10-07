import { randomBytes } from "crypto";
import { initializeRedisClient } from "../redis/client";
import { sendEmail } from "./mailer";

const TOKEN_TTL_SECONDS = 24 * 60 * 60;

export async function sendVerificationEmail(userId: string, email: string) {
  const redis = await initializeRedisClient();

  const token = randomBytes(32).toString("hex");

  await redis.set(`verify:${token}`, userId, { EX: TOKEN_TTL_SECONDS });

  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    "Confirm your email",
    `<p>Welcome to BookMe! Confirm your email:</p>
     <p><a href="${link}">Confirm email</a></p>
     <p>The link is valid for 24 hours.</p>`,
  );
}
