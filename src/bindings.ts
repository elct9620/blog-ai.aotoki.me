import { Vectorize } from "@cloudflare/workers-types";

export type Bindings = {
  OPENAI_GATEWAY: string;
  OPENAI_KEY: string;
  LLM_MODEL: string;
  TEXT_EMBEDDING_MODEL: string;
  VECTORIZE_INDEX: Vectorize;
};
