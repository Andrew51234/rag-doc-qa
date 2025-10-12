import { NextResponse } from "next/server";
import { existsSync, rmSync } from "fs";

export async function POST() {
  try {
    const dbPath = "data/lancedb";
    
    if (existsSync(dbPath)) {
      rmSync(dbPath, { recursive: true, force: true });
      
      return NextResponse.json({
        success: true,
        message: "Database cleared successfully. Please re-upload your documents.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database was already empty.",
    });
  } catch (error) {
    console.error("Clear database error:", error);
    return NextResponse.json(
      {
        error: "Failed to clear database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

