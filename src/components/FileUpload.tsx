import { useRef, ChangeEvent } from "react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function FileUpload({
  onUpload,
  disabled = false,
  isLoading = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
    } else if (file) {
      alert("Please select a PDF file");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="hidden"
        id="pdf-upload"
      />
      <label
        htmlFor="pdf-upload"
        className={`inline-flex items-center gap-2 px-4 py-2 
                   border border-gray-300 dark:border-gray-700 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                   font-medium cursor-pointer
                   hover:bg-gray-50 dark:hover:bg-gray-700
                   focus-within:ring-2 focus-within:ring-blue-500
                   ${
                     disabled || isLoading
                       ? "opacity-50 cursor-not-allowed"
                       : ""
                   }
                   transition-colors`}
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {isLoading ? "Uploading..." : "Upload PDF"}
      </label>
    </div>
  );
}

