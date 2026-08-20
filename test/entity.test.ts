import { beforeEach, describe, expect, it, vi } from "vitest";
import entityFactory from "../src/utils/entity/entity";

describe("Entity Factory", () => {
  let model: {
    delete: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    getByCoincidence: ReturnType<typeof vi.fn>;
    getOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let entity: ReturnType<typeof entityFactory>;

  beforeEach(() => {
    model = {
      delete: vi.fn(),
      getAll: vi.fn(),
      getById: vi.fn(),
      getByCoincidence: vi.fn(),
      getOne: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };
    entity = entityFactory({
      entityId: "User",
      model,
      populatedFields: ["profile", "roles.permissions"],
    });
  });

  it("delegates all read operations with configured population", async () => {
    model.getAll.mockResolvedValue([{ id: "1" }]);
    model.getById.mockResolvedValue({ id: "1" });
    model.getByCoincidence.mockResolvedValue([{ id: "1" }]);
    model.getOne.mockResolvedValue({ id: "1" });

    await expect(entity.getAll()).resolves.toEqual([{ id: "1" }]);
    await expect(entity.getById("1")).resolves.toEqual({ id: "1" });
    await expect(entity.getByCoincidence({ active: true })).resolves.toEqual([{ id: "1" }]);
    await expect(entity.getOne({ email: "ada@example.com" })).resolves.toEqual({ id: "1" });

    const options = { populate: ["profile", "roles.permissions"] };
    expect(model.getAll).toHaveBeenCalledWith(options);
    expect(model.getById).toHaveBeenCalledWith("1", options);
    expect(model.getByCoincidence).toHaveBeenCalledWith({ active: true }, options);
    expect(model.getOne).toHaveBeenCalledWith({ email: "ada@example.com" }, options);
  });

  it("delegates create, update, and delete operations", async () => {
    model.save.mockResolvedValue({ id: "1" });
    model.update.mockResolvedValue({ id: "1", active: false });
    model.delete.mockResolvedValue({ id: "1" });

    await expect(entity.save({ name: "Ada" })).resolves.toEqual({ id: "1" });
    await expect(entity.update("1", { active: false })).resolves.toEqual({ id: "1", active: false });
    await expect(entity.deleteById("1")).resolves.toEqual({ id: "1" });

    expect(model.save).toHaveBeenCalledWith({ name: "Ada" });
    expect(model.update).toHaveBeenCalledWith("1", { active: false }, {
      populate: ["profile", "roles.permissions"],
    });
    expect(model.delete).toHaveBeenCalledWith("1");
  });

  it("rethrows model errors after logging context", async () => {
    const error = new Error("database unavailable");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    model.getById.mockRejectedValue(error);

    await expect(entity.getById("missing")).rejects.toBe(error);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to get entity User by ID: missing",
      error,
    );

    consoleError.mockRestore();
  });
});
