import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { createRetriever } from "./retriever";

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation history and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chatHistory}

Follow Up Question: {question}
Standalone Question:`;

const QA_TEMPLATE = `You are a helpful AI assistant with access to uploaded documents. 

First, determine if the user's question is:
1. A general question (greetings, general knowledge, casual conversation) - Answer naturally without requiring document context
2. A document-specific question (asking about the uploaded documents) - Use the provided context to answer

Context from uploaded documents:
{context}

Question: {question}

Instructions:
- If this is a general question or greeting, respond naturally and helpfully
- If this is about the documents and the context is relevant, provide a detailed answer based on the context
- If this is about the documents but the context doesn't contain the answer, say you cannot find that specific information in the uploaded documents

Helpful Answer:`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function createChatChain() {
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  return llm;
}

function formatChatHistory(messages: ChatMessage[]): string {
  return messages
    .map((msg) => `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`)
    .join("\n");
}

function formatDocuments(docs: Document[]): string {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

export async function answerQuestion(
  question: string,
  chatHistory: ChatMessage[] = []
) {
  const llm = await createChatChain();
  const retriever = await createRetriever({ k: 10 });

  let standaloneQuestion = question;

  if (chatHistory.length > 0) {
    const condenseQuestionPrompt = PromptTemplate.fromTemplate(
      CONDENSE_QUESTION_TEMPLATE
    );

    const condenseQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      llm,
      new StringOutputParser(),
    ]);

    standaloneQuestion = await condenseQuestionChain.invoke({
      chatHistory: formatChatHistory(chatHistory),
      question,
    });
  }

  const retrievedDocs = await retriever.invoke(standaloneQuestion);
  const context = formatDocuments(retrievedDocs);

  const qaPrompt = PromptTemplate.fromTemplate(QA_TEMPLATE);

  const answerChain = RunnableSequence.from([
    qaPrompt,
    llm,
    new StringOutputParser(),
  ]);

  const answer = await answerChain.invoke({
    context,
    question: standaloneQuestion,
  });

  return {
    answer,
    sourceDocuments: retrievedDocs,
  };
}

