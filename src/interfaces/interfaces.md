# Public Interfaces

The `src/interfaces` module contains the TypeScript contracts used by the reusable controller, entity, and model helpers in `owl-expressjs-utils`.

All interfaces are exported as type-only exports. JavaScript consumers do not need to import them at runtime, while TypeScript consumers can import them from the package root:

```ts
import type {
	ControllerConfig,
	EntityConfig,
	ModelReturn,
	QueryOptions,
} from "owl-expressjs-utils";
```

## `QueryOptions`

`QueryOptions` provides the optional query controls shared by model-based utilities:

```ts
const users = await UserModel.getAll({
	populate: ["profile", "roles.permissions"],
	page: 1,
	pageSize: 20,
});
```

| Property | Type | Purpose |
| --- | --- | --- |
| `populate` | `string \| string[] \| Record<string, any> \| Record<string, any>[]` | Mongoose population paths or population options. Dot notation supports nested population. |
| `limit` | `number` | Maximum number of documents to return. |
| `skip` | `number` | Number of documents to skip. |
| `page` | `number` | One-based page number used with `pageSize`. |
| `pageSize` | `number` | Number of documents returned per page. |

Use either `page` plus `pageSize` or `skip` plus `limit`. When both styles are provided, page-based pagination takes precedence in the model helper.

## `ModelReturn<T>`

`ModelReturn<T>` describes the object returned by `OwlModel`. `T` is the document type returned by CRUD and query methods; it defaults to `any` for JavaScript-oriented usage.

```ts
interface User {
	name: string;
	email: string;
}

const UserModel: ModelReturn<User> = OwlModel("User", {
	name: { type: String, required: true },
	email: { type: String, required: true },
});

const user = await UserModel.getById(userId);
const matches = await UserModel.getOne({ email: "ada@example.com" });
```

The contract includes:

| Method | Return value | Purpose |
| --- | --- | --- |
| `save(data)` | `Promise<T>` | Creates and persists a document. |
| `getAll(options?)` | `Promise<T[]>` | Retrieves all documents with optional population and pagination. |
| `getById(id, options?)` | `Promise<T \| null>` | Retrieves a document by ID. |
| `getOne(filter, options?)` | `Promise<T \| null>` | Retrieves the first document matching a filter. |
| `getByCoincidence(filter, options?)` | `Promise<T[]>` | Retrieves all documents matching a filter with optional pagination. |
| `update(id, data, options?)` | `Promise<T \| null>` | Updates a document and returns the updated value. |
| `delete(id)` | `Promise<T \| null>` | Deletes a document and returns the deleted value. |
| `compareHash(id, field, candidateValue)` | `Promise<boolean>` | Compares a candidate value with a configured bcrypt field. |

## `ControllerConfig`

`ControllerConfig` configures `OwlController`:

```ts
const userController = OwlController({
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
});
```

| Property | Type | Purpose |
| --- | --- | --- |
| `entityId` | `string` | Entity name used in controller responses and errors. |
| `model` | `any` | Model helper implementing the CRUD operations consumed by the controller. |
| `populatedFields` | `string \| string[] \| Record<string, any> \| Record<string, any>[]` | Optional relationships to populate in controller queries. |

## `EntityConfig`

`EntityConfig` is the narrower configuration contract used by entity helpers. It expects a `ModelReturn` implementation and accepts simple population paths:

```ts
const userEntity: EntityConfig = {
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
};
```

| Property | Type | Purpose |
| --- | --- | --- |
| `entityId` | `string` | Entity name used to identify the resource. |
| `model` | `ModelReturn` | Reusable model contract used for data access. |
| `populatedFields` | `string[]` | Optional relationship paths populated by the entity helper. |

These interfaces describe compile-time contracts only. They do not create runtime validation and are removed from compiled JavaScript output.
