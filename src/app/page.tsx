"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import FileUpload from "../components/FileUpload";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedFiles((prev) => [...prev, file.name]);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ Successfully uploaded and processed "${file.name}". Created ${data.chunks} chunks. You can now ask questions about it!`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `❌ Failed to upload file: ${data.error}`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error uploading file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          chatHistory: messages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: `❌ Error: ${data.error}${data.details ? ` - ${data.details}` : ""}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleClearDatabase = async () => {
    if (!confirm("This will delete ALL uploaded documents and clear the database. Are you sure?")) {
      return;
    }

    try {
      const response = await fetch("/api/clear-database", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([]);
        setUploadedFiles([]);
        alert(data.message);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error clearing database: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              RAG Document Q&A
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload PDFs and ask questions about your documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <FileUpload
              onUpload={handleFileUpload}
              disabled={isLoading}
              isLoading={isUploading}
            />
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                disabled={isLoading || isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                         border border-gray-300 dark:border-gray-700 rounded-lg
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                Clear Chat
              </button>
            )}
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleClearDatabase}
                disabled={isLoading || isUploading}
                className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400
                         border border-red-300 dark:border-red-700 rounded-lg
                         hover:bg-red-50 dark:hover:bg-red-900/20
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
              >
                Clear Database
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Uploaded Files Banner */}
      {uploadedFiles.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Uploaded documents:</span>{" "}
              {uploadedFiles.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="mb-8">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Welcome to RAG Document Q&A
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Upload a PDF document to get started, then ask any questions
                  about its content. The AI will answer based on the information
                  in your documents.
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                <p>💡 Tip: Upload multiple PDFs to search across all of them</p>
                <p>🔍 Ask specific questions for better answers</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSubmit={handleSendMessage}
            disabled={isLoading || isUploading}
            placeholder={
              uploadedFiles.length === 0
                ? "Upload a PDF first to start asking questions..."
                : "Ask a question about your documents..."
            }
          />
        </div>
      </footer>
    </div>
  );
}
