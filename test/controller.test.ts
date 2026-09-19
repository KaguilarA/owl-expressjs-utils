import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import controllerFactory from "../src/utils/controller/controller";

describe("Controller Factory", () => {
  let mockModel: any;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let controller: any;

  beforeEach(() => {
    mockModel = {
      delete: vi.fn(),
      getAll: vi.fn(),
      getById: vi.fn(),
      getOne: vi.fn(),
      getByCoincidence: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
    };

    controller = controllerFactory({
      entityId: "User",
      model: mockModel,
      populatedFields: ["profile"],
    });
  });

  describe("getAll", () => {
    it("should retrieve all documents", async () => {
      const mockData = [{ id: 1, name: "User 1" }];
      mockModel.getAll.mockResolvedValue(mockData);

      req = {
        query: {},
      };

      await controller.getAll(req as Request, res as Response);

      expect(mockModel.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ populate: ["profile"] })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("should handle pagination parameters", async () => {
      const mockData = [{ id: 1, name: "User 1" }];
      mockModel.getAll.mockResolvedValue(mockData);

      req = {
        query: { page: "1", pageSize: "10" },
      };

      await controller.getAll(req as Request, res as Response);

      expect(mockModel.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          populate: ["profile"],
          page: 1,
          pageSize: 10,
        })
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      mockModel.getAll.mockRejectedValue(error);

      req = {
        query: {},
      };

      await controller.getAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User list error.",
          error: "Database error",
        })
      );
    });
  });

  describe("getById", () => {
    it("should retrieve a document by ID", async () => {
      const mockUser = { id: "123", name: "User 1" };
      mockModel.getById.mockResolvedValue(mockUser);

      req = {
        params: { id: "123" },
      };

      await controller.getById(req as Request, res as Response);

      expect(mockModel.getById).toHaveBeenCalledWith("123", {
        populate: ["profile"],
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 when document not found", async () => {
      mockModel.getById.mockResolvedValue(null);

      req = {
        params: { id: "123" },
      };

      await controller.getById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found.",
      });
    });
  });

  describe("getByCoincidence", () => {
    it("should search documents by coincidence", async () => {
      const mockResults = [{ id: 1, name: "John" }];
      mockModel.getByCoincidence.mockResolvedValue(mockResults);

      req = {
        body: { query: { name: "John" } },
      };

      await controller.getByCoincidence(req as Request, res as Response);

      expect(mockModel.getByCoincidence).toHaveBeenCalledWith(
        { name: "John" },
        expect.objectContaining({ populate: ["profile"] })
      );
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it("should return 400 when query is missing", async () => {
      req = {
        body: {},
      };

      await controller.getByCoincidence(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Search query is required in request body.",
      });
    });

    it("should handle pagination in search", async () => {
      const mockResults = [{ id: 1, name: "John" }];
      mockModel.getByCoincidence.mockResolvedValue(mockResults);

      req = {
        body: { query: { name: "John" }, page: 1, pageSize: 20 },
      };

      await controller.getByCoincidence(req as Request, res as Response);

      expect(mockModel.getByCoincidence).toHaveBeenCalledWith(
        { name: "John" },
        expect.objectContaining({ page: 1, pageSize: 20 })
      );
    });
  });

  describe("register", () => {
    it("should create a new document", async () => {
      const newUser = { id: "123", name: "New User" };
      mockModel.save.mockResolvedValue(newUser);

      req = {
        body: { name: "New User" },
      };

      await controller.register(req as Request, res as Response);

      expect(mockModel.save).toHaveBeenCalledWith({ name: "New User" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newUser);
    });

    it("should handle save errors", async () => {
      const error = new Error("Validation error");
      mockModel.save.mockRejectedValue(error);

      req = {
        body: { name: "" },
      };

      await controller.register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User register error.",
          error: "Validation error",
        })
      );
    });
  });

  describe("update", () => {
    it("should update a document", async () => {
      const updatedUser = { id: "123", name: "Updated User" };
      mockModel.update.mockResolvedValue(updatedUser);

      req = {
        params: { id: "123" },
        body: { name: "Updated User" },
      };

      await controller.update(req as Request, res as Response);

      expect(mockModel.update).toHaveBeenCalledWith("123", { name: "Updated User" }, {
        populate: ["profile"],
      });
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it("should return 404 when document not found", async () => {
      mockModel.update.mockResolvedValue(null);

      req = {
        params: { id: "123" },
        body: { name: "Updated User" },
      };

      await controller.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found.",
      });
    });
  });

  describe("delete", () => {
    it("should delete a document", async () => {
      const deletedUser = { id: "123", name: "User 1" };
      mockModel.delete.mockResolvedValue(deletedUser);

      req = {
        params: { id: "123" },
      };

      await controller.delete(req as Request, res as Response);

      expect(mockModel.delete).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith({
        message: "User removed.",
      });
    });

    it("should return 404 when document not found", async () => {
      mockModel.delete.mockResolvedValue(null);

      req = {
        params: { id: "123" },
      };

      await controller.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found.",
      });
    });
  });
});
