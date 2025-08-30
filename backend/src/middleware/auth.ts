import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}
