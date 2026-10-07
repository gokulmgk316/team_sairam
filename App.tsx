import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AnalyzerDashboard } from './components/Analyzer/AnalyzerDashboard';
import { ResultsDashboard } from './components/Results/ResultsDashboard';
import { AnalysisHistory } from './components/History/AnalysisHistory';
import { AboutPage } from './components/About/AboutPage';
import { AnalysisMode, AnalysisReport, SampleCase } from './types';
import { ShieldCheck, Heart, Radio, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'analyzer' | 'history' | 'about'>('home');
  const [activeMode, setActiveMode] = useState<AnalysisMode>('news');
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleCase | null>(null);

  // Trigger analyzer with a specific mode
  const handleStartAnalysis = (mode: AnalysisMode = 'news') => {
    setActiveMode(mode);
    setActiveReport(null);
    setSelectedSample(null);
    setActiveView('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger sample case directly
  const handleSelectSample = (sample: SampleCase) => {
    setSelectedSample(sample);
    setActiveMode(sample.mode);
    setActiveReport(null);
    setActiveView('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When analysis completes
  const handleAnalysisComplete = (report: AnalysisReport) => {
    setActiveReport(report);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When selecting a previous report from history
  const handleSelectHistoryReport = (report: AnalysisReport) => {
    setActiveReport(report);
    setActiveView('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Sticky Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view !== 'analyzer') {
            setActiveReport(null);
          }
        }}
        onSelectSample={handleSelectSample}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* VIEW 1: HOME LANDING PAGE */}
        {activeView === 'home' && (
          <LandingPage
            onStartAnalysis={handleStartAnalysis}
            onSelectSample={handleSelectSample}
          />
        )}

        {/* VIEW 2: ANALYZER OR ACTIVE REPORT */}
        {activeView === 'analyzer' && (
          <div>
            {activeReport ? (
              <ResultsDashboard
                report={activeReport}
                onBackToAnalyzer={() => setActiveReport(null)}
              />
            ) : (
              <AnalyzerDashboard
                initialMode={activeMode}
                onAnalysisComplete={handleAnalysisComplete}
                selectedSample={selectedSample}
                onClearSample={() => setSelectedSample(null)}
              />
            )}
          </div>
        )}

        {/* VIEW 3: ANALYSIS HISTORY */}
        {activeView === 'history' && (
          <AnalysisHistory
            onSelectReport={handleSelectHistoryReport}
            onNavigateToAnalyzer={() => handleStartAnalysis('news')}
          />
        )}

        {/* VIEW 4: ABOUT PAGE */}
        {activeView === 'about' && (
          <AboutPage
            onStartAnalysis={() => handleStartAnalysis('news')}
          />
        )}

      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 py-10 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white font-mono">
                  Truth<span className="text-cyan-400">Lens</span> AI
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Autonomous multi-signal forensic verification platform designed to detect synthetic media, fake news, and deepfakes with explainable evidence.
              </p>
            </div>

            {/* Column 2: Capabilities */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                Forensic Modules
              </span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>Fake News & Rhetoric Breakdown</li>
                <li>AI Stylometry & Perplexity</li>
                <li>Pixel & Specular Tampering</li>
                <li>Facial Deepfakes & Face-Swaps</li>
                <li>Lip-Sync & Dubbing Consistency</li>
                <li>Acoustic Respiration & Vocoder Signatures</li>
              </ul>
            </div>

            {/* Column 3: Trust & Fact-Checking */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                Trusted Fact Registries
              </span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>International Fact-Checking Network (IFCN)</li>
                <li>Reuters Fact Check</li>
                <li>Associated Press (AP) Fact Check</li>
                <li>Snopes & PolitiFact Directories</li>
                <li>W3C Media Integrity Credentials</li>
              </ul>
            </div>

            {/* Column 4: System Telemetry */}
            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                System Architecture
              </span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Engine:</span>
                  <span className="text-cyan-400 font-mono">Gemini 3.8 Multi-Signal</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Transcription:</span>
                  <span className="text-indigo-400 font-mono">Gemini 3.5 Transcribe</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Pipeline Status:</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom disclaimer bar */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>
              TruthLens AI is an educational and forensic diagnostic tool. AI assessments indicate probability and should be paired with verified primary sources.
            </p>
            <div className="flex items-center gap-1 text-slate-400">
              Built for Truth & Media Integrity
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
