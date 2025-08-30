import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import videoRoutes from "./routes/videos";
import storageRoutes from "./routes/storage";
import tusRoutes from "./routes/tus";
import { env } from "./config/env";

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

app.listen(env.port, () => {
  process.stdout.write(`backend:${env.port}\n`);
});
