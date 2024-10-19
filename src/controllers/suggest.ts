import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Question, Answer } from "../types";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { SuggestUsecase } from "../usecase/suggest";
import { Context } from "hono";
import { Config } from "config";

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
    const llm = c.var.resolve(ChatOpenAI);
    const store = c.var.resolve(CloudflareVectorizeStore);

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
