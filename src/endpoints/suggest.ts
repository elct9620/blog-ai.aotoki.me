import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Question, Answer } from "../types";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { SuggestUsecase } from "../usecase/suggest";
import { Context } from "hono";

export class Suggest extends OpenAPIRoute {
  schema = {
    tags: ["AI"],
    summary: "Chat with the AI",
    request: {
      body: {
        content: {
          "application/json": {
            schema: Question,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Return the suggest post",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              data: Answer,
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const data = await this.getValidatedData<typeof this.schema>();

    const llm = new ChatOpenAI({
      openAIApiKey: c.env.OPENAI_API_KEY,
      modelName: c.env.LLM_MODEL,
      temperature: 0,
      configuration: {
        baseURL: c.env.OPENAI_GATEWAY,
      },
    });
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: c.env.OPENAI_API_KEY,
      modelName: c.env.TEXT_EMBEDDING_MODEL,
      configuration: {
        baseURL: c.env.OPENAI_GATEWAY,
      },
    });
    const store = new CloudflareVectorizeStore(embeddings, {
      index: c.env.VECTORIZE_INDEX,
    });

    const usecase = new SuggestUsecase(llm, store);
    const result = await usecase.Execute({
      question: data.body.message,
    });

    return {
      success: true,
      data: {
        message: result.answer,
      },
    };
  }
}
