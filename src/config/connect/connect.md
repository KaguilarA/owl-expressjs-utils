# OwlMongoConnect

Opens the default Mongoose connection to MongoDB using the supplied connection URI.

## Import

```ts
import { OwlMongoConnect } from "owl-expressjs-utils";
```

## Usage

```ts
const mongoUrl = process.env.MONGO_URI;

if (!mongoUrl) {
	throw new Error("MONGO_URI is required");
}

await OwlMongoConnect(mongoUrl);
```

The promise resolves after Mongoose connects successfully. The helper enables strict query handling and configures a bounded connection pool, retryable writes, server selection timeout, socket timeout, and heartbeat frequency for backend workloads.

## Failure behavior

The function throws when the URI is empty. If Mongoose fails to connect, it logs the original error and exits the process with status `1`. This behavior is suitable for application startup, where an unavailable database makes the backend unusable; callers should validate configuration before invoking it.

Call this helper once during application startup, before creating MongoDB-backed models or session stores:

```ts
await OwlMongoConnect(process.env.MONGO_URI as string);
// Register models, sessions, and routes after the connection is ready.
```
