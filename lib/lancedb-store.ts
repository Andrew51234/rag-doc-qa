import { connect } from "@lancedb/lancedb";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { createEmbeddings } from "./embeddings";
import { Document } from "@langchain/core/documents";

export async function initLanceDB() {
  const db = await connect("data/lancedb");
  const embeddings = createEmbeddings();
  
  // Check if table exists
  const tableNames = await db.tableNames();
  
  if (tableNames.includes("rag-doc-qa")) {
    const table = await db.openTable("rag-doc-qa");
    const vectorStore = new LanceDB(embeddings, { table });
    return vectorStore;
  }
  
  // Table doesn't exist yet, return null to signal it needs to be created with documents
  return null;
}

export async function addDocuments(documents: Document[]) {
  if (documents.length === 0) {
    throw new Error("Cannot add empty document array");
  }
  
  const db = await connect("data/lancedb");
  const embeddings = createEmbeddings();
  
  // Flatten metadata to simple types that LanceDB can handle
  const processedDocs = documents.map(doc => {
    const metadata = doc.metadata || {};
    
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        // Core fields
        source: String(metadata.source || ''),
        fileName: String(metadata.fileName || ''),
        
        // Numeric fields
        chunkIndex: Number(metadata.chunkIndex || 0),
        totalChunks: Number(metadata.totalChunks || 0),
        chunkSize: Number(metadata.chunkSize || 0),
        
        // Text fields
        uploadedAt: String(metadata.uploadedAt || ''),
        documentType: String(metadata.documentType || 'pdf'),
        processingVersion: String(metadata.processingVersion || '1.0'),
        
        // PDF-specific fields (flatten if they exist)
        pdfAuthor: String(metadata.pdf?.info?.Author || ''),
        pdfTitle: String(metadata.pdf?.info?.Title || ''),
        pdfCreator: String(metadata.pdf?.info?.Creator || ''),
        pdfProducer: String(metadata.pdf?.info?.Producer || ''),
        pdfTotalPages: Number(metadata.pdf?.totalPages || 0),
        
        // Page number from loc if available
        pageNumber: Number(metadata.loc?.pageNumber || 0)
      }
    });
  });
  
  // Check if table exists
  const tableNames = await db.tableNames();
  
  if (tableNames.includes("rag-doc-qa")) {
    // Table exists, add documents to it
    const table = await db.openTable("rag-doc-qa");
    const vectorStore = new LanceDB(embeddings, { table });
    await vectorStore.addDocuments(processedDocs);
  } else {
    // Table doesn't exist, create it from documents
    await LanceDB.fromDocuments(processedDocs, embeddings, {
      uri: "data/lancedb",
      tableName: "rag-doc-qa"
    });
  }
}

export async function queryDocuments(query: string, k: number = 10) {
  const vectorStore = await initLanceDB();
  
  if (!vectorStore) {
    return []; // No documents yet
  }
  
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}