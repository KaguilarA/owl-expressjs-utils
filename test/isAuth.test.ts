import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import isAuth from "../src/middlewares/isAuth/isAuth";

describe("Authentication Middleware", () => {
  it("calls next for a session with a user ID", () => {
    const next = vi.fn();
    const req = { session: { userId: "user-1" } } as unknown as Request;
    const res = {} as Response;

    isAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 401 when the session has no user ID", () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const next = vi.fn();
    const req = { session: {} } as unknown as Request;
    const res = { status } as unknown as Response;

    isAuth(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      authenticated: false,
      error: "No autorizado",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an empty user ID", () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const req = { session: { userId: "" } } as unknown as Request;

    isAuth(req, { status } as unknown as Response, vi.fn());

    expect(status).toHaveBeenCalledWith(401);
  });
});
