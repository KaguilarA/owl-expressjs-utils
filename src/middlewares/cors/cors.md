# OwlCors

Creates Express middleware that applies CORS response headers for a fixed list of allowed origins.

## Import

```ts
import { OwlCors } from "owl-expressjs-utils";
```

## Usage

Pass the complete origins that may call the backend. Origins must include the scheme and, when applicable, the port:

```ts
app.use(OwlCors([
	"http://localhost:3000",
	"https://app.example.com",
]));
```

The middleware:

- Sets `Access-Control-Allow-Origin` only when the request origin is in the allowlist.
- Enables credentials for allowed origins with `Access-Control-Allow-Credentials: true`.
- Allows `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS` methods.
- Allows the `Content-Type` and `Authorization` request headers.
- Responds to `OPTIONS` preflight requests with HTTP `204` and does not call the next middleware.

## Credentials and security

This helper is intended for explicit origin allowlists. Do not add `*` when your backend uses cookies or other credentials; browsers reject wildcard origins together with credential support.

Keep the allowlist in environment-specific configuration rather than accepting arbitrary request origins:

```ts
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(OwlCors(allowedOrigins));
```
