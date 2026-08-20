# Utility Factories

The `src/utils` module provides reusable data-access and HTTP-layer factories for Express.js backends:

- `OwlModel` creates a Mongoose model helper with security, CRUD, search, population, and pagination support.
- `OwlEntity` creates an application service that delegates data access to a model helper.
- `OwlController` creates Express handlers for common CRUD and search routes.

Import the factories from the package root:

```ts
import { OwlController, OwlEntity, OwlModel } from "owl-expressjs-utils";
```

## Recommended composition

Keep database access in `OwlModel`, application-level delegation in `OwlEntity`, and HTTP concerns in `OwlController`:

```ts
const UserModel = OwlModel("User", userSchema, ["phoneNumber"], ["password"]);
const UserEntity = OwlEntity({
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
});
const UserController = OwlController({
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
});
```

Use `OwlEntity` for services that need a stable application-facing data-access API. Use `OwlController` when the returned handlers are registered directly on an Express router.

See the dedicated references for each factory:

- [OwlModel](model/model.md)
- [OwlEntity](entity/entity.md)
- [OwlController](controller/controller.md)

All factories are TypeScript-friendly and expose type declarations in the published package. JavaScript consumers can use the same runtime API without importing the interfaces.
