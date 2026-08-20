import type { Request, Response } from "express";
import type { ControllerConfig } from "./../../interfaces";

/**
 * Creates Express handlers for common CRUD and search operations.
 * @param {Object} config - Configuration object.
 * @param {string} config.entityId - Identifier or name of the entity.
 * @param {Object} config.model - Data access model instance containing CRUD operations.
 * @param {string|string[]|Object} [config.populatedFields=[]] - Default fields to populate on queries.
 * @returns An object containing Express controller functions.
 * The returned handlers use `req.params.id`, `req.body`, and documented query
 * parameters according to the operation.
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
export default ({ entityId, model, populatedFields = [] }: ControllerConfig) => {
  /**
   * Deletes a document by its ID from request parameters.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedData = await model.delete(id);

      if (!deletedData) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json({ message: `${entityId} removed.` });
    } catch (error) {
      res.status(500).json({
        message: `${entityId} remove error.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Retrieves all documents with default populations applied and optional pagination support.
   * @param {import("express").Request} req - Express request object with optional query params (page, pageSize, limit, skip).
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : undefined;

      const options: any = {
        populate: populatedFields,
      };

      if (page !== undefined) options.page = page;
      if (pageSize !== undefined) options.pageSize = pageSize;
      if (limit !== undefined) options.limit = limit;
      if (skip !== undefined) options.skip = skip;

      const allData = await model.getAll(options);

      res.json(allData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} list error.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Retrieves a single document by its unique ID from request parameters.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const coincidence = await model.getById(id, {
        populate: populatedFields,
      });

      if (!coincidence) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(coincidence);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} search error.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Finds a single document matching criteria passed via request query or body.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getOne(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter as string) : req.body;
      const coincidence = await model.getOne(filter, {
        populate: populatedFields,
      });

      if (!coincidence) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(coincidence);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} search error.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Searches for documents matching criteria passed via request body with optional pagination support.
   * @param {import("express").Request} req - Express request object with search query in body.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function getByCoincidence(req: Request, res: Response): Promise<void> {
    try {
      const { query, page, pageSize, limit, skip } = req.body;

      if (!query) {
        res.status(400).json({
          message: "Search query is required in request body.",
        });
        return;
      }

      const options: any = {
        populate: populatedFields,
      };

      if (page !== undefined) options.page = page;
      if (pageSize !== undefined) options.pageSize = pageSize;
      if (limit !== undefined) options.limit = limit;
      if (skip !== undefined) options.skip = skip;

      const results = await model.getByCoincidence(query, options);

      res.json(results);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} search error.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Registers and saves a new document using request body data.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function register(req: Request, res: Response): Promise<void> {
    try {
      const newData = await model.save(req.body);
      res.status(201).json(newData);
    } catch (error) {
      res.status(400).json({
        message: `${entityId} register error.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Updates an existing document by its ID using request body data.
   * @param {import("express").Request} req - Express request object.
   * @param {import("express").Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async function update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedData = await model.update(id, req.body, {
        populate: populatedFields,
      });

      if (!updatedData) {
        res.status(404).json({ message: `${entityId} not found.` });
        return;
      }

      res.json(updatedData);
    } catch (error) {
      res.status(500).json({
        message: `${entityId} error update.`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    delete: remove,
    getAll,
    getById,
    getByCoincidence,
    getOne,
    register,
    update,
  };
};
