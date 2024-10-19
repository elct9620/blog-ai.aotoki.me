import "reflect-metadata";
import { container } from "tsyringe";
import { fromHono } from "chanfana";
import { Hono } from "hono";

import { Bindings } from "./bindings";
import { Config } from "./config";
import { injectionMiddleware } from "./container";
import { Suggest } from "./controllers/suggest";

const app = new Hono<{ Bindings: Bindings }>().basePath("/ai");
app.use(
  injectionMiddleware(async (c, container) => {
    container.register(Config, {
      useValue: new Config(
        c.env.OPENAI_GATEWAY,
        c.env.OPENAI_API_KEY,
        c.env.LLM_MODEL,
        c.env.TEXT_EMBEDDING_MODEL,
      ),
    });
  }),
);

const openapi = fromHono(app, {
  base: "/ai",
});

openapi.post("/v1/suggest", Suggest);

export default app;
