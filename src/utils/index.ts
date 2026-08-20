/** Reusable model, entity, and Express controller factories. */

/** Creates a Mongoose model with CRUD, security, population, and pagination helpers. */
export { default as OwlModel } from "./model/model";

/** Creates Express handlers for common CRUD operations. */
export { default as OwlController } from "./controller/controller";

/** Creates an entity service that delegates data access to a model helper. */
export { default as OwlEntity } from "./entity/entity";