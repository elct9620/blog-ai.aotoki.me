import { fromHono } from "chanfana";
import { Hono } from "hono";
import { getPath } from "hono/utils/url";

import { Bindings } from "./bindings";
import { Suggest } from "./endpoints/suggest";

const BLOG_HOST = "blog.aotoki.me";

const app = new Hono<{ Bindings: Bindings }>().basePath("/ai");

const openapi = fromHono(app, {
  base: "/ai",
});

openapi.post("/v1/suggest", Suggest);

export default app;
