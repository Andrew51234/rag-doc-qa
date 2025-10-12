# 📚 RAG Document Q&A

A modern, intelligent document question-answering system powered by Retrieval-Augmented Generation (RAG). Upload PDF documents and ask questions in natural language to get accurate, context-aware answers with source citations.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![LangChain](https://img.shields.io/badge/LangChain-0.3-green?style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🤖 **Intelligent Q&A** - Ask questions in natural language and get contextual answers
- 📄 **PDF Upload** - Support for PDF document uploads with automatic processing
- 🔍 **Semantic Search** - Uses vector embeddings for accurate document retrieval
- 💬 **Chat History** - Maintains conversation context for follow-up questions
- 📚 **Source Citations** - Shows relevant document excerpts with page numbers
- 🎨 **Modern UI** - Clean, responsive interface with dark mode support
- ⚡ **Fast & Efficient** - Powered by LanceDB vector database
- 🔄 **Real-time Updates** - Live document chunk counter and upload status
- 🧹 **Database Management** - Clear chat history or entire database with one click

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS 4.x** - Styling with dark mode
- **react-markdown** - Markdown rendering for AI responses

### Backend & AI
- **LangChain** - LLM orchestration framework
- **OpenAI GPT-4o-mini** - Language model
- **OpenAI Embeddings** - Text embedding model (text-embedding-3-small)
- **LanceDB** - Vector database for embeddings storage
- **pdf-parse** - PDF document processing

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rag-doc-qa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### 1. Upload Documents
- Click the **"Upload PDF"** button in the header
- Select a PDF file from your computer
- Wait for processing (files are automatically chunked and embedded)
- See the uploaded document name in the blue banner

### 2. Ask Questions
- Type your question in the chat input at the bottom
- Press **Enter** or click **Send**
- Receive AI-generated answers with source citations
- Ask follow-up questions - the system remembers context

### 3. View Sources
- Click on **"📚 Sources"** dropdown in assistant messages
- See relevant document excerpts with file names and page numbers
- Sources only appear when the answer is based on your documents

### 4. Manage Database
- **Clear Chat** - Remove chat messages (keeps documents)
- **Clear Database** - Delete all uploaded documents and embeddings

## 📁 Project Structure

```
rag-doc-qa/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts           # Chat endpoint
│   │   │   ├── upload/route.ts         # PDF upload endpoint
│   │   │   ├── clear-database/route.ts # Database clearing endpoint
│   │   │   ├── check-documents/route.ts # Document count endpoint
│   │   │   └── list-documents/route.ts  # List documents endpoint
│   │   ├── page.tsx                     # Main chat interface
│   │   ├── not-found.tsx                # 404 page
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Global styles
│   └── components/
│       ├── ChatMessage.tsx              # Message bubble component
│       ├── ChatInput.tsx                # Chat input field
│       ├── FileUpload.tsx               # PDF upload button
│       └── Toast.tsx                    # Notification component
├── lib/
│   ├── embeddings.ts                    # OpenAI embeddings setup
│   ├── lancedb-store.ts                 # Vector database operations
│   ├── loaders.ts                       # PDF loading and chunking
│   ├── retriever.ts                     # Document retrieval logic
│   └── chatChain.ts                     # RAG chat chain logic
├── data/
│   └── lancedb/                         # Vector database storage
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🔌 API Endpoints

### POST `/api/upload`
Upload and process a PDF document.

**Request:**
- `Content-Type: multipart/form-data`
- Body: `{ pdf: File }`

**Response:**
```json
{
  "success": true,
  "fileName": "document.pdf",
  "chunks": 33,
  "message": "Successfully uploaded and processed document.pdf"
}
```

### POST `/api/chat`
Send a question and receive an AI-generated answer.

**Request:**
```json
{
  "question": "What is this document about?",
  "chatHistory": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

**Response:**
```json
{
  "answer": "This document is about...",
  "sources": [
    {
      "content": "Relevant excerpt from document...",
      "metadata": {
        "fileName": "document.pdf",
        "pageNumber": 5
      }
    }
  ]
}
```

### POST `/api/clear-database`
Clear all documents from the vector database.

**Response:**
```json
{
  "success": true,
  "message": "Database cleared successfully. All documents removed."
}
```

### GET `/api/check-documents`
Check if documents exist and get file names.

**Response:**
```json
{
  "hasDocuments": true,
  "fileNames": ["document1.pdf", "document2.pdf"]
}
```

### GET `/api/list-documents`
List all documents with pagination.

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)

**Response:**
```json
{
  "documents": [...],
  "count": 150,
  "limit": 100,
  "offset": 0
}
```

## 🧠 How It Works

### RAG Pipeline

1. **Document Processing**
   - PDF is uploaded and parsed
   - Text is split into chunks (1500 chars, 300 overlap)
   - Each chunk is embedded using OpenAI's `text-embedding-3-small`
   - Embeddings are stored in LanceDB with metadata

2. **Query Processing**
   - User question is embedded using the same model
   - Vector similarity search retrieves top 10 relevant chunks
   - Retrieved context is passed to the LLM

3. **Answer Generation**
   - LLM receives:
     - User question
     - Chat history (last 10 messages)
     - Retrieved document context
   - Generates answer using GPT-4o-mini
   - Determines if answer is document-based or general
   - Returns answer with source citations if applicable

4. **Memory Management**
   - Chat history is maintained client-side
   - Last 10 messages are sent with each request
   - Follow-up questions are condensed into standalone queries

## 🛠️ Configuration

### Embedding Model
Change in `lib/embeddings.ts`:
```typescript
modelName: "text-embedding-3-small" // or "text-embedding-3-large"
```

### Chunk Size
Adjust in `lib/loaders.ts`:
```typescript
chunkSize: 1500,      // Characters per chunk
chunkOverlap: 300,    // Overlap between chunks
```

### Retrieval Count
Modify in `lib/chatChain.ts`:
```typescript
const retriever = await createRetriever({ k: 10 }); // Number of chunks to retrieve
```

### LLM Model
Update in `lib/chatChain.ts`:
```typescript
modelName: "gpt-4o-mini", // or "gpt-4o", "gpt-4-turbo", etc.
temperature: 0.7,          // 0.0 = deterministic, 1.0 = creative
```

## 🐛 Troubleshooting

### Issue: "Vector store not initialized"
**Solution:** Upload at least one PDF document before asking questions.

### Issue: Duplicate file upload
**Solution:** Clear the database first if you want to re-upload the same file.

### Issue: AI says "I don't know" to everything
**Solution:** 
- Ensure your document was uploaded successfully
- Check that chunks were created (see upload confirmation)
- Try asking more specific questions
- Clear database and re-upload if issues persist

### Issue: Build errors with Turbopack
**Solution:** Run build without turbopack:
```bash
npm run build -- --no-turbopack
```

### Issue: Database errors
**Solution:** Delete the `data/lancedb` directory and restart:
```bash
rm -rf data/lancedb
npm run dev
```

## 🚧 Future Enhancements

- [ ] Support for multiple file formats (DOCX, TXT, Markdown)
- [ ] Streaming responses for better UX
- [ ] User authentication and session management
- [ ] Document versioning and update tracking
- [ ] Advanced filtering (by date, author, document type)
- [ ] Export chat history
- [ ] Batch document upload
- [ ] Custom embedding models
- [ ] Multi-language support

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |

## 🏃 Scripts

```bash
# Development with Turbopack (recommended)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👨‍💻 Author

Built with ❤️ using Next.js, LangChain, and OpenAI.

---

**Happy Q&A-ing! 🚀**
