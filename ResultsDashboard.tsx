import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft, 
  Share2, 
  Download, 
  ExternalLink, 
  Eye, 
  FileText, 
  Sparkles, 
  Layers, 
  Sliders, 
  MessageSquare, 
  Printer, 
  X,
  Info,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AnalysisReport, ReviewRegion } from '../../types';
import { DiscussWithAI } from './DiscussWithAI';

interface ResultsDashboardProps {
  report: AnalysisReport;
  onBackToAnalyzer: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  report, 
  onBackToAnalyzer 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'evidence' | 'discuss'>('overview');
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<ReviewRegion | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Determine overall badge color and text
  const isReliable = 
    report.assessment === 'Likely Reliable' || 
    report.assessment === 'Likely Authentic' || 
    report.assessment === 'Likely Human';

  const isWarning = 
    report.assessment === 'Needs Verification' || 
    report.assessment === 'Mixed / Heavily Edited';

  const isAlert = 
    report.assessment === 'Potentially Misleading' || 
    report.assessment === 'Potentially Manipulated' || 
    report.assessment === 'Likely Synthetic / AI-Generated' || 
    report.assessment === 'Potentially Synthetic Voice';

  // Primary Score to show (handle 0 correctly with !== undefined)
  const isTextMode = report.mode === 'text' || report.aiLikelihood !== undefined;
  const primaryScore = 
    isTextMode ? (report.aiLikelihood ?? 50) :
    report.truthScore !== undefined ? report.truthScore :
    report.manipulationScore !== undefined ? (100 - report.manipulationScore) :
    report.syntheticScore !== undefined ? (100 - report.syntheticScore) :
    report.confidence;

  const scoreLabel = isTextMode
    ? 'AI-Generation Likelihood'
    : report.truthScore !== undefined 
      ? 'Truth Score' 
      : report.manipulationScore !== undefined 
        ? 'Integrity Index' 
        : report.syntheticScore !== undefined
          ? 'Voice Naturalness Index'
          : 'Reliability Index';

  const handleCopyReport = () => {
    const text = `[TruthLens AI Forensic Report]\nTitle: ${report.title}\nAssessment: ${report.assessment}\nScore: ${primaryScore}/100\nConfidence: ${report.confidence}%\nSummary: ${report.summary}\nDate: ${new Date(report.timestamp).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Top Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBackToAnalyzer}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analyzer
        </button>

        <div className="flex items-center gap-3">
          {report.isDemo && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-medium">
              Demo Mode Sample
            </span>
          )}

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            Share Report
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Hero Assessment Banner & Score */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background ambient blur */}
        <div className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isReliable ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
        }`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          
          {/* Left: Assessment Verdict */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider">MODE: {report.mode}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(report.timestamp).toLocaleDateString()}
              </span>
              <span>·</span>
              <span>ID: {report.id.slice(0, 10)}</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {report.title}
              </h1>
              {report.inputPreview && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic font-serif">
                  "{report.inputPreview}"
                </p>
              )}
            </div>

            {/* Assessment Badge */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black tracking-wide border shadow-lg ${
                isReliable
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-emerald-950/30'
                  : isWarning
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-950/30'
                    : 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-rose-950/30'
              }`}>
                {isReliable && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {isAlert && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                <span>{report.assessment}</span>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                Model Confidence: <strong className="text-white">{report.confidence}%</strong>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans pt-1">
              {report.summary}
            </p>
          </div>

          {/* Right: Truth Score Visual Meter */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 w-full sm:w-64 text-center space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {scoreLabel}
            </span>

            {/* Circular Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                  className="stroke-slate-800 fill-none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - (primaryScore / 100))}
                  strokeLinecap="round"
                  className={`fill-none transition-all duration-1000 ${
                    isReliable ? 'stroke-emerald-400' : isWarning ? 'stroke-amber-400' : 'stroke-rose-500'
                  }`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white font-mono">{primaryScore}</span>
                <span className="text-[10px] text-slate-400 uppercase">/ 100</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-tight">
              {isTextMode ? (
                <span><strong>AI-Generation Likelihood</strong> is an estimation based on stylistic and syntactic markers; it is not definitive proof of AI generation.</span>
              ) : (
                <span><strong>AI assessment score</strong> — represents model-estimated integrity, not absolute legal proof.</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Overview & Indicators
        </button>

        {report.claims && report.claims.length > 0 && (
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'claims'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Claim Breakdown ({report.claims.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Evidence & Verification
        </button>

        <button
          onClick={() => setActiveTab('discuss')}
          className={`pb-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'discuss'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Discuss With AI
        </button>
      </div>

      {/* TAB 1: OVERVIEW & FORENSIC INDICATORS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Risk Indicators Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Forensic Risk Indicators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.indicators.map((ind, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-2xl border transition-all ${
                    ind.status === 'pass'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                      : ind.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-800/40 text-slate-200'
                        : 'bg-rose-950/20 border-rose-800/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{ind.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      ind.status === 'pass'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ind.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {ind.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ind.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Visual Regions / Heatmap (for Image / Face-Swap) */}
          {report.mediaUrl && (report.mode === 'image' || report.mode === 'faceswap') && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Areas Requiring Forensic Review (Manipulation Map)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Transparently highlights localized pixel regions flagged during multimodal biometric inspection.
                  </p>
                </div>

                {/* Comparison Mode Toggle */}
                <button
                  onClick={() => setComparisonMode(!comparisonMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    comparisonMode 
                      ? 'bg-cyan-600 text-white border-cyan-500' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {comparisonMode ? 'Showing Original' : 'Enable Comparison Mode'}
                </button>
              </div>

              {/* Image with Interactive Review Bounding Boxes */}
              <div className="max-h-96 mx-auto rounded-xl overflow-hidden bg-black/60 flex items-center justify-center border border-slate-800 p-2">
                <div className="relative inline-block max-h-96 max-w-full">
                  <img
                    src={report.mediaUrl}
                    alt="Analyzed Media"
                    className="max-h-96 w-auto max-w-full object-contain rounded block"
                  />

                  {/* Overlay regions if comparison mode is false */}
                  {!comparisonMode && report.reviewRegions && report.reviewRegions.map((region, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedRegion(region)}
                      className={`absolute cursor-pointer border-2 transition-all rounded ${
                        region.severity === 'high'
                          ? 'border-rose-500 bg-rose-500/25 hover:bg-rose-500/40'
                          : 'border-amber-400 bg-amber-400/25 hover:bg-amber-400/40'
                      }`}
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,
                      }}
                      title={region.label}
                    >
                      <span className="absolute -top-6 left-0 text-[10px] px-1.5 py-0.5 rounded bg-slate-900/90 text-white font-mono border border-slate-700 whitespace-nowrap shadow z-10">
                        #{idx + 1}: {region.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Region info box */}
              {selectedRegion && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">Region Flagged: </span>
                    <span className="text-slate-300">{selectedRegion.label}</span>
                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      selectedRegion.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {selectedRegion.severity} severity
                    </span>
                  </div>
                  <button onClick={() => setSelectedRegion(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Video Timeline (for Video & Dubbing mode) */}
          {report.timeline && report.timeline.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Audio-Visual & Temporal Sequence Timeline
              </h3>
              <div className="space-y-3">
                {report.timeline.map((event, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 text-xs">
                    <div className="font-mono text-cyan-400 font-bold shrink-0 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {event.time}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          event.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-slate-300 pt-1">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Transcript (if audio mode) */}
          {report.transcript && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Verbatim Audio Transcript (Gemini 3.5 Transcribe)
              </span>
              <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono leading-relaxed">
                "{report.transcript}"
              </p>
            </div>
          )}

          {/* Detected Evidence vs AI Inference (Honest scientific separation) */}
          {(report.detectedEvidence || report.aiInference) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Detected Evidence */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Observable Detected Evidence (Physical / Pixel)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.detectedEvidence?.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{ev}</span>
                    </li>
                  )) || <li className="text-slate-500 italic">No overt anomalies directly recorded.</li>}
                </ul>
              </div>

              {/* AI Inference */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  AI Model Deductive Inference (Hypothesis)
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.aiInference?.map((inf, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{inf}</span>
                    </li>
                  )) || <li className="text-slate-500 italic">No secondary generative hypotheses formed.</li>}
                </ul>
              </div>

            </div>
          )}

          {/* Explainable AI Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-800/50 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Explainable AI: Why did the AI reach this assessment?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {report.explainableAI || 'The assessment was formulated by synthesizing multimodal lexical, acoustic, or visual signals against verified journalistic standards.'}
            </p>
          </div>

          {/* Forensic Limitations & Methodology Caveat */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Info className="w-4 h-4 text-cyan-400" />
              Limitations & Forensic Boundaries
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {report.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* TAB 2: CLAIM BREAKDOWN */}
      {activeTab === 'claims' && report.claims && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Claim-by-Claim Forensic Evaluation
            </h3>
            <span className="text-xs text-slate-400">
              {report.claims.length} claims extracted from submitted text
            </span>
          </div>

          <div className="space-y-3">
            {report.claims.map((claim, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-400 font-mono">CLAIM #{idx + 1}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    claim.assessment === 'Likely Reliable' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : claim.assessment === 'Needs Verification'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {claim.assessment}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white">
                  "{claim.claim}"
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-400">Reasoning / Finding:</span>
                    <p className="text-slate-300">{claim.reason}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400">Verification Suggestion:</span>
                    <p className="text-slate-300">{claim.verificationSteps}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE & VERIFICATION */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Evidence & Verification Registry
            </h3>
            <p className="text-xs text-slate-400">
              Grounded evidence cross-referenced against institutional records, official agencies, or academic repositories.
            </p>
          </div>

          {/* Evidence Cards */}
          {report.evidence && report.evidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.evidence.map((ev, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">{ev.source}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ev.type === 'supporting'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ev.type === 'contradicting'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                    }`}>
                      {ev.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{ev.headline}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ev.finding}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-200">External Web Browsing Limited</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No real-time external search indexing was attached to this specific run. The AI did not fabricate sources and recommends checking the practical verification steps below.
              </p>
            </div>
          )}

          {/* Actionable Verification Steps */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Recommended Practical Verification Steps
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              {report.verificationSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISCUSS WITH AI */}
      {activeTab === 'discuss' && (
        <DiscussWithAI contextReport={report} />
      )}

      {/* Share Report Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Share Forensic Report</h3>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
              <div className="text-cyan-400 font-bold">[TruthLens AI Verification Report]</div>
              <div>Title: {report.title}</div>
              <div>Assessment: {report.assessment}</div>
              <div>Truth Score: {primaryScore}/100 (Confidence: {report.confidence}%)</div>
              <div>Summary: {report.summary}</div>
              <div className="text-slate-500 pt-1">Timestamp: {new Date(report.timestamp).toUTCString()}</div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleCopyReport}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? 'Copied to Clipboard!' : 'Copy Formatted Report'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
