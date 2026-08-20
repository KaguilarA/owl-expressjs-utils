# OwlModel

Creates a Mongoose model with timestamps, optional field security, CRUD methods, filtering, population, and pagination.

## Import

```ts
import { OwlModel } from "owl-expressjs-utils";
```

## Create a model

```ts
const UserModel = OwlModel(
	"User",
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phoneNumber: String,
	},
	["phoneNumber"],
	["password"],
	{ bcryptSaltRounds: 12 },
);
```

The arguments are:

| Argument | Description |
| --- | --- |
| `id` | Mongoose model name. |
| `schemaConfig` | Mongoose schema definition. The generated schema enables timestamps. |
| `encryptedFields` | Optional field names encrypted with `OwlCrypto` before save and decrypted after supported queries. |
| `hashedFields` | Optional field names hashed with bcrypt before save or update. |
| `options` | Optional `ModelOptions` settings for timestamps and bcrypt cost. |

Configure `OwlCrypto` with a production key before saving encrypted fields. Hashed and encrypted fields are removed from JSON serialization, and `compareHash` can verify a hashed value without exposing it.

Creating a model with `encryptedFields` before calling `OwlCrypto.setEncryptionKey(...)` throws immediately. Models without encrypted fields can be created without crypto configuration.

## Data-access methods

```ts
const user = await UserModel.save({
	name: "Ada Lovelace",
	email: "ada@example.com",
	password: "plain-text-password",
});

const users = await UserModel.getAll({ page: 1, pageSize: 20 });
const oneUser = await UserModel.getById(user._id.toString());
const matchingUsers = await UserModel.getByCoincidence({ name: /Ada/i });
const deletedUser = await UserModel.delete(user._id.toString());
```

| Method | Description |
| --- | --- |
| `save(data)` | Creates and saves a document. |
| `getAll(options?)` | Retrieves all documents. |
| `getById(id, options?)` | Retrieves one document by ID, or `null`. |
| `getOne(filter, options?)` | Retrieves the first matching document, or `null`. |
| `getByCoincidence(filter, options?)` | Retrieves all matching documents. |
| `update(id, data, options?)` | Updates and returns a document, or `null`. |
| `delete(id)` | Deletes and returns a document, or `null`. |
| `compareHash(id, field, candidateValue)` | Verifies a field configured in `hashedFields`. |

## Population and pagination

All query methods that accept options support population. Nested paths use dot notation:

```ts
const users = await UserModel.getAll({
	populate: ["profile", "roles.permissions"],
	skip: 20,
	limit: 20,
});
```

Pagination supports `page` with `pageSize`, `skip` with `limit`, or `limit` alone. Page-based pagination takes precedence when both styles are supplied.

## Security behavior

Encryption and hashing are applied by Mongoose save and update hooks. Values that already have the expected encrypted or bcrypt format are not processed again. `compareHash` throws when the requested field was not declared in `hashedFields` and returns `false` when the document or stored value is missing.
