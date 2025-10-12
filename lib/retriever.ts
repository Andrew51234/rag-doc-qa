import { initLanceDB } from "./lancedb-store";

export async function createRetriever(options?: { k?: number; filter?: Record<string, unknown> }) {
  const vectorStore = await initLanceDB();
  
  if (!vectorStore) {
    throw new Error("Vector store not initialized. Please upload documents first.");
  }
  
  const retriever = vectorStore.asRetriever({
    k: options?.k || 10,
    filter: options?.filter,
  });
  
  return retriever;
}

export async function retrieveDocuments(query: string, k: number = 5) {
  const vectorStore = await initLanceDB();
  
  if (!vectorStore) {
    return [];
  }
  
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}
