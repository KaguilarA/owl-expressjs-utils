# Configuration Utilities

The `src/config` module contains reusable configuration helpers for Express.js backends:

- `OwlMongoConnect` opens a Mongoose connection to MongoDB.
- `OwlMongoClose` closes the active Mongoose connection without terminating the process.
- `OwlCrypto` provides AES-256-GCM encryption and decryption helpers.

The package re-exports these utilities from its root entry point, so consumers can import them directly:

```ts
import {
	OwlCrypto,
	OwlMongoClose,
	OwlMongoConnect,
} from "owl-expressjs-utils";
```

## Recommended startup sequence

Connect to MongoDB before registering features that depend on the active Mongoose connection, such as models and MongoDB-backed sessions:

```ts
import express from "express";
import { OwlMongoConnect } from "owl-expressjs-utils";

const app = express();

await OwlMongoConnect(process.env.MONGO_URI as string);

app.use(express.json());

app.listen(3000);
```

`OwlMongoConnect` throws when no URL is provided or when Mongoose cannot connect. The caller controls retries, logging, and process shutdown. Optional Mongoose connection settings can be passed as the second argument.

## Graceful shutdown

Use `OwlMongoClose` when the application receives a termination signal:

```ts
import { OwlMongoClose } from "owl-expressjs-utils";

process.once("SIGINT", OwlMongoClose);
process.once("SIGTERM", OwlMongoClose);
```

The helper disconnects Mongoose and propagates errors to the signal handler. Register each signal handler once and decide in the application whether a shutdown error should affect the process exit code.
