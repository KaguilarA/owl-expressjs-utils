/** Optional behavior settings for the Mongoose model factory. */
export interface ModelOptions {
  /** Whether Mongoose should add and maintain `createdAt` and `updatedAt`. */
  timestamps?: boolean;

  /** Bcrypt cost factor used when hashing configured fields. */
  bcryptSaltRounds?: number;
}
