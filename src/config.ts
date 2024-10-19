export class Config {
  constructor(
    public readonly OpenAiGateway: string,
    public readonly OpenAiApiKey: string,
    public readonly LlmModel: string,
    public readonly TextEmbeddingModel: string,
  ) {}
}
