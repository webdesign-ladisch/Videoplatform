import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/videos.js";
import storageRoutes from "./routes/storage.js";
import tusRoutes from "./routes/tus.js";
import categoriesRoutes from "./routes/categories.js";
import { env } from "./config/env.js";

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || true;
app.use(cors({ origin: allowedOrigin as any, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req: express.Request, res: express.Response) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/tus", tusRoutes);
app.use("/api/categories", categoriesRoutes);

app.listen(env.port, () => {
  process.stdout.write(`backend:${env.port}\n`);
});
