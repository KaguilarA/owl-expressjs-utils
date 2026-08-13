import { Schema, model, Query } from "mongoose";
import bcrypt from "bcryptjs";
import type { QueryOptions } from "../interfaces/queryOptions";
import AmpApiCripto from "./crypto.js";

/**
 * Creates a Mongoose model factory with built-in security for field encryption and hashing,
 * along with standardized query and population methods.
 *
 * @param {string} id - Identifier or name of the Mongoose model.
 * @param {import("mongoose").SchemaDefinition} schemaConfig - Mongoose schema definition.
 * @param {string[]} [encryptedFields=[]] - List of fields that should be automatically encrypted.
 * @param {string[]} [hashedFields=[]] - List of fields that should be protected with a bcrypt hash.
 * @returns {Object} An object containing the Mongoose model and data access methods.
 */
export default (id: string, schemaConfig: any, encryptedFields: string[] = [], hashedFields: string[] = []) => {
  const schema = new Schema(schemaConfig, { timestamps: true });

  /**
   * Processes a document after a query to decrypt its protected fields.
   * @param {import("mongoose").Document} doc Mongoose document retrieved from the database.
   */
  function processDocumentAfterQuery(doc: any): void {
    if (!doc) return;

    encryptedFields.forEach((field: string) => {
      if (doc[field] && AmpApiCripto.isEncrypted(doc[field])) {
        try {
          doc[field] = AmpApiCripto.decrypt(doc[field]);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error decrypting field ${field}:`, errorMessage);
        }
      }
    });
  }

  /**
   * Validates whether a string corresponds to a valid bcrypt-generated hash.
   * @param {any} val Value to evaluate.
   * @returns {boolean} True if it is a valid bcrypt hash, false otherwise.
   */
  function isBcryptHash(val: any): boolean {
    if (typeof val !== "string") return false;
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(val);
  }

  /**
   * Parses dot-notation strings to transform them into nested population objects.
   * @param {string} str Population string (e.g. "field1.subfield1").
   * @returns {string|Object} Nested population object or the original string if it contains no dots.
   */
  function parsePopulateString(str: string): any {
    const parts = str.split(".");
    if (parts.length === 1) return str;

    let nestedObj: any = null;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (i === parts.length - 1) {
        nestedObj = { path: parts[i] };
      } else {
        nestedObj = { path: parts[i], populate: nestedObj };
      }
    }
    return nestedObj || str;
  }

  /**
   * Configures Mongoose hooks for encryption and hashing during save and update operations.
   * @param {import("mongoose").Schema} schema Mongoose schema to configure.
   * @param {string[]} encFields Fields to encrypt.
   * @param {string[]} hashFields Fields to hash.
   */
  function setupSecurityHooks(schema: Schema<any>, encFields: string[], hashFields: string[]): void {
    schema.pre("save", async function (this: any, next: any) {
      encFields.forEach((field: string) => {
        if (
          this.isModified(field) &&
          this[field] &&
          !AmpApiCripto.isEncrypted(this[field])
        ) {
          this[field] = AmpApiCripto.encrypt(this[field]);
        }
      });

      for (const field of hashFields) {
        if (
          this.isModified(field) &&
          this[field] &&
          !isBcryptHash(this[field])
        ) {
          const salt = await bcrypt.genSalt(10);
          this[field] = await bcrypt.hash(this[field], salt);
        }
      }
      next();
    });

    schema.pre(
      ["findOneAndUpdate", "updateOne", "updateMany"],
      async function (this: any, next: any) {
        const update = this.getUpdate();
        if (!update) return next();

        encFields.forEach((field: string) => {
          const val = update[field] || (update.$set && update.$set[field]);
          if (val && typeof val === "string" && !AmpApiCripto.isEncrypted(val)) {
            const encryptedVal = AmpApiCripto.encrypt(val);
            if (update[field]) update[field] = encryptedVal;
            if (update.$set && update.$set[field])
              update.$set[field] = encryptedVal;
          }
        });

        for (const field of hashFields) {
          const val = update[field] || (update.$set && update.$set[field]);
          if (val && typeof val === "string" && !isBcryptHash(val)) {
            const salt = await bcrypt.genSalt(10);
            const hashedVal = await bcrypt.hash(val, salt);
            if (update[field]) update[field] = hashedVal;
            if (update.$set && update.$set[field])
              update.$set[field] = hashedVal;
          }
        }
        next();
      },
    );

    schema.post(["find", "findOne", "findOneAndUpdate"], function (this: any, result: any): void {
      if (!result) return;
      if (Array.isArray(result)) {
        result.forEach(processDocumentAfterQuery);
      } else {
        processDocumentAfterQuery(result);
      }
    });

    schema.set("toJSON", {
      transform: (_doc: any, ret: any) => {
        encFields.forEach((field: string) => delete ret[field]);
        hashFields.forEach((field: string) => delete ret[field]);
        return ret;
      },
    });
  }

  /**
   * Applies population logic to a Mongoose query flexibly (supports strings and arrays).
   * @param {import("mongoose").Query} query Current Mongoose query.
   * @param {string|string[]|Object|Object[]} populateOption Population options.
   * @returns {import("mongoose").Query} Query with population applied.
   */
  function applyPopulate(query: Query<any, any>, populateOption: any): Query<any, any> {
    if (!populateOption) {
      return query;
    }
    if (Array.isArray(populateOption)) {
      populateOption.forEach((item: any) => {
        if (typeof item === "string" && item.includes(".")) {
          query = query.populate(parsePopulateString(item) as any);
        } else {
          query = query.populate(item);
        }
      });
    } else if (
      typeof populateOption === "string" &&
      populateOption.includes(".")
    ) {
      query = query.populate(parsePopulateString(populateOption) as any);
    } else {
      query = query.populate(populateOption);
    }

    return query;
  }

  /**
   * Applies pagination logic to a Mongoose query.
   * @param {import("mongoose").Query} query Current Mongoose query.
   * @param {QueryOptions} options Query options with pagination settings.
   * @returns {import("mongoose").Query} Query with pagination applied.
   */
  function applyPagination(query: Query<any, any>, options: QueryOptions): Query<any, any> {
    if (options.page && options.pageSize) {
      const skip = (options.page - 1) * options.pageSize;
      query = query.skip(skip).limit(options.pageSize);
    } else if (options.skip !== undefined && options.limit) {
      query = query.skip(options.skip).limit(options.limit);
    } else if (options.limit) {
      query = query.limit(options.limit);
    }
    return query;
  }

  if (encryptedFields.length > 0 || hashedFields.length > 0) {
    setupSecurityHooks(schema, encryptedFields, hashedFields);
  }

  const Model = model(id, schema);

  /**
   * Compares a candidate value against a hash-protected field.
   *
   * @param {string} docId - Document ID.
   * @param {string} field - Name of the hashed field.
   * @param {string} candidateValue - Plain text value to verify.
   * @returns {Promise<boolean>} True if the hash matches, false otherwise.
   */
  const compareHash = async (docId: string, field: string, candidateValue: string): Promise<boolean> => {
    if (!hashedFields.includes(field as string)) {
      throw new Error(
        `The field '${field}' is not registered in the hashedFields of this model.`,
      );
    }
    const doc = await Model.findById(docId).select(`+${field}`).lean() as any;
    if (!doc || !doc[field]) return false;
    return await bcrypt.compare(candidateValue, doc[field] as string);
  };

  /**
   * Retrieves all documents from the model.
   *
   * @param {Object} [options={}] - Additional query options.
   * @param {string|string[]|Object} [options.populate] - Fields to populate.
   * @param {number} [options.limit] - Maximum number of documents to return.
   * @param {number} [options.skip] - Number of documents to skip for pagination.
   * @param {number} [options.page] - Page number (1-indexed) for pagination with pageSize.
   * @param {number} [options.pageSize] - Documents per page for pagination with page.
   * @returns {Promise<import("mongoose").Document[]>} List of documents.
   */
  const getAll = async (options: QueryOptions = {}): Promise<any[]> => {
    let query = Model.find();
    if (options.populate) {
      query = applyPopulate(query, options.populate);
    }
    query = applyPagination(query, options);
    return await query;
  };

  /**
   * Finds a document by its unique ID.
   *
   * @param {string} docId - Document ID.
   * @param {Object} [options={}] - Additional query options.
   * @param {string|string[]|Object} [options.populate] - Fields to populate.
   * @returns {Promise<import("mongoose").Document|null>} The found document or null.
   */
  const getById = async (docId: string, options: QueryOptions = {}): Promise<any | null> => {
    let query = Model.findById(docId);
    if (options.populate) {
      query = applyPopulate(query, options.populate);
    }
    return await query;
  };

  /**
   * Finds a single document matching the provided filter.
   *
   * @param {Object} [filter={}] - Mongoose search filter.
   * @param {Object} [options={}] - Additional query options.
   * @param {string|string[]|Object} [options.populate] - Fields to populate.
   * @returns {Promise<import("mongoose").Document|null>} The found document or null.
   */
  const getOne = async (filter: any = {}, options: QueryOptions = {}): Promise<any | null> => {
    let query = Model.findOne(filter);
    if (options.populate) {
      query = applyPopulate(query, options.populate);
    }
    return await query;
  };

  /**
   * Searches for documents that match a coincidence pattern across multiple fields.
   *
   * @param {Object} searchQuery - Search query object with field-value pairs or a $regex operator.
   * @param {Object} [options={}] - Additional query options.
   * @param {string|string[]|Object} [options.populate] - Fields to populate.
   * @param {number} [options.limit] - Maximum number of documents to return.
   * @param {number} [options.skip] - Number of documents to skip for pagination.
   * @param {number} [options.page] - Page number (1-indexed) for pagination with pageSize.
   * @param {number} [options.pageSize] - Documents per page for pagination with page.
   * @returns {Promise<any[]>} Array of matching documents.
   */
  const getByCoincidence = async (searchQuery: any = {}, options: QueryOptions = {}): Promise<any[]> => {
    let query = Model.find(searchQuery);
    if (options.populate) {
      query = applyPopulate(query, options.populate);
    }
    query = applyPagination(query, options);
    return await query;
  };

  /**
   * Deletes a document by its ID.
   *
   * @param {string} docId - ID of the document to delete.
   * @returns {Promise<import("mongoose").Document|null>} The deleted document.
   */
  const remove = async (docId: string): Promise<any | null> => await Model.findByIdAndDelete(docId);

  /**
   * Creates and saves a new document in the database.
   *
   * @param {Object} data - Data of the document to create.
   * @returns {Promise<import("mongoose").Document>} The newly created and saved document.
   */
  const save = async (data: any): Promise<any> => {
    const newData = new Model(data);
    return await newData.save();
  };

  /**
   * Updates an existing document by its ID.
   *
   * @param {string} docId - ID of the document to update.
   * @param {Object} data - Data or update operators.
   * @param {Object} [options={}] - Additional Mongoose options.
   * @param {string|string[]|Object} [options.populate] - Fields to populate.
   * @returns {Promise<import("mongoose").Document|null>} The updated document.
   */
  const update = async (docId: string, data: any, options: QueryOptions = {}): Promise<any | null> => {
    let query = Model.findByIdAndUpdate(docId, data, {
      new: true,
      ...(options as any),
    } as any);
    if (options.populate) {
      query = applyPopulate(query, options.populate);
    }
    return await query;
  };

  return {
    delete: remove,
    compareHash,
    getAll,
    getById,
    getByCoincidence,
    getOne,
    save,
    update,
  };
};
