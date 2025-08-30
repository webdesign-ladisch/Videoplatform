import { Router, Request, Response } from "express";
import { Server, FileStore } from "tus-node-server";
import fs from "fs";
import path from "path";

const router = Router();
const tusServer = new Server();
const tusDir = "/tus-data";
if (!fs.existsSync(tusDir)) fs.mkdirSync(tusDir, { recursive: true });

tusServer.datastore = new FileStore({ path: tusDir } as any);

router.all("/upload/*", (req: Request, res: Response) => {
  req.url = req.url?.replace("/api/tus", "") || "";
  tusServer.handle(req, res);
});

router.post("/commit", (req: Request, res: Response) => {
  const { uploadId } = req.body as any;
  if (!uploadId) return res.status(400).json({ error: "missing_uploadId" });
  const metaPath = path.join(tusDir, uploadId);
  if (!fs.existsSync(metaPath)) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true, path: metaPath });
});

export default router;
