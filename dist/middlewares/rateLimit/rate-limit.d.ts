import { Options } from 'express-rate-limit';
/**
 * Create a rate-limiting middleware.
 *
 * @param {Partial<Options>} options - express-rate-limit configuration.
 * @returns {import("express").RequestHandler} Express rate-limit middleware.
 */
declare const _default: (options?: Partial<Options>) => import('express-rate-limit').RateLimitRequestHandler;
export default _default;
