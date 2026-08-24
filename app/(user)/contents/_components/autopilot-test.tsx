'use client';

import { useState } from 'react';

export function AutopilotTest() {
   const [businessId, setBusinessId] = useState('');
   const [creatorId, setCreatorId] = useState('');
   const [loading, setLoading] = useState(false);
   const [result, setResult] = useState<null>(null);
   const [error, setError] = useState<string | null>(null);

   const handleGenerate = async () => {
      if (!businessId || !creatorId) {
         setError('Business ID and Creator ID are required');
         return;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
         const response = await fetch('/api/autopilot/generate', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'X-Auto-Create': 'true'
            },
            body: JSON.stringify({
               businessId,
               creatorId,
               days: 7, // Test with just 7 days
               platforms: ['INSTAGRAM', 'FACEBOOK']
            })
         });

         // Check if response is JSON
         const contentType = response.headers.get('content-type');
         if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
         }

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.error || 'Generation failed');
         }

         setResult(data);
      } catch (err) {
         console.error('Generation error:', err);
         setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="p-6 max-w-2xl mx-auto">
         <h2 className="text-2xl font-bold mb-4">Autopilot Generator Test</h2>

         <div className="space-y-4 mb-6">
            <div>
               <label className="block text-sm font-medium mb-1">Business ID</label>
               <input
                  type="text"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter business ID"
               />
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Creator ID</label>
               <input
                  type="text"
                  value={creatorId}
                  onChange={(e) => setCreatorId(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter creator ID"
               />
            </div>

            <button
               onClick={handleGenerate}
               disabled={loading}
               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
               {loading ? 'Generating...' : 'Generate 7-Day Plan'}
            </button>
         </div>

         {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
               <h3 className="font-bold mb-2">Error</h3>
               <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            </div>
         )}

         {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
               <h3 className="font-bold mb-2">Success!</h3>
               <pre className="text-sm whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(result, null, 2)}
               </pre>
            </div>
         )}

         <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">How to find IDs:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
               <li>Open browser DevTools (F12)</li>
               <li>Go to Network tab</li>
               <li>Navigate to any page in the app</li>
               <li>Look for API calls - check the request body for businessId</li>
               <li>Or query the database directly:
                  <pre className="bg-white p-2 mt-1 rounded text-xs">SELECT id, name FROM &quot;Business&quot;;</pre>
               </li>
            </ol>
         </div>
      </div>
   );
}
