import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import corsMiddleware from "../src/middlewares/cors/cors";

describe("CORS Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    next = vi.fn();
    res = {
      setHeader: vi.fn(),
      sendStatus: vi.fn(),
    };
  });

  describe("allowed origins", () => {
    it("should set CORS headers for allowed origin", () => {
      const allowedOrigins = ["http://localhost:3000"];
      const middleware = corsMiddleware(allowedOrigins);

      req = {
        headers: { origin: "http://localhost:3000" },
        method: "GET",
      };

      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "http://localhost:3000"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Credentials",
        "true"
      );
      expect(next).toHaveBeenCalled();
    });

    it("should not set origin header for disallowed origin", () => {
      const allowedOrigins = ["http://localhost:3000"];
      const middleware = corsMiddleware(allowedOrigins);

      req = {
        headers: { origin: "http://malicious-site.com" },
        method: "GET",
      };

      middleware(req as Request, res as Response, next);

      expect(res.setHeader).not.toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "http://malicious-site.com"
      );
      expect(next).toHaveBeenCalled();
    });

    it("should handle missing origin header", () => {
      const allowedOrigins = ["http://localhost:3000"];
      const middleware = corsMiddleware(allowedOrigins);

      req = {
        headers: {},
        method: "GET",
      };

      middleware(req as Request, res as Response, next);

      expect(res.setHeader).not.toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        expect.anything()
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe("standard headers", () => {
    it("should always set standard CORS headers", () => {
      const allowedOrigins = ["http://localhost:3000"];
      const middleware = corsMiddleware(allowedOrigins);

      req = {
        headers: { origin: "http://localhost:3000" },
        method: "GET",
      };

      middleware(req as Request, res as Response, next);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    });
  });

  describe("preflight requests", () => {
    it("should handle OPTIONS requests with 204 status", () => {
      const allowedOrigins = ["http://localhost:3000"];
      const middleware = corsMiddleware(allowedOrigins);

      req = {
        headers: { origin: "http://localhost:3000" },
        method: "OPTIONS",
      };

      middleware(req as Request, res as Response, next);

      expect(res.sendStatus).toHaveBeenCalledWith(204);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next() for non-OPTIONS requests", () => {
      const allowedOrigins = ["http://localhost:3000"];
      const middleware = corsMiddleware(allowedOrigins);

      req = {
        headers: { origin: "http://localhost:3000" },
        method: "GET",
      };

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe("multiple allowed origins", () => {
    it("should accept any of the allowed origins", () => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://example.com",
        "https://app.example.com",
      ];
      const middleware = corsMiddleware(allowedOrigins);

      for (const origin of allowedOrigins) {
        req = {
          headers: { origin },
          method: "GET",
        };

        middleware(req as Request, res as Response, next);

        expect(res.setHeader).toHaveBeenCalledWith(
          "Access-Control-Allow-Origin",
          origin
        );
      }
    });
  });
});
