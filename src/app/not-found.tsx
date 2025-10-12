import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Take Me Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 
                   bg-blue-600 text-white rounded-lg font-medium
                   hover:bg-blue-700 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   dark:focus:ring-offset-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Take Me Home
        </Link>

        {/* Additional Info */}
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-500">
          <p>Looking for the RAG Document Q&A app?</p>
          <p>Head back to the home page to upload PDFs and ask questions!</p>
        </div>
      </div>
    </div>
  );
}

