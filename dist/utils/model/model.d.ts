import { SchemaDefinition } from 'mongoose';
import { ModelOptions, ModelReturn } from './../../interfaces';
/**
 * Creates a Mongoose model factory with built-in security for field encryption and hashing,
 * along with standardized query and population methods.
 *
 * @template T The document shape returned by the helper methods.
 *
 * @param {string} id - Identifier or name of the Mongoose model.
 * @param {import("mongoose").SchemaDefinition} schemaConfig - Mongoose schema definition.
 * @param {string[]} [encryptedFields=[]] - List of fields that should be automatically encrypted.
 * @param {string[]} [hashedFields=[]] - List of fields that should be protected with a bcrypt hash.
 * @param {ModelOptions} [options={}] - Optional timestamp and bcrypt settings.
 * @returns {ModelReturn<T>} Data-access methods for the created Mongoose model.
 * @example
 * ```ts
 * import createSecureModel from './model.js';
 *
 * const UserModel = createSecureModel(
 *   'User',
 *   {
 *     name: { type: String, required: true },
 *     username: { type: String, required: true },
 *     password: { type: String, required: true },
 *   },
 *   ['username'],
 *   ['password']
 * );
 * ```
 */
declare const _default: <T = any>(id: string, schemaConfig: SchemaDefinition<any>, encryptedFields?: string[], hashedFields?: string[], options?: ModelOptions) => ModelReturn<T>;
export default _default;
