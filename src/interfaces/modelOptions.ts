import type {IndexDefinition,IndexOptions} from "mongoose";
/** Optional behavior settings for the Mongoose model factory. */
export interface ModelOptions {
  indexes?: {fields:IndexDefinition; options?:IndexOptions}[];
  /** Whether Mongoose should add and maintain `createdAt` and `updatedAt`. */
  timestamps?: boolean;

  /** Bcrypt cost factor used when hashing configured fields. */
  bcryptSaltRounds?: number;
}
