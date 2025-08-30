import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  res.json(rows);
});

router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "invalid" });
  const { rows } = await pool.query("INSERT INTO categories(name) VALUES($1) RETURNING *", [name]);
  res.json(rows[0]);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { name } = req.body || {};
  const { id } = req.params;
  const { rows } = await pool.query("UPDATE categories SET name=COALESCE($1, name) WHERE id=$2 RETURNING *", [name || null, id]);
  if (!rows[0]) return res.status(404).json({ error: "not_found" });
  res.json(rows[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM categories WHERE id=$1", [id]);
  res.json({ ok: true });
});

export default router;
