# OwlIsAuth

Protects an Express route by requiring `req.session.userId`.

## Import

```ts
import { OwlIsAuth } from "owl-expressjs-utils";
```

## Usage

Register it after `OwlSession`, because the middleware reads the session attached to the request:

```ts
app.get("/account", OwlIsAuth, (req, res) => {
	res.json({ userId: req.session.userId });
});
```

After authenticating a user, store its identifier in the session:

```ts
req.session.userId = user._id.toString();
```

Authenticated requests continue through the route chain. Requests without a truthy `userId` receive HTTP `401` with this response shape:

```json
{
	"authenticated": false,
	"error": "Not authorized"
}
```

The package augments `express-session` so `req.session.userId` is available as an optional string in TypeScript.
