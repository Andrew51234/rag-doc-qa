import { NextRequest, NextResponse } from 'next/server';
import { connect } from "@lancedb/lancedb";

export async function GET(request: NextRequest) {
  try {
    const db = await connect("data/lancedb");
    
    // Try to open the table
    let table;
    try {
      table = await db.openTable("rag-doc-qa");
    } catch {
      return NextResponse.json({ 
        documents: [],
        count: 0,
        message: 'No documents found. Table does not exist yet.'
      });
    }
    
    // Get all documents (limit to 100 for performance)
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');
    
    const results = await table
      .query()
      .limit(limit)
      .offset(offset)
      .toArray();
    
    // Get total count
    const countResult = await table.countRows();
    
    return NextResponse.json({ 
      documents: results,
      count: countResult,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error listing documents from LanceDB:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list documents' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const db = await connect("data/lancedb");
    
    // Drop the table to clear all documents
    try {
      await db.dropTable("rag-doc-qa");
      return NextResponse.json({ 
        success: true,
        message: 'All documents deleted successfully'
      });
    } catch {
      return NextResponse.json({ 
        success: true,
        message: 'Table did not exist or was already empty'
      });
    }
  } catch (error) {
    console.error('Error deleting documents from LanceDB:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete documents' },
      { status: 500 }
    );
  }
}

