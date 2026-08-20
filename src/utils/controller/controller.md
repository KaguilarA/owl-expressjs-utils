# OwlController

Creates Express handlers for common CRUD and search operations over an `OwlModel`-compatible model helper.

## Import and setup

```ts
import { OwlController } from "owl-expressjs-utils";
import { Router } from "express";

const userController = OwlController({
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
});

const router = Router();
router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.post("/users/search", userController.getByCoincidence);
router.post("/users", userController.register);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);
```

The configuration contains:

| Property | Description |
| --- | --- |
| `entityId` | Entity name used in response messages. |
| `model` | Data-access helper with the model operations used by the handlers. |
| `populatedFields` | Optional population paths applied to read and update operations. |

## Returned handlers

| Handler | Request input | Success behavior |
| --- | --- | --- |
| `getAll` | Query: `page`, `pageSize`, `limit`, `skip` | Returns the matching array as JSON. |
| `getById` | Route parameter: `id` | Returns the document or `404` when missing. |
| `getOne` | Query `filter` as JSON or request body | Returns the first matching document or `404`. |
| `getByCoincidence` | Body: `{ query, page?, pageSize?, limit?, skip? }` | Returns matching documents or `400` when `query` is absent. |
| `register` | Request body | Creates a document and returns `201`. |
| `update` | Route parameter `id` and request body | Returns the updated document or `404`. |
| `delete` | Route parameter `id` | Returns a confirmation message or `404`. |

Unexpected errors are converted to HTTP `500` responses for reads, updates, and deletion. Registration errors return `400`. The handlers serialize the original error message, so avoid passing untrusted internal details directly to clients in production without an application-level error policy.

The controller does not perform authentication, authorization, request validation, or body parsing. Register those concerns separately in the Express middleware chain.
