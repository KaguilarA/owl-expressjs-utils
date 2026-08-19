import mongoose from "mongoose";

/**
 * Establishes a secure connection to the MongoDB database using Mongoose.
 * Validates the presence of the connection URI in environment variables and handles connection errors.
 * @param {string} url The MongoDB connection URI.
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 * @throws {Error} Throws an error if the connection URI is not defined or if the connection fails.
 * @example
 * ```ts
 * import connectToMongoDB from './connect.js';
 * 
 * await connectToMongoDB(process.env.MONGO_URI);
 * ```
 */
export default async (url: string) => {
  if (!url) throw new Error("Mongo db url is not defined");

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(url, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 2000,
      retryWrites: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};