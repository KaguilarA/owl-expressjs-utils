/** Reusable model and Express controller factories. */

/** Creates a Mongoose model with CRUD, security, population, and pagination helpers. */
export { default as OwlModel } from "./model/model";

/** Creates Express handlers for common CRUD operations. */
export { default as OwlController } from "./controller/controller";
