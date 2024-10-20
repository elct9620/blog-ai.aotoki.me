import { injectable, inject } from "tsyringe";
import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { VectorStoreInterface } from "@langchain/core/vectorstores";
import { PromptTemplate } from "@langchain/core/prompts";
import { RetrievalQAChain } from "langchain/chains";
import { loadPostSuggestChain } from "../chains";

import { IBaseLanguageModel, IVectorStore } from "./langchain";

export type SuggestInput = {
  question: string;
};

export type SuggestOutput = {
  answer: string;
};

@injectable()
export class SuggestUsecase {
  public verbose: boolean = true;
  public prompt: PromptTemplate = PromptTemplate.fromTemplate(`#language:zh-TW
      As the article author (蒼時弦也) only uses the following articles to suggest articles with permalinks at the end.

      {context}


      Constraints:
      * If you don't find the permalink, say that you don't know, don't try to make up an answer and permalink.
      * Only answer the question if you can find a relevant article.
      * The suggestion should be in your own words.
      * When mixing Chinese and English, add a whitespace between Chinese and English characters
      * Use newer article
      * Try to give more than one suggestion if possible


      Example of Answer:
      撰寫 RSpec 可以透過 One-linear 來撰寫測試，這樣可以讓測試更簡潔，並且更容易閱讀。
      參考文章：
      * [優雅的 RSpec 測試 - 測試案例](https://blog.aotoki.me/posts/2023/01/27/elegant-rspec-example/)


      Question: {question}
      Answer in Mandarin Chinese:`);

  constructor(
    @inject(IBaseLanguageModel)
    private readonly LLM: BaseLanguageModelInterface,
    @inject(IVectorStore) private readonly vectorStore: VectorStoreInterface,
  ) {}

  async Execute(input: SuggestInput): Promise<SuggestOutput> {
    const retriever = this.vectorStore.asRetriever({
      metadata: { title: true, permalink: true, published_at: true },
    });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: loadPostSuggestChain(this.LLM, {
        prompt: this.prompt,
        verbose: this.verbose,
      }),
      retriever,
    });

    const res = await chain.invoke({ query: input.question });

    return {
      answer: res.text,
    };
  }
}
