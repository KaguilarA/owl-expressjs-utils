# OwlSession

Creates Express session middleware backed by MongoDB through `connect-mongo`.
Sessions are persisted across application restarts and are cleaned up after the configured cookie lifetime.

## Import

```ts
import { OwlSession } from "owl-expressjs-utils";
```

## Usage

Connect Mongoose before creating the middleware. The helper can reuse the active Mongoose client:

```ts
await OwlMongoConnect(process.env.MONGO_URI as string);

app.use(OwlSession(
	process.env.SESSION_SECRET as string,
	process.env.NODE_ENV ?? "development",
	"application-sessions",
));
```

Pass `mongoUrl` as the fourth argument when the session store should create its own MongoDB connection configuration:

```ts
app.use(OwlSession(
	process.env.SESSION_SECRET as string,
	"production",
	"application-sessions",
	process.env.MONGO_URI,
));
```

Pass a fifth argument to override Express session settings, including cookie options:

```ts
app.use(OwlSession(
	process.env.SESSION_SECRET as string,
	"production",
	"application-sessions",
	process.env.MONGO_URI,
	{
		cookie: { sameSite: "none", domain: ".example.com", maxAge: 1000 * 60 * 60 },
		proxy: true,
	},
));
```

## Parameters

| Parameter | Description |
| --- | --- |
| `secret` | Secret used by Express sessions and MongoDB session encryption. |
| `env` | Environment name. Cookies are marked `secure` only when this is `"production"`. |
| `dbName` | MongoDB database used for session documents. |
| `mongoUrl` | Optional MongoDB URI. If omitted, a connected Mongoose client is required. |
| `options` | Optional Express session settings. The library owns `secret` and the MongoDB-backed `store`. |

The middleware uses non-resaving, non-uninitialized sessions, rolling cookies, `httpOnly`, `sameSite: "lax"`, and a 24-hour cookie lifetime. Keep the session secret outside source control and use a strong value in production.

If neither a connected Mongoose client nor `mongoUrl` is available, `OwlSession` throws during setup.
