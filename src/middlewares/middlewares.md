# Middleware Utilities

The `src/middlewares` module contains reusable Express middleware for cross-origin requests, sessions, and session-based authentication.

## Public middleware

| Export | Purpose |
| --- | --- |
| `OwlCors` | Allows requests from an explicit origin allowlist and handles CORS preflight requests. |
| `OwlSession` | Persists Express sessions in MongoDB with `connect-mongo`. |
| `OwlIsAuth` | Requires `req.session.userId` before allowing a request to continue. |

Import middleware from the package root:

```ts
import { OwlCors, OwlIsAuth, OwlSession } from "owl-expressjs-utils";
```

## Recommended order

Register CORS and JSON parsing before application routes. Register the session middleware before `OwlIsAuth` or any handler that reads `req.session`:

```ts
app.use(express.json());
app.use(OwlCors(allowedOrigins));
app.use(OwlSession(
	process.env.SESSION_SECRET as string,
	process.env.NODE_ENV ?? "development",
	"application-sessions",
));

app.get("/private", OwlIsAuth, privateHandler);
```

Read the dedicated documents for configuration details:

- [OwlCors](cors/cors.md)
- [OwlSession](session/session.md)
- [OwlIsAuth](isAuth/isAuth.md)

Keep secrets and origin allowlists in environment-specific configuration. Do not commit session secrets or accept arbitrary request origins in production.
