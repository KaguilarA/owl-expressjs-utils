# OwlEntity

Creates a reusable entity service around an `OwlModel`-compatible data-access helper.

`OwlEntity` is useful when application services should share consistent population and error logging without exposing Mongoose queries directly to route handlers.

## Import and setup

```ts
import { OwlEntity, OwlModel } from "owl-expressjs-utils";

const UserModel = OwlModel("User", userSchema);
const UserEntity = OwlEntity({
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
});
```

The configuration contains:

| Property | Description |
| --- | --- |
| `entityId` | Name used in contextual error messages. |
| `model` | Model helper implementing the `ModelReturn` contract. |
| `populatedFields` | Optional relationship paths applied to reads and updates. |

## Methods

```ts
const user = await UserEntity.getById(userId);
const users = await UserEntity.getAll();
const activeUsers = await UserEntity.getByCoincidence({ active: true });
const createdUser = await UserEntity.save({ name: "Ada" });
const updatedUser = await UserEntity.update(userId, { active: false });
await UserEntity.deleteById(userId);
```

| Method | Description |
| --- | --- |
| `getAll()` | Retrieves all entities with configured population. |
| `getById(id)` | Retrieves one entity by ID. |
| `getOne(filter)` | Retrieves the first entity matching a filter. |
| `getByCoincidence(filter)` | Retrieves all entities matching a filter. |
| `save(data)` | Creates and persists an entity. |
| `update(id, data)` | Updates an entity and applies configured population. |
| `deleteById(id)` | Deletes an entity by ID. |

Each method logs a contextual error and rethrows the original error. This preserves the failure for centralized application handling while keeping logs useful in multi-entity backends.
