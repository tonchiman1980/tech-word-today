import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, AlertCircle } from 'lucide-react';

interface TermData {
  term: string;
  description: string;
}

function App() {
  const [data, setData] = useState<TermData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTerm = async () => {
    setLoading(true);
    setError(null);
    try {
      // Netlify Functionsの標準的なURLを指定
      const response = await fetch('/.netlify/functions/term');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `通信エラーが発生しました (Status: ${response.status})`);
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerm();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600">
            <BookOpen size={24} />
            <h1 className="text-xl font-bold">Tech Word Today</h1>
          </div>
          <button 
            onClick={fetchTerm}
            disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={`${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 text-red-700">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-sm">エラーが発生しました</p>
              <p className="text-xs mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold text-slate-800 break-words">
                  {data?.term}
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {data?.description}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <p className="mt-8 text-slate-400 text-sm">
        AIが最新のテック用語を毎日お届けします
      </p>
    </div>
  );
}

export default App;
