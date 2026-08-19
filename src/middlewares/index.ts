/** Reusable Express middleware for CORS, sessions, and authentication. */

/** Creates CORS middleware with an explicit origin allowlist. */
export { default as OwlCors } from "./cors/cors";

/** Creates MongoDB-backed Express session middleware. */
export { default as OwlSession } from "./session/session";

/** Requires an authenticated user ID in the current session. */
export { default as OwlIsAuth } from "./isAuth/isAuth";
