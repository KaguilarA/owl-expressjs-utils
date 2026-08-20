# owl-expressjs-utils Source API

This directory is the source-level entry point for `owl-expressjs-utils`, a reusable server-side library for Express.js applications using MongoDB and Mongoose.

The package root re-exports four groups:

| Group | Exports |
| --- | --- |
| Configuration | `OwlCrypto`, `OwlMongoConnect`, `OwlMongoClose` |
| Middleware | `OwlCors`, `OwlSession`, `OwlIsAuth` |
| Utilities | `OwlModel`, `OwlController` |
| Types | `ControllerConfig`, `ModelOptions`, `ModelReturn`, `QueryOptions` |

## Import from the package root

```ts
import {
	OwlController,
	OwlCors,
	OwlCrypto,
	OwlIsAuth,
	OwlMongoClose,
	OwlMongoConnect,
	OwlModel,
	OwlSession,
} from "owl-expressjs-utils";

import type {
	ControllerConfig,
	ModelOptions,
	ModelReturn,
	QueryOptions,
} from "owl-expressjs-utils";
```

## Application bootstrap

Connect to MongoDB before creating session stores or model-dependent services:

```ts
import express from "express";
import {
	OwlCors,
	OwlIsAuth,
	OwlMongoClose,
	OwlMongoConnect,
	OwlSession,
} from "owl-expressjs-utils";

const app = express();
const mongoUrl = process.env.MONGO_URI;
const sessionSecret = process.env.SESSION_SECRET;

if (!mongoUrl || !sessionSecret) {
	throw new Error("MONGO_URI and SESSION_SECRET are required");
}

await OwlMongoConnect(mongoUrl);
app.use(express.json());
app.use(OwlCors(["https://app.example.com"]));
app.use(OwlSession(sessionSecret, process.env.NODE_ENV ?? "development", "app"));

app.get("/private", OwlIsAuth, (req, res) => {
	res.json({ userId: req.session.userId });
});

process.once("SIGINT", OwlMongoClose);
process.once("SIGTERM", OwlMongoClose);
```

## Module documentation

Read the focused references for implementation details and reusable examples:

- [Configuration utilities](config/config.md)
- [Middleware utilities](middlewares/middlewares.md)
- [Public interfaces](interfaces/interfaces.md)
- [Utility factories](utils/utils.md)

## Design boundaries

The library provides composable building blocks rather than an application framework:

- `OwlModel` owns Mongoose access and field security hooks.
- `OwlController` translates common HTTP requests into model operations.
- Middleware handles CORS, sessions, and the minimum session authentication check.
- Consumers remain responsible for validation, authorization policy, error policy, and route organization.

Keep encryption keys, session secrets, MongoDB URIs, and CORS allowlists in environment-specific secret configuration. The package is intended for Node.js backends and should not be bundled for browser use.
