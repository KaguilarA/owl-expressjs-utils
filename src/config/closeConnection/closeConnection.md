# OwlMongoClose

Closes the active default Mongoose connection and terminates the Node.js process.

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

On success, the helper disconnects Mongoose, logs a confirmation message, and exits with status `0`. If disconnection fails, it logs the error and exits with status `1`.

Because this function calls `process.exit`, do not use it as a general request handler or invoke it while the application still needs to serve traffic. Register the handler once during application bootstrap.
