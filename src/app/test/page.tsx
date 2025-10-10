'use client';

import { useState } from 'react';
import { Document } from '@langchain/core/documents';

interface LanceDBDocument {
  text: string;
  vector: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function TestPage() {
  const [result, setResult] = useState<Document[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbDocuments, setDbDocuments] = useState<LanceDBDocument[]>([]);
  const [dbCount, setDbCount] = useState<number>(0);
  const [dbLoading, setDbLoading] = useState(false);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      setResult(data as Document[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDbDocuments = async () => {
    setDbLoading(true);
    try {
      const response = await fetch('/api/list-documents');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setDbDocuments(data.documents || []);
      setDbCount(data.count || 0);
    } catch (err) {
      console.error('Error loading documents:', err);
      alert('Failed to load documents from LanceDB');
    } finally {
      setDbLoading(false);
    }
  };

  const clearDatabase = async () => {
    if (!confirm('Are you sure you want to delete all documents from LanceDB?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/list-documents', {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        await loadDbDocuments();
      }
    } catch (err) {
      console.error('Error clearing database:', err);
      alert('Failed to clear database');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">PDF Loader Test</h1>
      
      <form onSubmit={handleFileUpload} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload PDF to test processing:
          </label>
          <input
            type="file"
            name="pdf"
            accept=".pdf"
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing PDF...' : 'Test PDF Processing'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-6">
          <h2 className="text-xl font-bold mb-4 text-green-800">
            ✅ Processing Successful!
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Document Stats</h3>
              <p><strong>Total Chunks:</strong> {result.length}</p>
              <p><strong>Total Characters:</strong> {result.reduce((sum, doc) => sum + doc.pageContent.length, 0).toLocaleString()}</p>
              <p><strong>Average Chunk Size:</strong> {Math.round(result.reduce((sum, doc) => sum + doc.pageContent.length, 0) / result.length)} chars</p>
            </div>
            
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">First Chunk Preview</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {result[0]?.pageContent.substring(0, 150)}...
              </p>
            </div>
          </div>

          <details className="bg-white border rounded">
            <summary className="p-4 cursor-pointer font-medium">
              View All Chunks ({result.length})
            </summary>
            <div className="p-4 border-t max-h-96 overflow-y-auto">
              {result.map((doc, index) => (
                <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Chunk {index + 1}</h4>
                    <span className="text-sm text-gray-500">{doc.pageContent.length} chars</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {doc.pageContent.substring(0, 200)}
                    {doc.pageContent.length > 200 && '...'}
                  </p>
                  {doc.metadata && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Metadata</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto ">
                        <div className="text-red-500">
                        {JSON.stringify(doc.metadata, null, 2)}
                        </div>
                      </pre>
                    </details>
                  )}
                </div>
              ))}
              <br />
              <div className="space-y-2">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/embed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          texts: result.map((doc) => doc.pageContent)
                        }),
                      });
                      const data = await response.json();
                      console.log('Embeddings:', data.embeddings);
                      alert(`Successfully embedded ${data.embeddings.length} documents`);
                    } catch (err) {
                      console.error('Error embedding documents:', err);
                      alert('Failed to embed documents');
                    }
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-2"
                >
                  Embed Documents
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/add-documents', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          documents: result.map((doc) => ({
                            pageContent: doc.pageContent,
                            metadata: doc.metadata,
                          }))
                        }),
                      });
                      const data = await response.json();
                      if (data.success) {
                        alert(`Successfully added ${data.count} documents to LanceDB`);
                        // Refresh the database view
                        await loadDbDocuments();
                      } else {
                        throw new Error(data.error);
                      }
                    } catch (err) {
                      console.error('Error adding documents:', err);
                      alert('Failed to add documents to LanceDB');
                    }
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add to LanceDB
                </button>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* LanceDB Visualization Section */}
      <div className="mt-8 border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">LanceDB Contents</h2>
          <div className="space-x-2">
            <button 
              onClick={loadDbDocuments}
              disabled={dbLoading}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
            >
              {dbLoading ? 'Loading...' : 'Load Documents'}
            </button>
            <button 
              onClick={clearDatabase}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Database
            </button>
          </div>
        </div>

        {dbCount > 0 ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Database Stats</h3>
              <p><strong>Total Documents:</strong> {dbCount}</p>
              <p><strong>Loaded Documents:</strong> {dbDocuments.length}</p>
            </div>

            <details className="bg-white border rounded" open>
              <summary className="p-4 cursor-pointer font-medium">
                View All Documents ({dbDocuments.length})
              </summary>
              <div className="p-4 border-t max-h-96 overflow-y-auto">
                {dbDocuments.length === 0 ? (
                  <p className="text-gray-500">No documents loaded. Click &quot;Load Documents&quot; to fetch.</p>
                ) : (
                  dbDocuments.map((doc, index) => (
                    <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Document {index + 1}</h4>
                        <span className="text-sm text-gray-500">
                          {doc.text?.length || 0} chars | Vector: {doc.vector?.length || 0}D
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                        {doc.text?.substring(0, 300) || 'No text content'}
                        {(doc.text?.length || 0) > 300 && '...'}
                      </p>
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">View Full Data</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                          {JSON.stringify({
                            ...doc,
                            vector: doc.vector ? `[${doc.vector.length} dimensions]` : undefined
                          }, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </details>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center">
            <p className="text-gray-600">
              No documents in database. Upload a PDF and add it to LanceDB to see documents here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
