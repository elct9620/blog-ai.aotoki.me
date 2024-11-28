import { InjectionToken, container, instanceCachingFactory } from "tsyringe";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Config } from "../config";
import { IBaseLanguageModel } from "usecase/langchain";

container.register(ChatOpenAI, {
  useFactory: instanceCachingFactory((c) => {
    const config = c.resolve(Config);
    return new ChatOpenAI({
      openAIApiKey: config.OpenAiApiKey,
      modelName: config.LlmModel,
      temperature: 0.65,
      configuration: {
        baseURL: config.OpenAiGateway,
      },
    });
  }),
});
container.register(IBaseLanguageModel, { useToken: ChatOpenAI });

container.register(OpenAIEmbeddings, {
  useFactory: instanceCachingFactory((c) => {
    const config = c.resolve(Config);
    return new OpenAIEmbeddings({
      openAIApiKey: config.OpenAiApiKey,
      modelName: config.TextEmbeddingModel,
      configuration: {
        baseURL: config.OpenAiGateway,
      },
    });
  }),
});
