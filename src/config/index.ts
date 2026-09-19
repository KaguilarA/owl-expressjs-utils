
/** Configuration helpers for MongoDB connections and application security. */

/** Provides AES-256-GCM encryption and decryption helpers. */
export { default as OwlCrypto } from "./crypto/crypto";

/** Closes the active Mongoose connection without exiting the process. */
export { default as OwlMongoClose } from "./closeConnection/closeConnection";

/** Opens the default Mongoose connection to MongoDB. */
export { default as OwlMongoConnect } from "./connect/connect";

/** Determines the number of worker processes to use based on clustering and CPU availability. */
export { default as OwlClusterWorkerCount } from "./workerCount/workerCount";