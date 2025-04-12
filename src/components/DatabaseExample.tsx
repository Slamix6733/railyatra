'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function DatabaseExample() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-schema');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to fetch data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm max-w-md mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">Database Connection Test</h2>
      
      <button
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="font-semibold">{result.success ? '✅ Success' : '❌ Error'}</p>
          <p>{result.message}</p>
          
          {result.error && (
            <div className="mt-2 p-2 bg-red-50 rounded text-sm">
              <pre>{result.error}</pre>
            </div>
          )}
          
          {result.data && (
            <div className="mt-2">
              <p className="text-sm font-medium">Connection test:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify(result.data.connectionTest, null, 2)}
              </pre>
              
              <p className="text-sm font-medium mt-2">Available tables:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify(result.data.tables, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 