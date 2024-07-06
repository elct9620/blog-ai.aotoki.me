import { fromIttyRouter } from "chanfana";
import { Router } from "itty-router";
import { Suggest } from "./endpoints/suggest";

const router = Router();
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
