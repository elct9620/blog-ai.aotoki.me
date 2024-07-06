import { fromIttyRouter } from "chanfana";
import { AutoRouter, cors } from "itty-router";
import { Suggest } from "./endpoints/suggest";

const { preflight, corsify } = cors({
  origin: /aotoki.me$/,
});

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

const openapi = fromIttyRouter(router, {
  docs_url: "/",
});
openapi.post("/v1/suggest", Suggest);

export default openapi;
