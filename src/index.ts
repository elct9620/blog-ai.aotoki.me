import { fromHono } from "chanfana";
import { Hono } from "hono";
import { getPath } from "hono/utils/url";
import { Suggest } from "./endpoints/suggest";

const BLOG_HOST = "blog.aotoki.me";

const app = new Hono({
  getPath: (req) => {
    const originPath = getPath(req);
    const host = req.headers.get("host");

    if (host === BLOG_HOST) {
      return originPath.replace("/ai", "");
    }

    return originPath;
  },
});

const openapi = fromHono(app, {
  docs_url: "/",
  openapi_url: "/ai/openapi.json",
});
openapi.post("/v1/suggest", Suggest);

export default app;
