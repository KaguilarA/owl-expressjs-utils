import mongoose from "mongoose";

/**
 * Closes the active Mongoose connection and terminates the Node.js process.
 *
 * Use this helper from `SIGINT` and `SIGTERM` handlers during application
 * shutdown. It exits with status `0` after a successful disconnect and status
 * `1` when the disconnect fails.
 *
 * @returns {Promise<void>} A promise that settles immediately before the
 * process exits.
 * @example
 * ```ts
 * import { OwlMongoClose } from "owl-expressjs-utils";
 *
 * process.once("SIGTERM", OwlMongoClose);
 * ```
 */
export default async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected successfully.");
    process.exit(0);
  } catch (err) {
    console.error("MongoDB disconnection failed:", err);
    process.exit(1);
  }
}