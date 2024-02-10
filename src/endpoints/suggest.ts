import {
  OpenAPIRoute,
  OpenAPIRouteSchema,
} from "@cloudflare/itty-router-openapi";
import { Question, Answer } from "../types";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { SuggestUsecase } from "../usecase/suggest";

const EMBENDDINGS_MODEL = "text-embedding-3-small";

export class Suggest extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["AI"],
    summary: "Chat with the AI",
    requestBody: Question,
    responses: {
      "200": {
        description: "Return the suggest post",
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
    const llm = new ChatOpenAI({
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
