import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { Suggest } from "./endpoints/suggest";

export const router = OpenAPIRouter({
  docs_url: "/",
});

router.post("/v1/suggest", Suggest);

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

export default {
  fetch: router.handle,
};
