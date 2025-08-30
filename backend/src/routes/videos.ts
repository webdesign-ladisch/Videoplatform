import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import multer from "multer";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { env } from "../config/env";

const router = Router();
const upload = multer({ dest: "/tmp" });

router.get("/", requireAuth, async (req, res) => {
  const { search = "", limit = "25", offset = "0", categoryId, tagIds } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit, 10) || 25, 1000);
  const off = parseInt(offset, 10) || 0;

  let where = "";
  const params: any[] = [];
  if (search) {
    params.push(`%${search}%`);
    where += (where ? " AND " : " WHERE ") + `title ILIKE $${params.length}`;
  }
  const q = `SELECT * FROM videos ${where} ORDER BY created_at DESC LIMIT ${lim} OFFSET ${off}`;
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

router.get("/:id", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM videos WHERE id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "not_found" });
  res.json(rows[0]);
});

router.post("/:id/favorite", requireAuth, async (req, res) => {
  const { rows } = await pool.query("UPDATE videos SET favorite = NOT favorite WHERE id=$1 RETURNING *", [
    req.params.id
  ]);
  if (!rows[0]) return res.status(404).json({ error: "not_found" });
  res.json(rows[0]);
});

router.patch("/:id", requireAuth, upload.fields([{ name: "cover" }, { name: "preview" }]), async (req, res) => {
  const id = req.params.id;
  const title = (req.body.title as string) || undefined;
  const coverFile = (req.files as any)?.cover?.[0];
  const previewFile = (req.files as any)?.preview?.[0];

  const { rows: existingRows } = await pool.query("SELECT * FROM videos WHERE id=$1", [id]);
  if (!existingRows[0]) return res.status(404).json({ error: "not_found" });
  const video = existingRows[0];

  let path_cover = video.path_cover;
  let path_preview = video.path_preview;

  if (coverFile) {
    fs.copyFileSync(coverFile.path, path_cover);
    fs.unlinkSync(coverFile.path);
  }
  if (previewFile) {
    fs.copyFileSync(previewFile.path, path_preview);
    fs.unlinkSync(previewFile.path);
  }

  const { rows } = await pool.query(
    "UPDATE videos SET title=COALESCE($1,title), path_cover=$2, path_preview=$3, updated_at=now() WHERE id=$4 RETURNING *",
    [title || null, path_cover, path_preview, id]
  );
  res.json(rows[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM videos WHERE id=$1", [req.params.id]);
  const v = rows[0];
  if (!v) return res.status(404).json({ error: "not_found" });

  try {
    if (fs.existsSync(v.path_cover)) fs.unlinkSync(v.path_cover);
    if (fs.existsSync(v.path_preview)) fs.unlinkSync(v.path_preview);
    if (fs.existsSync(v.path_video)) fs.unlinkSync(v.path_video);
    await pool.query("DELETE FROM videos WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "delete_failed" });
  }
});

router.post("/finalize", requireAuth, upload.none(), async (req, res) => {
  const { title, videoPath, coverPath, previewPath } = req.body as Record<string, string>;
  if (!title || !videoPath || !coverPath || !previewPath) return res.status(400).json({ error: "invalid" });

  const absVideo = path.resolve(videoPath);
  const absCover = path.resolve(coverPath);
  const absPreview = path.resolve(previewPath);

  if (![absVideo, absCover, absPreview].every((p) => fs.existsSync(p))) {
    return res.status(400).json({ error: "files_missing" });
  }

  const start = Date.now();
  const dir = path.join(env.uploadRoot, title.replace(/\s+/g, "_"));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const finalVideo = path.join(dir, `${title.replace(/\s+/g, "_")}.mp4`);
  const finalCover = path.join(dir, `${title.replace(/\s+/g, "_")}_Cover.jpg`);
  const finalPreview = path.join(dir, `${title.replace(/\s+/g, "_")}_Preview.jpg`);

  fs.renameSync(absVideo, finalVideo);
  fs.renameSync(absCover, finalCover);
  fs.renameSync(absPreview, finalPreview);

  let duration_sec = 0;
  await new Promise<void>((resolve) => {
    ffmpeg.ffprobe(finalVideo, (_err, data) => {
      if (data?.format?.duration) duration_sec = Math.round(data.format.duration);
      resolve();
    });
  });

  const { rows } = await pool.query(
    "INSERT INTO videos (title, path_video, path_cover, path_preview, duration_sec) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [title, finalVideo, finalCover, finalPreview, duration_sec]
  );

  const elapsedMs = Date.now() - start;
  res.json({ ok: true, video: rows[0], elapsedMs });
});

export default router;
