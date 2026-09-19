# Utility Factories

The `src/utils` module provides reusable data-access and HTTP-layer factories for Express.js backends:

- `OwlModel` creates a Mongoose model helper with security, CRUD, search, population, and pagination support.
- `OwlController` creates Express handlers for common CRUD and search routes.

Import the factories from the package root:

```ts
import { OwlController, OwlModel } from "owl-expressjs-utils";
```

## Recommended composition

Keep database access in `OwlModel`, and HTTP concerns in `OwlController`:

```ts
const UserModel = OwlModel("User", userSchema, ["phoneNumber"], ["password"]);
const UserController = OwlController({
	entityId: "User",
	model: UserModel,
	populatedFields: ["profile", "roles"],
});
```

Use `OwlController` when the returned handlers are registered directly on an Express router.

See the dedicated references for each factory:

- [OwlModel](model/model.md)
- [OwlController](controller/controller.md)

All factories are TypeScript-friendly and expose type declarations in the published package. JavaScript consumers can use the same runtime API without importing the interfaces.
