# owl-expressjs-utils

[![npm version](https://img.shields.io/npm/v/owl-expressjs-utils)](https://www.npmjs.com/package/owl-expressjs-utils)
[![CI and publish](https://github.com/KaguilarA/owl-expressjs-utils/actions/workflows/publish.yml/badge.svg)](https://github.com/KaguilarA/owl-expressjs-utils/actions/workflows/publish.yml)
[![License](https://img.shields.io/github/license/KaguilarA/owl-expressjs-utils)](LICENSE)

Reusable TypeScript utilities for building Express.js applications backed by MongoDB and Mongoose.

`owl-expressjs-utils` provides small, composable building blocks for common API concerns:

- MongoDB connection setup with Mongoose
- CORS middleware with an origin allowlist
- MongoDB-backed Express sessions
- Session-based authentication middleware
- AES-256-GCM encryption and bcrypt password hashing
- Mongoose model factories with CRUD, population, search, and pagination helpers
- Express controller and entity factories for standard CRUD routes

The package is designed for server-side Node.js applications. It is not a frontend library and should not be bundled for browser use.

## Requirements

- Node.js `>= 24`
- npm `>= 10`
- MongoDB for the connection, model, and session utilities

## Installation

```bash
npm install owl-expressjs-utils
```

The package includes TypeScript declarations and supports both ESM and CommonJS consumers.

## Documentation map

The README is the public overview. The source documentation contains the detailed API guide for each reusable module:

| Area | Documentation |
| --- | --- |
| Source entry point and package architecture | [`src/readme.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/readme.md) |
| MongoDB, encryption, and connection configuration | [`src/config/config.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/config/config.md) |
| Encryption API and key management | [`src/config/crypto/crypto.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/config/crypto/crypto.md) |
| MongoDB connection | [`src/config/connect/connect.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/config/connect/connect.md) |
| MongoDB shutdown | [`src/config/closeConnection/closeConnection.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/config/closeConnection/closeConnection.md) |
| Express middleware overview | [`src/middlewares/middlewares.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/middlewares/middlewares.md) |
| CORS middleware | [`src/middlewares/cors/cors.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/middlewares/cors/cors.md) |
| MongoDB-backed sessions | [`src/middlewares/session/session.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/middlewares/session/session.md) |
| Session authentication | [`src/middlewares/isAuth/isAuth.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/middlewares/isAuth/isAuth.md) |
| TypeScript interfaces | [`src/interfaces/interfaces.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/interfaces/interfaces.md) |
| Utility factory overview | [`src/utils/utils.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/utils.md) |
| Mongoose model factory | [`src/utils/model/model.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/model/model.md) |
| Entity service factory | [`src/utils/entity/entity.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/entity/entity.md) |
| Express controller factory | [`src/utils/controller/controller.md`](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/controller/controller.md) |

## Quick Start

```ts
import express from "express";
import {
	OwlCors,
	OwlIsAuth,
	OwlMongoConnect,
	OwlSession,
} from "owl-expressjs-utils";

const app = express();

await OwlMongoConnect(process.env.MONGO_URI as string);

app.use(express.json());
app.use(OwlCors(["http://localhost:3000"]));
app.use(OwlSession(
	process.env.SESSION_SECRET as string,
	process.env.NODE_ENV ?? "development",
	"my-database",
	process.env.MONGO_URI,
));

app.get("/private", OwlIsAuth, (req, res) => {
	res.json({ userId: req.session.userId });
});

app.listen(3000, () => {
	console.log("API listening on port 3000");
});
```

`OwlMongoConnect` must complete before `OwlSession` is created because the session store uses the active Mongoose connection.

## Public API

All utilities are exported from the package root:

| Export | Purpose |
| --- | --- |
| `OwlMongoConnect` | Connects to MongoDB through Mongoose. |
| `OwlCors` | Creates CORS middleware for approved origins. |
| `OwlSession` | Creates an Express session middleware using MongoDB. |
| `OwlIsAuth` | Rejects requests without `req.session.userId`. |
| `OwlCrypto` | Encrypts and decrypts values with AES-256-GCM. |
| `OwlModel` | Creates a Mongoose model with security and query helpers. |
| `OwlEntity` | Creates a reusable application service around a model helper. |
| `OwlController` | Creates Express handlers for common CRUD operations. |
| `ControllerConfig` | TypeScript configuration type for `OwlController`. |
| `EntityConfig` | TypeScript configuration type for `OwlEntity`. |
| `ModelOptions` | TypeScript options for timestamps and bcrypt cost. |
| `ModelReturn` | TypeScript contract returned by `OwlModel`. |
| `QueryOptions` | TypeScript options type for model queries. |

## MongoDB Connection

`OwlMongoConnect` validates the URI, configures Mongoose connection options, and opens the connection.

```ts
import { OwlMongoConnect } from "owl-expressjs-utils";

await OwlMongoConnect("mongodb://127.0.0.1:27017/example");
```

The function throws when configuration is missing or the connection fails. It does not terminate the consuming process; handle retries and shutdown in the application.

## Secure Models

`OwlModel` creates a Mongoose model with timestamps and optional field-level security. Fields listed in `encryptedFields` are encrypted before saving and decrypted after queries. Fields listed in `hashedFields` are hashed with bcrypt before saving.

Sensitive fields are removed from the model's JSON output. Hash-protected fields can be checked with `compareHash` without exposing the stored hash.

```ts
import { OwlModel } from "owl-expressjs-utils";

const User = OwlModel(
	"User",
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phoneNumber: String,
	},
	["phoneNumber"],
	["password"],
);

const user = await User.save({
	name: "Ada Lovelace",
	email: "ada@example.com",
	password: "plain-text-password",
	phoneNumber: "+1 555 0100",
});

const validPassword = await User.compareHash(
	user._id.toString(),
	"password",
	"plain-text-password",
);

const users = await User.getAll({ page: 1, pageSize: 20 });
```

### Model Methods

The returned model helper exposes:

- `save(data)` creates and saves a document.
- `getAll(options?)` retrieves documents, optionally populated or paginated.
- `getById(id, options?)` retrieves one document by ID.
- `getOne(filter, options?)` retrieves the first matching document.
- `getByCoincidence(filter, options?)` retrieves all matching documents.
- `update(id, data, options?)` updates and returns a document.
- `delete(id)` deletes and returns a document.
- `compareHash(id, field, candidateValue)` verifies a bcrypt-protected field.

### Population and Pagination

Query options support string, array, nested, and object population:

```ts
const usersWithRoles = await User.getAll({
	populate: ["profile", "roles.permissions"],
	page: 2,
	pageSize: 25,
});
```

Pagination can be specified in any of these forms:

```ts
await User.getAll({ page: 2, pageSize: 25 });
await User.getAll({ skip: 25, limit: 25 });
await User.getAll({ limit: 25 });
```

When no pagination options are provided, the query is not paginated.

## Encryption

`OwlCrypto` uses AES-256-GCM and formats encrypted values as `iv:authTag:ciphertext`.

```ts
import { OwlCrypto } from "owl-expressjs-utils";

OwlCrypto.setEncryptionKey(process.env.ENCRYPTION_KEY as string);

const encrypted = OwlCrypto.encrypt("private value");
const plainText = OwlCrypto.decrypt(encrypted as string);
const isEncrypted = OwlCrypto.isEncrypted(encrypted);
```

The key must be a 64-character hexadecimal string representing 32 bytes. Configure a unique production key before encrypting application data. No default key is configured, so encrypted models fail fast until the application explicitly sets one.

Available methods:

- `setEncryptionKey(key)` changes the 32-byte encryption key.
- `setEncryptionAlgorithm(algorithm)` changes the Node.js cipher algorithm.
- `encrypt(value)` encrypts a value and preserves `null` or `undefined`.
- `decrypt(value)` decrypts a formatted encrypted value.
- `isEncrypted(value)` checks whether a value has the expected encrypted structure.

See the complete [encryption documentation](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/config/crypto/crypto.md) for key format, persistence, and production security guidance.

## CORS Middleware

`OwlCors` accepts an allowlist of origins. Approved origins receive credential support, while preflight requests receive a `204` response.

```ts
import { OwlCors } from "owl-expressjs-utils";

app.use(OwlCors([
	"http://localhost:3000",
	"https://app.example.com",
]));
```

The middleware allows `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`, and accepts `Content-Type` and `Authorization` request headers.

## Sessions and Authentication

`OwlSession` stores Express sessions in MongoDB through `connect-mongo`. The fourth argument is optional; pass the MongoDB URI when the session middleware cannot access the active Mongoose client directly.

```ts
import { OwlSession } from "owl-expressjs-utils";

app.use(OwlSession(
	process.env.SESSION_SECRET as string,
	process.env.NODE_ENV ?? "development",
	"my-database",
));
```

The default session settings include MongoDB persistence, `httpOnly` cookies, `sameSite: "lax"`, a 24-hour cookie lifetime, rolling sessions, and secure cookies in production.

`OwlIsAuth` checks `req.session.userId`. It calls `next()` for authenticated sessions and returns HTTP `401` otherwise.

```ts
import { OwlIsAuth } from "owl-expressjs-utils";

app.get("/account", OwlIsAuth, accountHandler);
```

After a successful login, set the session property used by the middleware:

```ts
req.session.userId = user._id.toString();
```

## CRUD Controllers

`OwlController` creates Express handlers around an `OwlModel` instance.

```ts
import { Router } from "express";
import { OwlController } from "owl-expressjs-utils";

const router = Router();
const userController = OwlController({
	entityId: "User",
	model: User,
	populatedFields: ["profile", "roles"],
});

router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.post("/users/search", userController.getByCoincidence);
router.post("/users", userController.register);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);
```

The generated controller exposes:

- `getAll`: reads optional `page`, `pageSize`, `limit`, and `skip` query parameters.
- `getById`: reads the document ID from `req.params.id`.
- `getOne`: reads a JSON `filter` query parameter or uses `req.body`.
- `getByCoincidence`: expects `{ query, page?, pageSize?, limit?, skip? }` in the request body.
- `register`: creates a document and returns HTTP `201`.
- `update`: reads the ID from `req.params.id` and update data from `req.body`.
- `delete`: removes a document by `req.params.id`.

Handlers return `404` for missing documents, `400` for registration or invalid search input, and `500` for unexpected server or database errors.

See the complete [controller documentation](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/controller/controller.md) for route inputs, response behavior, and responsibility boundaries.

## Entity Services

`OwlEntity` provides a service-layer boundary around an `OwlModel` helper. It centralizes population defaults, contextual error logging, and common data-access methods without coupling application services to Express request and response objects.

```ts
import { OwlEntity } from "owl-expressjs-utils";

const userEntity = OwlEntity({
	entityId: "User",
	model: User,
	populatedFields: ["profile", "roles"],
});

const user = await userEntity.getById(userId);
const users = await userEntity.getAll();
```

See the [entity service documentation](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/entity/entity.md) and [utility composition guide](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/utils/utils.md).

## TypeScript Contracts

The package publishes type-only contracts for strongly typed backend integrations:

```ts
import type {
	ControllerConfig,
	EntityConfig,
	ModelOptions,
	ModelReturn,
	QueryOptions,
} from "owl-expressjs-utils";
```

Read the [interface reference](https://github.com/KaguilarA/owl-expressjs-utils/blob/main/src/interfaces/interfaces.md) for generic model return types, population options, pagination, and factory configuration.

## Architecture

The library is intentionally composable rather than opinionated about application structure:

1. `OwlMongoConnect` establishes the Mongoose connection.
2. `OwlCrypto` provides encryption configuration for protected model fields.
3. `OwlModel` owns persistence, security hooks, querying, population, and pagination.
4. `OwlEntity` provides an application-level data-access service.
5. `OwlController` translates common HTTP requests into model operations.
6. `OwlSession`, `OwlCors`, and `OwlIsAuth` handle cross-cutting Express concerns.

The application remains responsible for request validation, authorization policy, business rules, route organization, and its public error policy.

## Automated Publishing

The repository includes a GitHub Actions workflow at `.github/workflows/publish.yml`.

- Pull requests targeting `main` run `npm test` and `npm run build`.
- Commits and merges pushed to `main` run tests before building and publish the package only after validation succeeds.
- Manual runs are available through the **Run workflow** button in GitHub Actions.

The `test:build` script always runs `npm test` before `npm run build`. The `prepublishOnly` lifecycle hook runs the test suite again immediately before any `npm publish`, including publishes started outside GitHub Actions.

Before the workflow can publish, add an Actions repository secret named `NPM_TOKEN` containing an npm access token with permission to publish `owl-expressjs-utils`. The workflow uses the `npm` GitHub environment, so configure that environment if you want to require an approval before publishing.

Each successful publication automatically selects the next patch version from the latest version published on npm. For example, a repository version of `1.0.0` is published as `1.0.1`, then `1.0.2` on the next push.

## Development Scripts

```bash
npm run build       # Type-check and create ESM, CommonJS, and declaration builds
npm test            # Run the Vitest test suite
npm run test:build  # Run tests, then build the package
npm run test:ui     # Open the Vitest UI
```

Before opening a pull request, run the same checks used by CI:

```bash
npm test
npm run build
```

The build performs TypeScript validation and creates ESM, CommonJS, and declaration outputs. The package is intended for Node.js backends and should not be bundled for browser use.

## Contributing

Issues and pull requests are welcome. Keep contributions focused on reusable backend behavior and preserve the existing public API unless a breaking change is intentional and documented.

Recommended workflow:

1. Create a branch from `main`.
2. Make the smallest focused change.
3. Add or update tests for behavior changes.
4. Update the relevant Markdown documentation and JSDoc.
5. Run `npm test` and `npm run build`.
6. Open a pull request describing the behavior, compatibility impact, and validation performed.

Please do not commit secrets, MongoDB credentials, npm tokens, generated build output, or production encryption keys. For security-sensitive issues, use the repository's private GitHub security reporting process instead of publishing exploit details in a public issue.

## Maintainer

`owl-expressjs-utils` is maintained by [KaguilarA](https://github.com/KaguilarA).

- GitHub: [github.com/KaguilarA](https://github.com/KaguilarA)
- Repository: [KaguilarA/owl-expressjs-utils](https://github.com/KaguilarA/owl-expressjs-utils)
- npm: [owl-expressjs-utils](https://www.npmjs.com/package/owl-expressjs-utils)

Contributors are credited through Git history and merged pull requests. Thank you for helping make the library more useful across backend projects.

## License

This project is licensed under the terms of the [MIT License](LICENSE).

