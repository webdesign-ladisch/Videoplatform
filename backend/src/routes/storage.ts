import { Router } from "express";
import fs from "fs";
import { env } from "../config/env.js";

const router = Router();

function getDirSize(path: string): number {
  let total = 0;
  if (!fs.existsSync(path)) return 0;
  const entries = fs.readdirSync(path, { withFileTypes: true });
  for (const e of entries) {
    const p = `${path}/${e.name}`;
    if (e.isDirectory()) total += getDirSize(p);
    else total += fs.statSync(p).size;
  }
  return total;
}

router.get("/usage", (_req, res) => {
  const size = getDirSize(env.uploadRoot);
  res.json({ bytesUsed: size });
});

export default router;
