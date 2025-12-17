import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-amber-200 border-t-amber-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Loading Search Results</h2>
          <p className="text-gray-600">Please wait while we find your perfect properties...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}