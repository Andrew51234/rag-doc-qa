import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@langchain/core/documents';
import { addDocuments } from '../../../../lib/lancedb-store';

export async function POST(request: NextRequest) {
  try {
    const { documents } = await request.json();
    
    if (!Array.isArray(documents)) {
      return NextResponse.json(
        { error: 'documents must be an array' },
        { status: 400 }
      );
    }
    
    // Convert plain objects to Document instances
    const docs = documents.map((doc: Document) => 
      new Document({
        pageContent: doc.pageContent,
        metadata: doc.metadata || {},
      })
    );
    
    await addDocuments(docs);
    
    return NextResponse.json({ 
      success: true,
      count: docs.length 
    });
  } catch (error) {
    console.error('Error adding documents to LanceDB:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add documents' },
      { status: 500 }
    );
  }
}

