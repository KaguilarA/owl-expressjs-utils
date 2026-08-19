// Owl ExpressJS Utils - A collection of utilities for building ExpressJS applications.

// Functions related to configuration management, including loading and validating environment variables.
export * from "./config";

// Cryptography utilities.
export { default as OwlCripto } from "./utils/crypto";

// Model for handling database operations for a given schema.
export { default as OwlModel } from "./utils/model";

// Basic Controller for handling HTTP requests and responses for a given owlModel.
export { default as OwlController } from "./utils/controller";

// Session management middleware for ExpressJS using MongoDB as the session store.
export { default as OwlSession } from "./middlewares/session";

// Authentication middleware to check if a user is authenticated based on session data.
export { default as OwlIsAuth } from "./middlewares/isAuth";

// Types & Interfaces
export type { ControllerConfig } from "./interfaces/controllerConfig";
export type { ModelReturn } from "./interfaces/modelReturn";
export type { QueryOptions } from "./interfaces/queryOptions";