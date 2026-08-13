import type { Request, Response, NextFunction } from "express";
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

/**
 * Creates an authentication middleware that checks whether the current session
 * contains an authenticated user's ID.
 *
 * Requests from authenticated users continue to the next middleware. Requests
 * without a user ID receive a 401 Unauthorized response.
 *
 * @returns {Response | void} Express middleware that validates the user's session
 *
 * @example
 * ```ts
 * import express from "express";
 * import isAuth from "./isAuth.js";
 *
 * const app = express();
 *
 * app.get("/profile", isAuth, (req, res) => {
 *   res.json({ userId: req.session.userId });
 * });
 * ```
 */
export default function (
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (req.session.userId) return next();

  return res.status(401).json({
    authenticated: false,
    error: "No autorizado",
  });
};