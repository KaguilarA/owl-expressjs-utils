import type { ModelReturn } from './modelReturn';

/**
 * Configuration for utilities that operate on a reusable model entity.
 */
export interface EntityConfig {
  /** Resource name used to identify the entity in responses and errors. */
  entityId: string;

  /** Model helper used to read, create, update, and delete entity documents. */
  model: ModelReturn;

  /** Relationship paths populated by entity queries when supported. */
  populatedFields?: string[];
}