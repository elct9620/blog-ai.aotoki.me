import "reflect-metadata";
import { container } from "tsyringe";
import { fromHono } from "chanfana";
import { Hono } from "hono";

import { Bindings } from "./bindings";
import { injectionMiddleware } from "./container";
import { Suggest } from "./endpoints/suggest";

const app = new Hono<{ Bindings: Bindings }>().basePath("/ai");
app.use(injectionMiddleware);

const openapi = fromHono(app, {
  base: "/ai",
});

openapi.post("/v1/suggest", Suggest);

export default app;
