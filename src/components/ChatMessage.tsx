import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ content: string; metadata: Record<string, unknown> }>;
}

export default function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        }`}
      >
        <div className="text-sm font-medium mb-1 opacity-70">
          {isUser ? "You" : "Assistant"}
        </div>
        
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{content}</div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none
                          prose-p:my-2 prose-p:leading-relaxed
                          prose-pre:bg-gray-900 prose-pre:text-gray-100
                          prose-code:text-blue-600 dark:prose-code:text-blue-400
                          prose-code:bg-gray-200 dark:prose-code:bg-gray-700
                          prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          prose-ul:my-2 prose-ol:my-2
                          prose-li:my-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}

        {sources && sources.length > 0 && (
          <details className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <summary className="text-xs font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
              📚 Sources ({sources.length})
            </summary>
            <div className="mt-2 space-y-2">
              {sources.map((source, idx) => {
                const fileName = String(source.metadata.fileName || "Unknown");
                const pageNumber = source.metadata.pageNumber 
                  ? ` (Page ${String(source.metadata.pageNumber)})` 
                  : "";
                
                return (
                  <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fileName}{pageNumber}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {source.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

