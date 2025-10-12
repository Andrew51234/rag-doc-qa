import { NextResponse } from "next/server";
import { connect } from "@lancedb/lancedb";

export async function GET() {
  try {
    const db = await connect("data/lancedb");
    const tableNames = await db.tableNames();

    if (!tableNames.includes("rag-doc-qa")) {
      return NextResponse.json({
        hasDocuments: false,
        fileNames: [],
        count: 0,
      });
    }

    const table = await db.openTable("rag-doc-qa");
    const count = await table.countRows();

    if (count === 0) {
      return NextResponse.json({
        hasDocuments: false,
        fileNames: [],
        count: 0,
      });
    }

    const docs = await table.query().limit(100).toArray();
    const uniqueFileNames = [
      ...new Set(docs.map((doc: { fileName?: string }) => doc.fileName).filter(Boolean)),
    ];

    return NextResponse.json({
      hasDocuments: true,
      fileNames: uniqueFileNames,
      count,
    });
  } catch (error) {
    console.error("Check documents error:", error);
    return NextResponse.json({
      hasDocuments: false,
      fileNames: [],
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

