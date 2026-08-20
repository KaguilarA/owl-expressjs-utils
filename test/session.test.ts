import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";

vi.mock("mongoose", () => ({
  default: {
    connection: {
      getClient: vi.fn(() => ({})),
    },
  },
}));

vi.mock("connect-mongo", () => ({
  default: {
    create: vi.fn(() => new EventEmitter()),
  },
}));

import sessionMiddleware from "../src/middlewares/session/session";

describe("Session Middleware Factory", () => {
  it("should export a session middleware factory", () => {
    expect(typeof sessionMiddleware).toBe("function");
  });

  it("should return a middleware function without connecting to MongoDB", () => {
    const middleware = sessionMiddleware("test-secret", "development", "testdb");

    expect(typeof middleware).toBe("function");
  });
});
