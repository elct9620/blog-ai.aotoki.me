import { fromIttyRouter } from "chanfana";
import { Router, cors } from "itty-router";
import { Suggest } from "./endpoints/suggest";

const { preflight, corsify } = cors({
  origin: /aotoki.me$/,
});

const router = Router({
  before: [preflight],
  finally: [corsify],
});

const openapi = fromIttyRouter(router, {
  docs_url: "/",
});
openapi.post("/v1/suggest", Suggest);

// 404 for everything else
router.all("*", () =>
  Response.json(
    {
      success: false,
      error: "Route not found",
    },
    { status: 404 },
  ),
);

export default openapi;
