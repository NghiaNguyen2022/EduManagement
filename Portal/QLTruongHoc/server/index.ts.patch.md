# Patch `server/index.ts`

Thêm import:

```ts
import { userRouter } from "./routers/user.router.js";
```

Thêm route sau organization router:

```ts
app.use("/api/users", userRouter);
```
