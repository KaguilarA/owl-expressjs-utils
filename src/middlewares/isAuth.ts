import type { Request, Response, NextFunction } from "express";
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export default function (req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) return next();

  return res.status(401).json({
    authenticated: false,
    error: "No autorizado",
  });
};