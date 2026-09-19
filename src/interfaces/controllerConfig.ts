/**
 * Configuration required to create an Express CRUD controller.
 */
export interface ControllerConfig {
  /** Resource name used in controller error messages and responses. */
  entityId: string;

  /** Model helper that provides the controller's CRUD operations. */
  model: any;

  /** Relationships to populate when controller queries retrieve documents. */
  populatedFields?: string[];
}