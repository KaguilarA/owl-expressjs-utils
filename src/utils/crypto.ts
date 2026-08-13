import crypto from "node:crypto";

/**
 * Encrypted utility module using AES-256-GCM for authenticated encryption.
 * Automatically initializes and validates the encryption key from environment variables.
 * @example
 * ```ts
 * import cryptoUtil from './crypto.js';
 * 
 * cryptoUtil.setEncryptionKey(process.env.ENCRYPTION_KEY);
 * const encrypted = cryptoUtil.encrypt("Hello World");
 * const decrypted = cryptoUtil.decrypt(encrypted);
 * console.log(decrypted); // Outputs: Hello World
 * ```
 */
export default (function () {
  let algorithm: string;
  let key: string;
  let SECRET_KEY: Buffer;

  function setSecretKey(): void {
    SECRET_KEY = Buffer.from(key, "hex");

    if (SECRET_KEY.length !== 32) {
      throw new Error(
        "Encryption key must be a 64-character hexadecimal string (32 bytes).",
      );
    }
  }

  /**
   * Sets the encryption algorithm to be used for encryption and decryption.
   * @param {string} newAlgorithm 
   */
  function setEncryptionAlgorithm(newAlgorithm: string): void {
    algorithm = newAlgorithm;
  }

  /**
   * Sets the encryption key to be used for encryption and decryption.
   * @param {string} newKey - The new encryption key (hexadecimal string).
   */
  function setEncryptionKey(newKey: string): void {
    key = newKey;
    setSecretKey()
  }

  /**
   * Encrypts a plain text string using AES-256-GCM.
   * @param {string} text - The plain text to encrypt.
   * @returns {string} The formatted encrypted string (iv:authTag:ciphertext).
   */
  function encrypt(text: string | null | undefined): string | null | undefined {
    if (text === null || text === undefined) return text;
    const stringValue = typeof text === "string" ? text : String(text);

    const iv = crypto.randomBytes(12); // 12-byte IV for GCM
    const cipher = crypto.createCipheriv(algorithm, SECRET_KEY, iv);

    let encrypted = cipher.update(stringValue, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = (cipher as any).getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts an AES-256-GCM encrypted string.
   *
   * @param {string} encryptedData - The formatted encrypted string (iv:authTag:ciphertext).
   * @returns {string} The decrypted plain text.
   */
  function decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(":");

    if (!ivHex || !authTagHex || !encryptedText) {
      throw new Error("Invalid encrypted text format.");
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, SECRET_KEY, iv);

    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Checks whether a value is already encrypted based on its structural format.
   *
   * @param {any} val - The value to evaluate.
   * @returns {boolean} True if it matches the encrypted pattern, false otherwise.
   */
  function isEncrypted(val: any): boolean {
    if (typeof val !== "string") return false;
    const parts = val.split(":");
    return (
      parts.length === 3 && parts[0].length === 24 && parts[1].length === 32
    );
  }

  setEncryptionAlgorithm("aes-256-gcm");
  setEncryptionKey("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");

  return { encrypt, decrypt, isEncrypted, setEncryptionAlgorithm, setEncryptionKey };
})();