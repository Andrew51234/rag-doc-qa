import { NextRequest, NextResponse } from 'next/server';
import { embedDocuments } from '../../../../lib/embeddings';

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json();
    
    if (!Array.isArray(texts)) {
      return NextResponse.json(
        { error: 'texts must be an array' },
        { status: 400 }
      );
    }
    
    const embeddings = await embedDocuments(texts);
    
    return NextResponse.json({ embeddings });
  } catch (error) {
    console.error('Error embedding documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to embed documents' },
      { status: 500 }
    );
  }
}

