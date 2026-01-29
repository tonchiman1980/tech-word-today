import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BookOpen, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface TechTerm {
  term: string;
  category: string;
  summary: string;
  impact: string;
  risk: string;
  easy_analogy: string;
}

function App() {
  const [data, setData] = useState<TechTerm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/term');
      if (!res.ok) throw new Error('データ取得に失敗しました');
      const json = await res.json();
      setData(json);
      // キャッシュに保存
      localStorage.setItem('cached_term', JSON.stringify({ data: json, time: Date.now() }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1時間以内のキャッシュがあればそれを表示
    const cached = localStorage.getItem('cached_term');
    if (cached) {
      const { data, time } = JSON.parse(cached);
      if (Date.now() - time < 3600000) {
        setData(data);
        return;
      }
    }
    fetchTerm();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 pb-20">
      <header className="mb-8 mt-4 text-center">
        <h1 className="text-2xl font-bold text-indigo-700 flex items-center justify-center gap-2">
          <Sparkles size={24} /> Tech Word Today
        </h1>
        <p className="text-sm text-slate-500">iPhoneで学ぶ最先端テックと投資</p>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64">
          <RefreshCw className="animate-spin text-indigo-500 mb-2" size={32} />
          <p className="text-slate-400">AIが用語を厳選中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-xl text-red-600 text-sm mb-4">
          エラーが発生しました: {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4 max-w-md mx-auto">
          {/* メインカード */}
          <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 overflow-hidden border border-indigo-50">
            <div className="bg-indigo-600 p-4 text-white">
              <span className="text-xs font-bold bg-indigo-400/50 px-2 py-1 rounded-full uppercase tracking-wider">
                {data.category}
              </span>
              <h2 className="text-2xl font-black mt-2 leading-tight">{data.term}</h2>
            </div>
            
            <div className="p-5 space-y-6">
              <section>
                <h3 className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                  <BookOpen size={18} /> 概要
                </h3>
                <p className="text-slate-700 leading-relaxed">{data.summary}</p>
              </section>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-1 text-sm">
                    <TrendingUp size={16} /> 投資インパクト
                  </h3>
                  <p className="text-xs text-emerald-900">{data.impact}</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h3 className="flex items-center gap-2 text-amber-700 font-bold mb-1 text-sm">
                    <AlertTriangle size={16} /> リスク・不確実性
                  </h3>
                  <p className="text-xs text-amber-900">{data.risk}</p>
                </div>
              </div>

              <section className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 italic">
                <h3 className="flex items-center gap-2 text-indigo-700 font-bold mb-1 text-sm not-italic">
                  <Lightbulb size={16} /> やさしい解説
                </h3>
                <p className="text-sm text-indigo-900">「{data.easy_analogy}」</p>
              </section>
            </div>
          </div>

          <button 
            onClick={fetchTerm}
            className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw size={20} /> 用語を更新する
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
