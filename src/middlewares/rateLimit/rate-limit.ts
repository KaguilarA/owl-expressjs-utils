import rateLimit, { type Options } from "express-rate-limit";

/**
 * Create a rate-limiting middleware.
 *
 * @param {Partial<Options>} options - express-rate-limit configuration.
 * @returns {import("express").RequestHandler} Express rate-limit middleware.
 */
export default (
  options: Partial<Options> = {},
) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ...options,
  });