import { Router } from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { env } from "../config/env";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === env.serverUsername && password === env.serverPassword) {
    const token = jwt.sign({ sub: "single-user" }, env.jwtSecret, { expiresIn: "7d" });
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: 7 * 24 * 3600
      })
    );
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: "invalid_credentials" });
});

router.post("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 0 })
  );
  res.json({ ok: true });
});

export default router;
