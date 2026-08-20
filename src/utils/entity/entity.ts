import type { EntityConfig } from './../../interfaces';

/**
 * Creates a reusable entity service around a model helper.
 *
 * The service centralizes common data-access calls, applies the configured
 * population paths, logs contextual failures, and rethrows the original error
 * for the application to handle.
 *
 * @param {EntityConfig} config Entity name, model helper, and population paths.
 * @returns An entity service with CRUD and query methods.
 * @example
 * ```ts
 * const userEntity = OwlEntity({
 *   entityId: "User",
 *   model: UserModel,
 *   populatedFields: ["profile", "roles"],
 * });
 *
 * const user = await userEntity.getById(userId);
 * ```
 */
export default ({ entityId, model, populatedFields = [] }: EntityConfig) => {

  /** Deletes an entity by its identifier. */
  const deleteById = async (id: string) => {
    try {
      const deletedEntity = await model.delete(id);
      return deletedEntity;
    } catch (error) {
      console.error(`Failed to delete entity ${entityId} with ID: ${id}`, error);
      throw error;
    }
  };

  /** Retrieves all entities with the configured population paths. */
  const getAll = async () => {
    try {
      const entities = await model.getAll({ populate: populatedFields });
      return entities;
    } catch (error) {
      console.error(`Failed to get all entities for ${entityId}`, error);
      throw error;
    }
  };

  /** Retrieves one entity by its identifier. */
  const getById = async (id: string) => {
    try {
      const entity = await model.getById(id, { populate: populatedFields });
      return entity;
    } catch (error) {
      console.error(`Failed to get entity ${entityId} by ID: ${id}`, error);
      throw error;
    }
  };

  /** Retrieves entities matching a Mongoose filter. */
  const getByCoincidence = async (searchQuery: any) => {
    try {
      const entities = await model.getByCoincidence(searchQuery, { populate: populatedFields });
      return entities;
    } catch (error) {
      console.error(`Failed to get entity ${entityId} by coincidence with query:`, searchQuery, error);
      throw error;
    }
  };

  /** Retrieves the first entity matching a Mongoose filter. */
  const getOne = async (filter: any) => {
    try {
      const entity = await model.getOne(filter, { populate: populatedFields });
      return entity;
    } catch (error) {
      console.error(`Failed to get one entity ${entityId} with filter:`, filter, error);
      throw error;
    }
  };

  /** Creates and persists an entity from arbitrary document data. */
  const save = async (data: any) => {
    try {
      const savedEntity = await model.save(data);
      return savedEntity;
    } catch (error) {
      console.error(`Failed to save entity ${entityId} with data:`, data, error);
      throw error;
    }
  };

  /** Updates an entity by its identifier and applies configured population. */
  const update = async (id: string, data: any) => {
    try {
      const updatedEntity = await model.update(id, data, { populate: populatedFields });
      return updatedEntity;
    } catch (error) {
      console.error(`Failed to update entity ${entityId} with ID: ${id} and data:`, data, error);
      throw error;
    }
  };

  return {
    deleteById,
    getAll,
    getById,
    getByCoincidence,
    getOne,
    save,
    update,
  };
}