import { OpenAIEmbeddings } from "@langchain/openai";

export function createEmbeddings() {
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small",
  });
}

export function getEmbeddingDimension(): number {
  return 1536;
}

export async function embedQuery(query: string): Promise<number[]> {
  const embeddings = createEmbeddings();
  const embedding = await embeddings.embedQuery(query);
  return embedding;
}

export async function embedDocuments(docs: string[]): Promise<number[][]> {
  const embeddings = createEmbeddings();
  const embedding = await embeddings.embedDocuments(docs);
  return embedding;
}
