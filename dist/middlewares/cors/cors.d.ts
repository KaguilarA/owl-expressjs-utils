import { Request, Response, NextFunction } from 'express';
/**
 * Creates a CORS middleware that configures HTTP headers to allow cross-origin requests from specified origins.
 * When using credentials (session cookies), a wildcard '*' cannot be used and the exact origin must be specified
 * along with Access-Control-Allow-Credentials header.
 *
 * @param {string[]} allowedOrigins - Array of allowed origin URLs (e.g., ['http://localhost:3000', 'https://example.com'])
 * @returns {Function} Express middleware function that handles CORS configuration and preflight requests
 *
 * @example
 * ```ts
 * import createCors from "./cors.js";
 *
 * app.use(createCors(["http://localhost:3000", "https://example.com"]));
 * ```
 */
declare const _default: (allowedOrigins: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export default _default;
