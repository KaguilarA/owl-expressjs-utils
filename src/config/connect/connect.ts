import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";

/**
 * Establishes a secure connection to the MongoDB database using Mongoose.
 * Validates the connection URI and opens the default Mongoose connection.
 * @param {string} url The MongoDB connection URI.
 * @param {ConnectOptions} [options={}] Optional Mongoose connection options.
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 * @throws {Error} Throws if the URI is missing or Mongoose cannot connect. The
 * caller controls process lifecycle and may decide whether to retry or exit.
 * @example
 * ```ts
 * import connectToMongoDB from './connect.js';
 * 
 * await connectToMongoDB(process.env.MONGO_URI);
 * ```
 */
export default async (url: string, options: ConnectOptions = {}): Promise<void> => {
  if (!url) throw new Error("Mongo db url is not defined");

  mongoose.set("strictQuery", true);

  await mongoose.connect(url, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 2000,
    retryWrites: true,
    ...options,
  });

  console.log("MongoDB connected successfully");
};