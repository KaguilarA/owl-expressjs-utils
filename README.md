# owl-expressjs-utils

Reusable TypeScript utilities for building Express.js applications backed by MongoDB and Mongoose.

`owl-expressjs-utils` provides small, composable building blocks for common API concerns:

- MongoDB connection setup with Mongoose
- CORS middleware with an origin allowlist
- MongoDB-backed Express sessions
- Session-based authentication middleware
- AES-256-GCM encryption and bcrypt password hashing
- Mongoose model factories with CRUD, population, search, and pagination helpers
- Express controller factories for standard CRUD routes

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
| `OwlCripto` | Encrypts and decrypts values with AES-256-GCM. |
| `OwlModel` | Creates a Mongoose model with security and query helpers. |
| `OwlController` | Creates Express handlers for common CRUD operations. |
| `ControllerConfig` | TypeScript configuration type for `OwlController`. |
| `QueryOptions` | TypeScript options type for model queries. |

## MongoDB Connection

`OwlMongoConnect` validates the URI, configures Mongoose connection options, and opens the connection.

```ts
import { OwlMongoConnect } from "owl-expressjs-utils";

await OwlMongoConnect("mongodb://127.0.0.1:27017/example");
```

The function logs connection failures and exits the process when the connection cannot be established. Handle configuration and deployment errors accordingly.

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

`OwlCripto` uses AES-256-GCM and formats encrypted values as `iv:authTag:ciphertext`.

```ts
import { OwlCripto } from "owl-expressjs-utils";

OwlCripto.setEncryptionKey(process.env.ENCRYPTION_KEY as string);

const encrypted = OwlCripto.encrypt("private value");
const plainText = OwlCripto.decrypt(encrypted as string);
const isEncrypted = OwlCripto.isEncrypted(encrypted);
```

The key must be a 64-character hexadecimal string representing 32 bytes. Configure a unique production key before encrypting application data. The module initializes with a development key, but that default must not be used for sensitive production data.

Available methods:

- `setEncryptionKey(key)` changes the 32-byte encryption key.
- `setEncryptionAlgorithm(algorithm)` changes the Node.js cipher algorithm.
- `encrypt(value)` encrypts a value and preserves `null` or `undefined`.
- `decrypt(value)` decrypts a formatted encrypted value.
- `isEncrypted(value)` checks whether a value has the expected encrypted structure.

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

`OwlSession` stores Express sessions in MongoDB through `connect-mongo`.

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

## Development Scripts

```bash
npm run build       # Type-check and create ESM, CommonJS, and declaration builds
npm test            # Run the Vitest test suite
npm run test:ui     # Open the Vitest UI
```

## License

This project is licensed under the terms of the [MIT License](LICENSE).

