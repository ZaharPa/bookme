import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initializeRedisClient } from "./redis/client.js";
import { syncViewCounts } from "./jobs/syncViewCounts.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requireAuth, requireRole } from "./middlewares/authHandler.js";
import authRouter from "./routes/auth.js";
import businessRouter from "./routes/business.js";
import adminRouter from "./routes/admin.js";
import bookingRouter from "./routes/booking.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/businesses", businessRouter);
app.use("/admin", requireAuth, requireRole("ADMIN"), adminRouter);
app.use("/bookings", bookingRouter);

app.use(errorHandler);

async function bootstrap() {
  await initializeRedisClient();
  await syncViewCounts();

  setInterval(
    async () => {
      try {
        await syncViewCounts();
      } catch (error) {
        console.error("syncViewCounts failed", error);
      }
    },
    15 * 60 * 1000,
  );

  app
    .listen(PORT, () => {
      console.log(`App is running on ${PORT}`);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    });
}

bootstrap();
