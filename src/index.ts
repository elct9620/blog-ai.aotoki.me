import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { ChatAI } from "./endpoints/chatAI";

export const router = OpenAPIRouter({
  docs_url: "/",
});

router.post("/v1/chat/", ChatAI);

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
