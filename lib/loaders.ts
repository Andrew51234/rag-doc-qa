import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export const loadPdf = async (pdfPath: string) => {
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    return docs;
}

export const splitDocs = async (docs: Document[]) => {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, 
        chunkOverlap: 200,
        separators: ["\n\n", "\n", " ", ""], // Split on new lines, spaces, and empty strings
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    return splitDocs;
}

export const isValidPdf = async (pdfPath: string) => {
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    return docs.length > 0;
}

export const processPdf = async (pdfPath: string, originalFileName?: string) => {
    if (!await isValidPdf(pdfPath)) {
        throw new Error("Invalid PDF file");
    }
    const docs = await loadPdf(pdfPath);
    const docsSplit = await splitDocs(docs);
    
    const processedDocs = docsSplit.map((doc, index) => {
        return new Document({
            pageContent: doc.pageContent,
            metadata: {
                ...doc.metadata,
                fileName: originalFileName || doc.metadata.source?.split('/').pop() || 'unknown.pdf',
                chunkIndex: index,
                totalChunks: docsSplit.length,
                uploadedAt: new Date().toISOString(),
                chunkSize: doc.pageContent.length,
                documentType: 'pdf',
                processingVersion: '1.0'
            }
        });
    });
    
    return processedDocs;
}