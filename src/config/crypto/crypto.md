# OwlCrypto

Provides authenticated encryption and decryption helpers based on Node.js `crypto` and AES-256-GCM.

## Import

```ts
import { OwlCrypto } from "owl-expressjs-utils";
```

## Encryption key

The module does not configure a key automatically. Set one before encrypting or decrypting application data:

```ts
const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
	throw new Error("ENCRYPTION_KEY is required");
}

OwlCrypto.setEncryptionKey(encryptionKey);
```

The key must be a 64-character hexadecimal string representing 32 bytes. Use a unique secret in production and keep it outside source control. Changing the key makes values encrypted with the previous key impossible to decrypt unless the old key is retained for a migration. `OwlCrypto.isConfigured()` reports whether a valid key is active.

## Methods

### `setEncryptionKey(key)`

Sets the 32-byte encryption key. It throws when the supplied value does not decode to exactly 32 bytes.

### `setEncryptionAlgorithm(algorithm)`

Sets the Node.js cipher algorithm used by both encryption and decryption. The default is `aes-256-gcm`. Change this only when all encrypted values and deployments use a compatible algorithm.

### `encrypt(value)`

Encrypts a string and returns a value in this format:

```text
iv:authTag:ciphertext
```

The initialization vector, authentication tag, and ciphertext are encoded as hexadecimal strings. `null` and `undefined` are returned unchanged.

```ts
const encrypted = OwlCrypto.encrypt("private value");
const plainText = OwlCrypto.decrypt(encrypted as string);
```

### `decrypt(value)`

Decrypts a value produced by `encrypt`. It throws when the value has an invalid structure or fails authentication with the configured key.

### `isEncrypted(value)`

Performs a structural check for the expected three-part encrypted format. It returns `false` for non-string values and does not prove that a value can be decrypted successfully.

## Security considerations

- Always configure a unique key before handling sensitive production data.
- Do not log plaintext values, encryption keys, authentication tags, or ciphertexts.
- Store the key in a secret manager or protected environment variable.
- Preserve the same key and algorithm across application instances that share encrypted data.
