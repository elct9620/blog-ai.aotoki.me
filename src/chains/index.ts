import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { StuffQAChainParams } from "langchain/chains";
import { LLMChain } from "langchain/chains";
import { StuffPostsChain } from "./StuffPostsChain";

export const loadPostSuggestChain = (
  llm: BaseLanguageModelInterface,
  params: StuffQAChainParams,
) => {
  const { prompt, verbose } = params;
  const llmChain = new LLMChain({ prompt, llm, verbose });
  const chain = new StuffPostsChain({ llmChain, verbose });
  return chain;
};
