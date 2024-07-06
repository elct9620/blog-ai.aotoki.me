import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Question, Answer } from "../types";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { SuggestUsecase } from "../usecase/suggest";

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

  async handle(request: Request, env: any, context: any) {
    const data = await this.getValidatedData<typeof this.schema>();

    const llm = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: env.LLM_MODEL,
      temperature: 0,
      configuration: {
        baseURL: env.OPENAI_GATEWAY,
      },
    });
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: env.TEXT_EMBEDDING_MODEL,
      configuration: {
        baseURL: env.OPENAI_GATEWAY,
      },
    });
    const store = new CloudflareVectorizeStore(embeddings, {
      index: env.VECTORIZE_INDEX,
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
