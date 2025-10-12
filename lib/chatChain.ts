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

Chat History:
{chatHistory}

Context from uploaded documents:
{context}

Current Question: {question}

Instructions:
- Use the chat history to understand the conversation context
- If this is a general question or greeting, start your response with [GENERAL] then answer naturally
- If you used the document context to answer, start your response with [DOCS] then provide your answer
- If this is about the documents but the context doesn't contain the answer, start with [DOCS] and say you cannot find that information

Format: [GENERAL] or [DOCS] followed by your answer.

Answer:`;

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
  const last10 = messages.slice(-10);
  return last10
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

  const rawAnswer = await answerChain.invoke({
    chatHistory: formatChatHistory(chatHistory),
    context,
    question: standaloneQuestion,
  });

  const usedDocs = rawAnswer.startsWith("[DOCS]");
  const cleanAnswer = rawAnswer
    .replace(/^\[DOCS\]\s*/i, "")
    .replace(/^\[GENERAL\]\s*/i, "")
    .trim();

  return {
    answer: cleanAnswer,
    sourceDocuments: usedDocs ? retrievedDocs : [],
  };
}

