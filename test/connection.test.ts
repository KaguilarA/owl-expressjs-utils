import { beforeEach, describe, expect, it, vi } from "vitest";

const mongooseMock = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  set: vi.fn(),
}));

vi.mock("mongoose", () => ({ default: mongooseMock }));

import connect from "../src/config/connect/connect";
import closeConnection from "../src/config/closeConnection/closeConnection";

describe("MongoDB connection utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mongooseMock.connect.mockResolvedValue(undefined);
    mongooseMock.disconnect.mockResolvedValue(undefined);
  });

  it("validates the MongoDB URL before connecting", async () => {
    await expect(connect("")).rejects.toThrow("Mongo db url is not defined");
    expect(mongooseMock.connect).not.toHaveBeenCalled();
  });

  it("merges custom Mongoose connection options", async () => {
    await connect("mongodb://localhost/app", {
      maxPoolSize: 25,
      serverSelectionTimeoutMS: 2_000,
    });

    expect(mongooseMock.set).toHaveBeenCalledWith("strictQuery", true);
    expect(mongooseMock.connect).toHaveBeenCalledWith("mongodb://localhost/app", {
      maxPoolSize: 25,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 2_000,
      socketTimeoutMS: 45_000,
      heartbeatFrequencyMS: 2_000,
      retryWrites: true,
    });
  });

  it("propagates connection errors without terminating the process", async () => {
    const error = new Error("database unavailable");
    mongooseMock.connect.mockRejectedValue(error);

    await expect(connect("mongodb://localhost/app")).rejects.toBe(error);
  });

  it("closes the connection without terminating the process", async () => {
    await expect(closeConnection()).resolves.toBeUndefined();
    expect(mongooseMock.disconnect).toHaveBeenCalledOnce();
  });

  it("propagates disconnection errors", async () => {
    const error = new Error("disconnect failed");
    mongooseMock.disconnect.mockRejectedValue(error);

    await expect(closeConnection()).rejects.toBe(error);
  });
});
