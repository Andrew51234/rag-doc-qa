import { NextRequest, NextResponse } from "next/server";
import { processPdf } from "../../../../lib/loaders";
import { addDocuments } from "../../../../lib/lancedb-store";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempPath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);

    try {
      writeFileSync(tempPath, buffer);

      const processedDocs = await processPdf(tempPath, file.name);

      await addDocuments(processedDocs);

      console.log(
        `Successfully processed and stored ${processedDocs.length} document chunks`
      );

      return NextResponse.json({
        success: true,
        fileName: file.name,
        chunks: processedDocs.length,
        message: `Successfully uploaded and processed ${file.name}`,
      });
    } finally {
      try {
        unlinkSync(tempPath);
      } catch (cleanupError) {
        console.warn("Failed to cleanup temp file:", cleanupError);
      }
    }
  } catch (error) {
    console.error("PDF upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload and process PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

