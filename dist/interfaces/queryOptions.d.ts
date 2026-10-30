import { QueryOptions as MongooseQueryOptions } from 'mongoose';
/**
 * Optional query controls shared by model and entity helpers.
 *
 * Pagination can use either `page` with `pageSize`, or `skip` with `limit`.
 * Population accepts paths such as `"profile"` and nested paths such as
 * `"roles.permissions"`.
 */
export interface QueryOptions extends Omit<MongooseQueryOptions, "populate" | "lean"> {
    select?: string | Record<string, number>;
    lean?: boolean;
    /** Mongoose population path(s) to resolve before returning documents. */
    populate?: string | string[] | Record<string, any> | Record<string, any>[];
    /** Maximum number of documents to return. */
    limit?: number;
    /** Number of documents to skip before collecting results. */
    skip?: number;
    /** One-based page number used together with `pageSize`. */
    page?: number;
    /** Number of documents per page used together with `page`. */
    pageSize?: number;
}
