import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Eye, 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { AnalysisReport, HistoryItem } from '../../types';

interface AnalysisHistoryProps {
  onSelectReport: (report: AnalysisReport) => void;
  onNavigateToAnalyzer: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ 
  onSelectReport, 
  onNavigateToAnalyzer 
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('truthlens_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('truthlens_history', JSON.stringify(updated));
  };

  const handleConfirmClear = () => {
    setHistory([]);
    localStorage.removeItem('truthlens_history');
    setShowConfirmClear(false);
  };

  const filteredHistory = filterMode === 'all' 
    ? history 
    : history.filter(item => item.mode === filterMode);

  return (
    <div id="history-container" className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Analysis History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review past forensic scans stored securely in your browser's local sandbox.
          </p>
        </div>

        {history.length > 0 && (
          <button
            id="btn-trigger-clear-history"
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 transition-colors w-fit cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Confirmation Modal for Clearing History (safe in iframes) */}
      {showConfirmClear && (
        <div id="modal-confirm-clear" className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200">
          <div>
            <span className="font-bold text-white">Clear All History?</span>
            <p className="text-rose-300 text-[11px]">This will delete all saved scan reports from local browser storage. This cannot be undone.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-clear-history"
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-clear-history"
              onClick={handleConfirmClear}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              Confirm Clear
            </button>
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold mr-1">Filter:</span>
        {['all', 'news', 'text', 'image', 'faceswap', 'video', 'audio', 'dubbing'].map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-3 py-1 rounded-lg uppercase tracking-wider font-semibold transition-colors ${
              filterMode === m
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No Analysis History Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You haven't run any forensic scans matching this filter yet. Analyze an article, image, or media clip to view it here.
            </p>
          </div>
          <button
            onClick={onNavigateToAnalyzer}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            Launch TruthLens Analyzer
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* History Items List */
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isReliable = 
              item.assessment.includes('Reliable') || 
              item.assessment.includes('Authentic') || 
              item.assessment.includes('Human');
            const isWarning = item.assessment.includes('Verification') || item.assessment.includes('Mixed');

            return (
              <div
                key={item.id}
                onClick={() => onSelectReport(item.report)}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-800 hover:bg-slate-850 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {item.mode}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isReliable
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isWarning
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {item.assessment}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Index Score: {item.score}/100
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteItem(item.id, e)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
