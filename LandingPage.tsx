import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  UserCheck, 
  Film, 
  MessageSquareQuote, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Eye,
  Sliders,
  Terminal,
  Cpu,
  Fingerprint,
  Radio,
  ExternalLink
} from 'lucide-react';
import { AnalysisMode, SampleCase } from '../types';
import { SAMPLE_CASES } from '../data/sampleCases';

interface LandingPageProps {
  onStartAnalysis: (mode?: AnalysisMode) => void;
  onSelectSample: (sample: SampleCase) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartAnalysis, 
  onSelectSample 
}) => {
  // Dynamic scanning simulator in Hero
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 4);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      mode: 'news' as AnalysisMode,
      icon: FileText,
      title: 'Fake News Detection',
      tag: 'Text & Claims',
      desc: 'Examines internal contradictions, sensational rhetoric, unsourced claims, and cross-references verified institutional fact databases.',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'group-hover:border-cyan-500/50',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      mode: 'text' as AnalysisMode,
      icon: Sparkles,
      title: 'AI-Generated Text Detection',
      tag: 'Stylometry & Perplexity',
      desc: 'Estimates AI-generation likelihood through syntactic burstiness, perplexity variance, and uniform transition formulas.',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'group-hover:border-pink-500/50',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    },
    {
      mode: 'image' as AnalysisMode,
      icon: ImageIcon,
      title: 'Image Manipulation Detection',
      tag: 'Pixel & Lighting Forensics',
      desc: 'Pinpoints inconsistent specular highlights, high-frequency noise drops, and clone-stamp interpolation anomalies.',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'group-hover:border-amber-500/50',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      mode: 'faceswap' as AnalysisMode,
      icon: UserCheck,
      title: 'Face-Swap & Deepfake Detection',
      tag: 'Biometric Boundaries',
      desc: 'Detects facial mesh blending seams, jawline feathering halos, and mismatched skin diffusion gradients.',
      color: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'group-hover:border-emerald-500/50',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      mode: 'video' as AnalysisMode,
      icon: Video,
      title: 'Video Deepfake & Temporal Forensics',
      tag: 'Inter-frame Consistency',
      desc: 'Performs multi-stage frame analysis tracking facial landmark stability, blink cadence, and optical flow continuity.',
      color: 'from-indigo-500/20 to-blue-500/20',
      borderColor: 'group-hover:border-indigo-500/50',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      mode: 'audio' as AnalysisMode,
      icon: Mic,
      title: 'Voice Deepfake & Audio Synthesis',
      tag: 'Acoustics & Vocoder Signatures',
      desc: 'Identifies synthetic vocoder phase noise, robotic pitch modulation, and absent physiological breath cues.',
      color: 'from-rose-500/20 to-red-500/20',
      borderColor: 'group-hover:border-rose-500/50',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    {
      mode: 'dubbing' as AnalysisMode,
      icon: Film,
      title: 'Dubbing & Lip-Sync Analysis',
      tag: 'Phoneme-Viseme Timing',
      desc: 'Evaluates temporal alignment between spoken audio envelopes and mouth movement along an interactive timeline.',
      color: 'from-cyan-500/20 to-teal-500/20',
      borderColor: 'group-hover:border-teal-500/50',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    },
    {
      mode: 'news' as AnalysisMode,
      icon: MessageSquareQuote,
      title: 'Interactive AI Explanation & Discussion',
      tag: 'Grounded Reasoning',
      desc: 'Ask conversational questions on every report to understand specific warning signs, missing evidence, and verification steps.',
      color: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'group-hover:border-violet-500/50',
      badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    }
  ];

  const misinfoVectors = [
    { title: 'Fake Articles', desc: 'Fabricated news stories posing as reputable journalism to sway opinions or generate ad clicks.', icon: FileText },
    { title: 'AI-Generated Text', desc: 'Synthetic automated content spamming social platforms and masquerading as human expertise.', icon: Sparkles },
    { title: 'Manipulated Images', desc: 'Digitally altered photographs splicing subjects into false contexts or protests.', icon: ImageIcon },
    { title: 'Deepfake Videos', desc: 'High-fidelity video impersonations depicting public figures uttering fabricated statements.', icon: Video },
    { title: 'Face Swaps', desc: 'Biometric facial overlays transplanted onto body doubles to falsify event attendance.', icon: UserCheck },
    { title: 'Synthetic Voices', desc: 'Cloned voice memos used in urgent CEO impersonation fraud or political disinformation.', icon: Radio },
    { title: 'Manipulated Audio', desc: 'Spliced recordings and selectively clipped soundbites taken completely out of original context.', icon: Mic },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-purple-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen Forensic Verification Engine</span>
              <span className="text-slate-500">|</span>
              <span className="text-cyan-400 font-semibold">Gemini 3.8 Multi-Signal</span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              See Beyond the Content.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Discover the Truth.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              AI-powered detection for fake news, deepfakes, manipulated media, and synthetic content.
              Unmask synthetic manipulation with explainable forensic signals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onStartAnalysis('news')}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-900/40 transition-all transform active:scale-95 text-base cursor-pointer"
              >
                <Search className="w-5 h-5" />
                Analyze Content
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 transition-all text-base cursor-pointer"
              >
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                Explore How It Works
              </button>
            </div>

            {/* Fast Demo Pill Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-400">Quick Hackathon Demos:</span>
              {SAMPLE_CASES.slice(0, 4).map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                >
                  {sample.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Hero Visual Representation: Forensics Scanner Card */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
              
              {/* Terminal / Scanner Header Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    TruthLens_Core_Forensic_Scanner_v3.8
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    ENGINE ACTIVE
                  </span>
                </div>
              </div>

              {/* Showcase Grid: News Scan vs Media Scan */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left: Content Being Analyzed */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      INPUT: BREAKING_REPORT_SOURCE_092.TXT
                    </span>
                    <span className="text-cyan-400">MULTIMODAL SCAN</span>
                  </div>

                  {/* Simulated Content Box with scanning laser line */}
                  <div className="relative p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm font-sans space-y-2 overflow-hidden">
                    {/* Animated scan beam */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse" 
                         style={{ top: `${(scanStep * 28) + 12}%`, transition: 'top 0.8s ease-in-out' }} />

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/50">
                        FLAGGED CLAIM
                      </span>
                      <span className="text-xs text-slate-400">Anonymous source · Extreme hyperbole</span>
                    </div>

                    <h4 className="font-semibold text-slate-200">
                      "Global regulatory bodies enforce secret blanket ban on miracle longevity crystal..."
                    </h4>
                    
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Whistleblower asserts 10,000 subjects achieved full reversal within 48 hours without verifiable dataset or registered institutional clinical oversight.
                    </p>

                    {/* Detected signals badge chips */}
                    <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        Sensational Language: <strong className="text-rose-400">High</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        Author Attribution: <strong className="text-amber-400">Missing</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        Peer Citation: <strong className="text-rose-400">0 Found</strong>
                      </span>
                    </div>
                  </div>

                  {/* Forensics Pipeline Steps */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    {[
                      { step: '1. Ingest', status: 'Done', color: 'text-emerald-400 border-emerald-500/30' },
                      { step: '2. Claims', status: 'Extracted', color: 'text-emerald-400 border-emerald-500/30' },
                      { step: '3. Signals', status: 'Evaluated', color: 'text-cyan-400 border-cyan-500/30' },
                      { step: '4. Report', status: 'Generated', color: 'text-indigo-400 border-indigo-500/30' },
                    ].map((s, idx) => (
                      <div key={idx} className={`p-2 rounded-lg bg-slate-950/60 border ${s.color} text-xs`}>
                        <div className="font-bold text-slate-200">{s.step}</div>
                        <div className="text-[10px] text-slate-400">{s.status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Forensic Assessment Gauge & Indicators */}
                <div className="md:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Assessment Indicator
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Potentially Misleading
                    </span>
                  </div>

                  {/* Circular Score Visual Representation */}
                  <div className="flex items-center gap-4 py-1">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-rose-500/30 bg-rose-950/20">
                      <span className="text-2xl font-black text-rose-400 font-mono">18</span>
                      <span className="absolute -bottom-2 text-[9px] px-1.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        Score / 100
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-200">High Risk of Disinformation</div>
                      <p className="text-xs text-slate-400 leading-snug">
                        AI evaluated linguistic patterns, absent citations, and conspiratorial framing.
                      </p>
                    </div>
                  </div>

                  {/* Mini breakdown lines */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Source Credibility</span>
                      <span className="text-rose-400 font-semibold">Low (Unverifiable)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[22%]" />
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Biometric / Fact Plausibility</span>
                      <span className="text-amber-400 font-semibold">Contradictory</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[38%]" />
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSample(SAMPLE_CASES[0])}
                    className="w-full py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Complete Sample Report
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 2: Why TruthLens AI? (The 7 Misinformation Vectors) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Evolving Digital Threats
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why TruthLens AI?
          </h2>
          <p className="text-slate-400 text-base">
            Misinformation no longer appears solely as typos or suspicious email chains.
            Generative AI has weaponized multimedia deception across seven distinct vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {misinfoVectors.map((vector, i) => {
            const Icon = vector.icon;
            return (
              <div 
                key={i} 
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all space-y-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">{vector.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{vector.desc}</p>
              </div>
            );
          })}
          {/* Summary Impact Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-indigo-950/40 border border-cyan-800/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 uppercase tracking-wide">
                <Fingerprint className="w-3.5 h-3.5" />
                Forensic Stance
              </div>
              <h3 className="text-base font-bold text-white mt-1">Multi-Signal Verification</h3>
              <p className="text-xs text-slate-300 mt-1">
                TruthLens synthesizes multimodal checks across textual rhetoric, acoustic cues, and biometric continuity.
              </p>
            </div>
            <button
              onClick={() => onStartAnalysis('news')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              Start analyzing now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Features (Every Detection Capability) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Detection Capabilities
          </h2>
          <p className="text-slate-400 text-base">
            Professional-grade forensic tools designed for journalists, researchers, fact-checkers, and everyday digital citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`group relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 ${feat.borderColor} transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-cyan-950/20`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-800/80 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${feat.badgeColor}`}>
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <button
                  onClick={() => onStartAnalysis(feat.mode)}
                  className="pt-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Launch {feat.title.split(' ')[0]} Analyzer
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: How It Works (4-Step Process) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Scientific Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How TruthLens Works
          </h2>
          <p className="text-slate-400 text-base">
            From input ingestion to explainable forensic findings in four transparent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Upload or Paste Content',
              desc: 'Submit text, article headlines, URLs, images, video clips, or audio files into the specialized analyzer workspace.',
              icon: Search
            },
            {
              step: '02',
              title: 'AI Analyzes Content',
              desc: 'Gemini 3.8 processes the input using tailored forensic prompts designed to isolate observable facts from speculative rhetoric.',
              icon: Cpu
            },
            {
              step: '03',
              title: 'Multiple Signals Evaluated',
              desc: 'Biometrics, lighting vectors, syntactic burstiness, acoustic respiration, and consistency markers are cross-checked.',
              icon: Sliders
            },
            {
              step: '04',
              title: 'Understandable Report',
              desc: 'Receive an honest assessment score, claim-by-claim breakdown, visual review regions, and verified verification steps.',
              icon: CheckCircle2
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-cyan-500/40 font-mono">{item.step}</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 5: Trust & Transparency (Critical Ethical AI Disclosure) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-cyan-800/40 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Trust & Transparency Commitment</h3>
              <p className="text-xs text-cyan-300">Explainable AI · Probabilistic Indicators · Human Fact-Checking</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Indicators, Not Absolute Proof
              </h4>
              <p>
                TruthLens AI assessments are diagnostic likelihood indicators, never legally binding judicial conclusions. AI models estimate probability based on patterns; they do not replace primary source investigation or verified forensic laboratories.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Separation of Evidence vs Inference
              </h4>
              <p>
                Every report explicitly separates directly observable physical/pixel evidence (e.g. shadow angle mismatch, absent breath pauses) from AI inferential hypotheses, empowering you to draw reasoned conclusions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 gap-4">
            <span className="text-xs text-slate-400">
              Always verify critical news with recognized fact-checking networks (IFCN, Reuters Fact Check, AP News).
            </span>
            <button
              onClick={() => onStartAnalysis('news')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              Start Your First Verification
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
