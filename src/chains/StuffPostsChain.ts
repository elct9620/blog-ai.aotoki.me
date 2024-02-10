import { StuffDocumentsChain } from "langchain/chains";
import { ChainValues } from "@langchain/core/utils/types";
import { Document } from "@langchain/core/documents";

export const formatPostWithMetadata = (documents: Document[]): string =>
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

export class StuffPostsChain extends StuffDocumentsChain {
  /** @ignore */
  _prepInputs(values: ChainValues): ChainValues {
    if (!(this.inputKey in values)) {
      throw new Error(`Document key ${this.inputKey} not found.`);
    }
    const { [this.inputKey]: docs, ...rest } = values;
    return {
      ...rest,
      [this.documentVariableName]: formatPostWithMetadata(docs as Document[]),
    };
  }
}
