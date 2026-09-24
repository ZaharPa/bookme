import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.js";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use("/auth", authRouter);

app.use(errorHandler);

app
  .listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
  })
  .on("error", (error) => {
    throw new Error(error.message);
  });
