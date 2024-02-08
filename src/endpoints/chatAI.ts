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
import { StringOutputParser } from "@langchain/core/output_parsers";

const EMBENDDINGS_MODEL = "text-embedding-3-small"

export const formatContentAsString = (documents: Document[]): string =>
  documents.map((doc) => [`Title: ${doc.metadata.title}`,
    `Content: ${doc.pageContent}`,
    `Permalink: ${doc.metadata.permalink}`
  ].join("\n")).join("\n\n");

export class ChatAI extends OpenAPIRoute {
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
		data: Record<string, any>
	) {
	  const model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      configuration: {
        baseURL: env.OPENAI_GATEWAY
      }
	  })
	  const embeddings = new OpenAIEmbeddings({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: EMBENDDINGS_MODEL,
      configuration: {
        baseURL: env.OPENAI_GATEWAY
      }
	  })
	  const store = new CloudflareVectorizeStore(embeddings, {
      index: env.VECTORIZE_INDEX,
	  })

    const retriever = store.asRetriever()
		const prompt = PromptTemplate.fromTemplate(`#language:zh-TW
		  Your are the author (蒼時弦也) of the blog try to suggest article for the question in Mandarin Chinese with permalink and based only below article parts:
      {context}


      Constraints:
      * The suggest should be in your own words.
      * The suggest should be accurate and should not include any false information.
      * When mixing Chinese and English, add a whitespace between Chinese and English characters


      Example of Answer:
      撰寫 RSpec 可以透過 One-linear 來撰寫測試，這樣可以讓測試更簡潔，並且更容易閱讀。
      參考文章：
      * [優雅的 RSpec 測試 - 測試案例](https://blog.aotoki.me/posts/2023/01/27/elegant-rspec-example/)


      Question: {question}`)

    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatContentAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const question = data.body;
    const result = await chain.invoke(question.message);

		return {
			success: true,
			data: {
        message: result
			},
		};
	}
}
