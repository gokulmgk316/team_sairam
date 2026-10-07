import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { AnalysisReport } from '../../types';

interface DiscussWithAIProps {
  contextReport: AnalysisReport;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const DiscussWithAI: React.FC<DiscussWithAIProps> = ({ contextReport }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your TruthLens forensic assistant. I have reviewed the assessment for "${contextReport.title}" (Verdict: ${contextReport.assessment}, Confidence: ${contextReport.confidence}%). Feel free to ask me about specific claims, why certain signals were flagged, or what practical steps you can take to verify this content.`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    'Why did you give this result?',
    'Which claim is suspicious?',
    'What should I verify?',
    'Explain this in simple words.',
    'What evidence is missing?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuery;
    if (!q.trim() || isLoading) return;

    setError(null);
    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          contextReport: contextReport,
          chatHistory: messages,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve response from AI assistant.');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || "I don't have enough evidence to determine this.",
        },
      ]);
    } catch (err: any) {
      console.error('Discussion error:', err);
      setError('Unable to reach AI discussion service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Discuss With AI</h3>
            <p className="text-xs text-slate-400">Ask questions grounded strictly in the forensic report findings</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
          Gemini 3.8 Discussion Engine
        </span>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400">Suggested Questions:</span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 hover:text-cyan-300 text-slate-300 transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`p-4 rounded-2xl max-w-2xl whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400">
              Analyzing report context and preparing grounded explanation...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          id="input-discuss-query"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about this forensic report..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          id="btn-discuss-send"
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
};
