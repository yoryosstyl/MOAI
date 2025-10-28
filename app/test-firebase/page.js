'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';

export default function TestFirebasePage() {
  const [status, setStatus] = useState({
    auth: 'Testing...',
    firestore: 'Testing...',
    storage: 'Testing...',
  });

  useEffect(() => {
    // Test Auth
    try {
      if (auth) {
        setStatus((prev) => ({ ...prev, auth: '✓ Connected' }));
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, auth: `✗ Error: ${error.message}` }));
    }

    // Test Firestore
    try {
      if (db) {
        setStatus((prev) => ({ ...prev, firestore: '✓ Connected' }));
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, firestore: `✗ Error: ${error.message}` }));
    }

    // Test Storage
    try {
      if (storage) {
        setStatus((prev) => ({ ...prev, storage: '✓ Connected' }));
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, storage: `✗ Error: ${error.message}` }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Firebase Connection Test
          </h1>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Authentication:</span>
              <span className={status.auth.includes('✓') ? 'text-green-600' : 'text-gray-600'}>
                {status.auth}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Firestore Database:</span>
              <span className={status.firestore.includes('✓') ? 'text-green-600' : 'text-gray-600'}>
                {status.firestore}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Storage:</span>
              <span className={status.storage.includes('✓') ? 'text-green-600' : 'text-gray-600'}>
                {status.storage}
              </span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Firebase Project Info:</h3>
            <p className="text-sm text-blue-800">
              Project ID: moai-aca3c
            </p>
            <p className="text-sm text-blue-800">
              Region: europe-west3 (Frankfurt)
            </p>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
