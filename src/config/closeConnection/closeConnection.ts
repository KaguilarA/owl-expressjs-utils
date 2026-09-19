import mongoose from "mongoose";

/**
 * Closes the active Mongoose connection.
 *
 * Use this helper from `SIGINT` and `SIGTERM` handlers during application
 * shutdown. Errors are rethrown so the application can decide how to report or
 * handle them.
 *
 * @returns {Promise<void>} A promise that resolves after disconnection.
 * @throws {Error} If Mongoose cannot disconnect.
 * @example
 * ```ts
 * import { OwlMongoClose } from "owl-expressjs-utils";
 *
 * process.once("SIGTERM", OwlMongoClose);
 * ```
 */
export default async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected successfully.");
}