// frontend/src/pages/TestConnection.jsx
import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';

const TestConnection = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    const tests = [
      { name: 'Backend Health', url: '/festivals', method: 'GET' },
      { name: 'Get Onam Festival', url: '/festival/onam', method: 'GET' },
      { name: 'Get Christmas Festival', url: '/festival/christmas', method: 'GET' },
      { name: 'Get All Food Items', url: '/food', method: 'GET' },
    ];

    const results = [];

    for (const test of tests) {
      try {
        console.log(`Testing: ${test.name} (${test.url})`);
        const response = await axios({
          method: test.method,
          url: test.url,
          timeout: 5000
        });
        
        results.push({
          name: test.name,
          status: '✅ PASS',
          details: `Status: ${response.status}, Data: ${JSON.stringify(response.data).substring(0, 100)}...`
        });
      } catch (error) {
        results.push({
          name: test.name,
          status: '❌ FAIL',
          details: `Error: ${error.message} ${error.response?.status ? `(Status: ${error.response.status})` : ''}`
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Backend Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Backend URL:</p>
              <code className="bg-gray-100 p-2 rounded block">http://localhost:5000/api</code>
            </div>
            <div>
              <p className="text-gray-600">Frontend URL:</p>
              <code className="bg-gray-100 p-2 rounded block">{window.location.origin}</code>
            </div>
          </div>
        </div>

        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 mb-6"
        >
          {loading ? 'Running Tests...' : 'Run Connection Tests'}
        </button>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border-l-4 pl-4 py-2" style={{ borderLeftColor: result.status.includes('PASS') ? '#10B981' : '#EF4444' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{result.name}</span>
                    <span className={result.status.includes('PASS') ? 'text-green-600' : 'text-red-600'}>
                      {result.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h3 className="font-semibold text-yellow-800">Troubleshooting</h3>
          <ul className="text-yellow-700 mt-2 space-y-1">
            <li>1. Open <a href="http://localhost:5000/api/festivals" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:5000/api/festivals</a> in new tab</li>
            <li>2. If it shows JSON data, backend is working</li>
            <li>3. If it shows error, check backend server is running</li>
            <li>4. Check browser console (F12) for CORS errors</li>
            <li>5. Make sure no other app is using port 5000</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;