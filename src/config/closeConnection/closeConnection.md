# OwlMongoClose

Closes the active default Mongoose connection without terminating the Node.js process.

## Import

```ts
import { OwlMongoClose } from "owl-expressjs-utils";
```

## Usage

Register it as a handler for process termination signals:

```ts
process.once("SIGINT", OwlMongoClose);
process.once("SIGTERM", OwlMongoClose);
```

On success, the helper disconnects Mongoose and resolves. If disconnection fails, it rejects with the original error so the application can choose its shutdown policy.

Do not use it as a general request handler or invoke it while the application still needs to serve traffic. Register the handler once during application bootstrap and handle rejected shutdown promises in the application.
