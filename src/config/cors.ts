import type { Request, Response, NextFunction } from "express";

/**
 * Creates a CORS middleware that configures HTTP headers to allow cross-origin requests from specified origins.
 * When using credentials (session cookies), a wildcard '*' cannot be used and the exact origin must be specified
 * along with Access-Control-Allow-Credentials header.
 *
 * @param {string[]} allowedOrigins - Array of allowed origin URLs (e.g., ['http://localhost:3000', 'https://example.com'])
 * @returns {Function} Express middleware function that handles CORS configuration and preflight requests
 *
 * @example
 * import cors from './cors.js';
 * app.use(cors(['http://localhost:3000', 'https://example.com']));
 */
export default (allowedOrigins: string[]) => function (req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}