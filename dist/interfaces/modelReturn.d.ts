import { QueryOptions } from './queryOptions';
/**
 * CRUD and query contract returned by the model factory.
 *
 * @template T The document shape returned by model operations. It defaults to
 * `any` for JavaScript consumers and can be specialized in TypeScript.
 *
 * @example
 * ```ts
 * interface User {
 *   name: string;
 *   email: string;
 * }
 *
 * const UserModel: ModelReturn<User> = OwlModel("User", userSchema);
 * const users = await UserModel.getAll({ page: 1, pageSize: 20 });
 * ```
 */
export interface ModelReturn<T = any> {
    /** Deletes a document by its identifier and returns the deleted document. */
    delete(docId: string): Promise<T | null>;
    /** Compares a plain-text candidate with a registered bcrypt field. */
    compareHash(docId: string, field: string, candidateValue: string): Promise<boolean>;
    /** Retrieves all documents, optionally populated or paginated. */
    getAll(options?: QueryOptions): Promise<T[]>;
    /** Retrieves one document by its identifier. */
    getById(docId: string, options?: QueryOptions): Promise<T | null>;
    /** Retrieves all documents matching the supplied Mongoose filter. */
    getByCoincidence(searchQuery?: any, options?: QueryOptions): Promise<T[]>;
    /** Retrieves the first document matching the supplied Mongoose filter. */
    getOne(filter?: any, options?: QueryOptions): Promise<T | null>;
    /** Creates and persists a document from the supplied data. */
    save(data: any, options?: QueryOptions): Promise<T>;
    saveMany(data: any[], options?: QueryOptions): Promise<T[]>;
    updateWhere(filter: any, data: any, options?: QueryOptions): Promise<T | null>;
    updateMany(filter: any, data: any, options?: QueryOptions): Promise<{
        matchedCount: number;
        modifiedCount: number;
    }>;
    deleteMany(filter: any, options?: QueryOptions): Promise<{
        deletedCount: number;
    }>;
    countDocuments(filter?: any, options?: QueryOptions): Promise<number>;
    exists(filter: any, options?: QueryOptions): Promise<boolean>;
    aggregate(pipeline: import('mongoose').PipelineStage[], options?: QueryOptions): Promise<any[]>;
    watch(pipeline?: Record<string, unknown>[], options?: Record<string, unknown>): ReturnType<import('mongoose').Model<T>["watch"]>;
    initialize(): Promise<void>;
    readonly modelName: string;
    readonly fieldNames: readonly string[];
    /** Updates a document by its identifier and returns the updated document. */
    update(docId: string, data: any, options?: QueryOptions): Promise<T | null>;
}
