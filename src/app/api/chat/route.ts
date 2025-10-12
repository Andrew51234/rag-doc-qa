import { NextRequest, NextResponse } from "next/server";
import { answerQuestion, ChatMessage } from "../../../../lib/chatChain";

export async function POST(request: NextRequest) {
  try {
    const { question, chatHistory } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required and must be a string" },
        { status: 400 }
      );
    }

    const history: ChatMessage[] = Array.isArray(chatHistory)
      ? chatHistory
      : [];

    const result = await answerQuestion(question, history);

    return NextResponse.json({
      answer: result.answer,
      sources: result.sourceDocuments.map((doc) => ({
        content: doc.pageContent.substring(0, 200),
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Vector store not initialized")
    ) {
      return NextResponse.json(
        {
          error: "No documents uploaded yet",
          details: "Please upload a PDF document first before asking questions.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

