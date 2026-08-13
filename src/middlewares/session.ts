import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

/**
 * Creates and configures an express-session middleware with MongoDB as the session store.
 * Sessions are persisted in MongoDB and automatically cleaned up after maxAge.
 * 
 * @param {string} secret - Secret key for session encryption
 * @param {string} env - Environment name (e.g., 'production', 'development')
 * @param {string} dbName - Database name for storing sessions
 * @param {string} [mongoUrl] - Optional MongoDB URI used when a Mongoose client is not available
 * @returns {Function} Express session middleware
 * 
 * @example
 * ```ts
 * import express from 'express';
 * import sessionMiddleware from './session.js';
 * 
 * const app = express();
 * 
 * app.use(sessionMiddleware('secret-key', 'production', 'mydb', process.env.MONGO_URI));
 * ```
 */
export default function (
  secret: string,
  env: string,
  dbName: string,
  mongoUrl?: string,
) {
  const client = mongoose.connection.getClient();
  const storeOptions = mongoUrl
    ? { mongoUrl }
    : client
      ? { client }
      : (() => {
          throw new Error(
            "MongoDB session store requires a connected Mongoose client or a mongoUrl.",
          );
        })();

  const mongoStore = MongoStore.create({
    ...storeOptions,
    dbName,
    touchAfter: 24 * 3600,
    crypto: { secret },
  } as any);

  return session({
    secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: mongoStore,
    cookie: {
      secure: env === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  });
}
