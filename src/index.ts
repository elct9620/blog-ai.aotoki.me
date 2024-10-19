import "reflect-metadata";
import { container } from "tsyringe";
import { fromHono } from "chanfana";
import { Hono } from "hono";

import { Bindings } from "./bindings";
import { Config } from "./config";
import { injectionMiddleware } from "./container";
import { Suggest } from "./controllers/suggest";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { OpenAIEmbeddings } from "@langchain/openai";

const app = new Hono<{ Bindings: Bindings }>().basePath("/ai");
app.use(
  injectionMiddleware(async (ctx, container) => {
    container.register(Config, {
      useValue: new Config(
        ctx.env.OPENAI_GATEWAY,
        ctx.env.OPENAI_API_KEY,
        ctx.env.LLM_MODEL,
        ctx.env.TEXT_EMBEDDING_MODEL,
      ),
    });

    container.register(CloudflareVectorizeStore, {
      useFactory: (c) => {
        const embeddings = c.resolve(OpenAIEmbeddings);
        return new CloudflareVectorizeStore(embeddings, {
          index: ctx.env.VECTORIZE_INDEX,
        });
      },
    });
  }),
);

const openapi = fromHono(app, {
  base: "/ai",
});

openapi.post("/v1/suggest", Suggest);

export default app;
