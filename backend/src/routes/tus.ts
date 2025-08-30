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

router.get("/resolve-path", (req: Request, res: Response) => {
  const { uploadUrl } = req.query as any;
  if (!uploadUrl) return res.status(400).json({ error: "missing_uploadUrl" });
  const id = String(uploadUrl).split("/").pop() || "";
  const p = path.join(tusDir, id);
  if (!fs.existsSync(p)) return res.status(404).json({ error: "not_found" });
  res.json({ path: p });
});

export default router;
