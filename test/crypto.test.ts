import { describe, it, expect, beforeEach } from "vitest";
import OwlCrypto from "../src/config/crypto/crypto";

describe("Crypto Module", () => {
  beforeEach(() => {
    // Reset to default key before each test
    OwlCrypto.setEncryptionKey(
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
    );
  });

  describe("encrypt", () => {
    it("should encrypt a string successfully", () => {
      const plaintext = "Hello, World!";
      const encrypted = OwlCrypto.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(":")).toHaveLength(3);
    });

    it("should handle null values", () => {
      const result = OwlCrypto.encrypt(null);
      expect(result).toBeNull();
    });

    it("should handle undefined values", () => {
      const result = OwlCrypto.encrypt(undefined);
      expect(result).toBeUndefined();
    });

    it("should encrypt numbers by converting to string", () => {
      const num = 12345;
      const encrypted = OwlCrypto.encrypt(num);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(encrypted.split(":")).toHaveLength(3);
    });
  });

  describe("decrypt", () => {
    it("should decrypt an encrypted string correctly", () => {
      const plaintext = "Sensitive Data";
      const encrypted = OwlCrypto.encrypt(plaintext);
      const decrypted = OwlCrypto.decrypt(encrypted as string);

      expect(decrypted).toBe(plaintext);
    });

    it("should throw on invalid encrypted text format", () => {
      const invalidEncrypted = "xx:xx:xx";

      expect(() => {
        OwlCrypto.decrypt(invalidEncrypted);
      }).toThrow();
    });

    it("should throw on missing parts in encrypted text", () => {
      const missingParts = "onlyOne";

      expect(() => {
        OwlCrypto.decrypt(missingParts);
      }).toThrow("Invalid encrypted text format");
    });
  });

  describe("isEncrypted", () => {
    it("should return true for encrypted strings", () => {
      const plaintext = "Test";
      const encrypted = OwlCrypto.encrypt(plaintext);

      expect(OwlCrypto.isEncrypted(encrypted)).toBe(true);
    });

    it("should return false for non-encrypted strings", () => {
      expect(OwlCrypto.isEncrypted("plaintext")).toBe(false);
      expect(OwlCrypto.isEncrypted("some:random:string")).toBe(false);
    });

    it("should return false for non-string values", () => {
      expect(OwlCrypto.isEncrypted(123)).toBe(false);
      expect(OwlCrypto.isEncrypted(null)).toBe(false);
      expect(OwlCrypto.isEncrypted(undefined)).toBe(false);
      expect(OwlCrypto.isEncrypted({})).toBe(false);
      expect(OwlCrypto.isEncrypted([])).toBe(false);
    });
  });

  describe("setEncryptionKey", () => {
    it("should reject invalid keys without replacing the active key", () => {
      expect(() => OwlCrypto.setEncryptionKey("invalid-key")).toThrow(
        "Encryption key must be a 64-character hexadecimal string",
      );

      const encrypted = OwlCrypto.encrypt("still configured");
      expect(OwlCrypto.decrypt(encrypted as string)).toBe("still configured");
    });

    it("should update the encryption key", () => {
      const newKey =
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      OwlCrypto.setEncryptionKey(newKey);

      const plaintext = "Test";
      const encrypted = OwlCrypto.encrypt(plaintext);
      const decrypted = OwlCrypto.decrypt(encrypted as string);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("setEncryptionAlgorithm", () => {
    it("should allow setting a different algorithm", () => {
      // This just sets the algorithm, actual validation would depend on Node.js crypto support
      expect(() => {
        OwlCrypto.setEncryptionAlgorithm("aes-256-gcm");
      }).not.toThrow();
    });
  });
});
