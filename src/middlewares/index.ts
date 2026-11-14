/** Reusable Express middleware for CORS, sessions, and authentication. */

/** Creates CORS middleware with an explicit origin allowlist. */
export { default as OwlCors } from "./cors/cors.js";

/** Creates MongoDB-backed Express session middleware. */
export { default as OwlSession } from "./session/session.js";

/** Creates rate-limiting middleware with default settings. */
export { default as OwlRateLimit } from "./rateLimit/rate-limit.js";

/** Requires an authenticated user ID in the current session. */
export { default as OwlIsAuth } from "./isAuth/isAuth.js";
