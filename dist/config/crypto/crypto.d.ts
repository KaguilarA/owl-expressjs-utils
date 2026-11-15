/**
 * Encrypted utility module using AES-256-GCM for authenticated encryption.
 * Applications must configure a unique 64-character hexadecimal key before
 * encrypting or decrypting data.
 * @example
 * ```ts
 * import cryptoUtil from './crypto.js';
 *
 * cryptoUtil.setEncryptionKey(process.env.ENCRYPTION_KEY as string);
 * const encrypted = cryptoUtil.encrypt("Hello World");
 * const decrypted = cryptoUtil.decrypt(encrypted);
 * console.log(decrypted); // Outputs: Hello World
 * ```
 */
declare const _default: {
    encrypt: (text: string | null | undefined) => string | null | undefined;
    decrypt: (encryptedData: string) => string;
    isConfigured: () => boolean;
    isEncrypted: (val: unknown) => boolean;
    setEncryptionAlgorithm: (newAlgorithm: string) => void;
    setEncryptionKey: (newKey: string) => void;
};
export default _default;
