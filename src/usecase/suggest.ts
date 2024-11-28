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
        我是作者（蒼時弦也），以下是根據我所撰寫的文章為您推薦的相關文章，文章後方附有永久連結。
        {context}
        注意事項：
        * 如果無法找到永久連結，請明確告知使用者，不要試圖編造答案或連結。
        * 只有在找到相關文章時才能回答問題。
        * 建議以自己的話語重新表述。
        * 中英文混合時，請在中文與英文字符之間加上空白。
        * 優先推薦較新的文章。
        * 如果可能，請提供多於三篇的建議文章。

        範例回答：
        撰寫 RSpec 測試時，可以考慮使用 One-liner 方式，這樣可以讓測試程式碼更加簡潔，易於閱讀。
        參考文章：
        * [優雅的 RSpec 測試 - 測試案例](https://blog.aotoki.me/posts/2023/01/27/elegant-rspec-example/)

        問題：{question}
        請用正體中文（台灣）回答：`);

  constructor(
    @inject(IBaseLanguageModel)
    private readonly LLM: BaseLanguageModelInterface,
    @inject(IVectorStore) private readonly vectorStore: VectorStoreInterface,
  ) {}

  async Execute(input: SuggestInput): Promise<SuggestOutput> {
    const retriever = this.vectorStore.asRetriever({
      k: 10,
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
