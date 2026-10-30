import { Request, Response } from 'express';
import { ControllerConfig } from './../../interfaces';
/**
 * Controller factory for handling HTTP requests and responses for a given model.
 * @param {Object} config - Configuration object.
 * @param {string} config.entityId - Identifier or name of the entity.
 * @param {Object} config.model - Data access model instance containing CRUD operations.
 * @param {string|string[]|Object} [config.populatedFields=[]] - Default fields to populate on queries.
 * @returns {Object} An object containing Express controller functions.
 * @example
 * ```ts
 * import { Router } from 'express';
 * import createController from './controller.js';
 *
 * const app = Router();
 *
 * const userController = createController({
 *   entityId: 'User',
 *   model: userModel,
 *   populatedFields: ['profile', 'roles'],
 * });
 *
 * app.get('/users', userController.getAll);
 * app.get('/users/:id', userController.getById);
 * app.post('/users', userController.register);
 * app.put('/users/:id', userController.update);
 * app.delete('/users/:id', userController.delete);
 *
 * export default app;
 * ```
 */
declare const _default: ({ entityId, model, populatedFields }: ControllerConfig) => {
    delete: (req: Request, res: Response) => Promise<void>;
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    getByCoincidence: (req: Request, res: Response) => Promise<void>;
    getOne: (req: Request, res: Response) => Promise<void>;
    register: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
};
export default _default;
