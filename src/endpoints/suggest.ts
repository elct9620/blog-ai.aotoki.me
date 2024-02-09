import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { Question, Answer } from "../types";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { ChainValues } from "@langchain/core/utils/types";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createRetrieverTool } from "langchain/tools/retriever";
import {
  LLMChain,
  RetrievalQAChain,
  StuffDocumentsChain,
} from "langchain/chains";

const EMBENDDINGS_MODEL = "text-embedding-3-small";

class CustomStuffDocumentsChain extends StuffDocumentsChain {
  /** @ignore */
  _prepInputs(values: ChainValues): ChainValues {
    if (!(this.inputKey in values)) {
      throw new Error(`Document key ${this.inputKey} not found.`);
    }
    const { [this.inputKey]: docs, ...rest } = values;
    return {
      ...rest,
      [this.documentVariableName]: formatContentAsString(docs as Document[]),
    };
  }
}

export const formatContentAsString = (documents: Document[]): string =>
  documents
    .map((doc) =>
      [
        `---`,
        `title: ${doc.metadata.title}`,
        `published_at: ${doc.metadata.published_at}`,
        `permalink: ${doc.metadata.permalink}`,
        `---`,
        `${doc.pageContent}`,
      ].join("\n"),
    )
    .join("\n\n");

const prompt = PromptTemplate.fromTemplate(`#language:zh-TW
      Use the following pieces of context to suggest article with permalink at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

      {context}


      Constraints:
      * The suggest should be in your own words.
      * The suggest should be accurate and should not include any false information.
      * When mixing Chinese and English, add a whitespace between Chinese and English characters


      Example of Answer:
      撰寫 RSpec 可以透過 One-linear 來撰寫測試，這樣可以讓測試更簡潔，並且更容易閱讀。
      參考文章：
      * [優雅的 RSpec 測試 - 測試案例](https://blog.aotoki.me/posts/2023/01/27/elegant-rspec-example/)


      Question: {question}
      Answer in Mandarin Chinese:`);

export class Suggest extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["AI"],
    summary: "Chat with the AI",
    requestBody: Question,
    responses: {
      "200": {
        description: "Returns the created task",
        schema: {
          success: Boolean,
          data: Answer,
        },
      },
    },
  };

  async handle(
    request: Request,
    env: any,
    context: any,
    data: Record<string, any>,
  ) {
    const model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      configuration: {
        baseURL: env.OPENAI_GATEWAY,
      },
    });
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: EMBENDDINGS_MODEL,
      configuration: {
        baseURL: env.OPENAI_GATEWAY,
      },
    });
    const store = new CloudflareVectorizeStore(embeddings, {
      index: env.VECTORIZE_INDEX,
    });

    const retriever = store.asRetriever({
      metadata: {
        title: true,
        permalink: true,
        published_at: true,
      },
    });

    const llmChain = new LLMChain({
      llm: model,
      prompt: prompt,
      verbose: true,
    });

    const documentsChain = new CustomStuffDocumentsChain({
      llmChain,
      verbose: true,
    });

    const chain = new RetrievalQAChain({
      combineDocumentsChain: documentsChain,
      retriever,
    });

    const question = data.body;
    const result = await chain.invoke({ query: question.message });

    return {
      success: true,
      data: {
        message: result.text,
      },
    };
  }
}
