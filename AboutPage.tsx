import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  onStartAnalysis: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onStartAnalysis }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
          Digital Forensics & Verification Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About TruthLens AI
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Empowering citizens, journalists, and researchers with explainable multi-signal AI verification against digital deception.
        </p>
      </div>

      {/* The Problem & The Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* The Problem */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">The Misinformation Crisis</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The proliferation of generative diffusion models, neural audio synthesizers, and automated LLM spam has lowered the barrier to producing plausible disinformation to near zero. Citizens and newsrooms face an unprecedented deluge of synthetic media designed to mislead, scam, or undermine institutional trust.
          </p>
        </div>

        {/* Our Solution */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">The Multi-Signal Approach</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            TruthLens AI combines Google Gemini 3.8's multimodal reasoning with classical digital forensics algorithms. Instead of returning a single mysterious label, we analyze lighting vectors, acoustic respiration, sentence burstiness, and factual corroboration to deliver transparent, explainable reports.
          </p>
        </div>

      </div>

      {/* Core Principles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Our Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Explainable AI Over Black Boxes',
              desc: 'We reject binary labels without justification. Every assessment explains the specific rhetorical flaws, lighting inconsistencies, or vocoder artifacts that led to the verdict.',
              icon: Cpu,
            },
            {
              title: 'Separation of Fact and Inference',
              desc: 'We clearly differentiate between directly observable physical/pixel anomalies and probabilistic hypotheses formed by AI reasoning.',
              icon: FileCheck,
            },
            {
              title: 'Human-in-the-Loop Fact Checking',
              desc: 'AI does not replace journalists. TruthLens accelerates forensic triaging and directs human investigators to primary documentation and reliable registries.',
              icon: Compass,
            },
            {
              title: 'Privacy & Data Integrity',
              desc: 'Analysis runs securely server-side without permanently indexing private uploads or training foundation models on user submissions.',
              icon: Lock,
            },
          ].map((principle, idx) => {
            const Icon = principle.icon;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{principle.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{principle.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Limitations & Ethical AI Disclaimer */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <HelpCircle className="w-4 h-4" />
          Mandatory Forensic Disclaimer & Model Limitations
        </div>
        <p className="leading-relaxed">
          <strong>1. Diagnostic Likelihood:</strong> TruthLens AI reports represent diagnostic probabilities and heuristic evaluations. They do not constitute legally binding proof of authenticity or fraud.
        </p>
        <p className="leading-relaxed">
          <strong>2. False Positives / Negatives:</strong> Highly polished, formal human writing can trigger elevated AI text likelihood scores. Conversely, sophisticated adversarial noise can occasionally mask deepfakes. Always corroborate critical media with verified primary institutions.
        </p>
        <p className="leading-relaxed">
          <strong>3. Ethical Usage:</strong> This tool is engineered strictly for educational, defensive, and fact-checking purposes to foster a more discerning digital public sphere.
        </p>

        <div className="pt-2">
          <button
            onClick={onStartAnalysis}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            Launch TruthLens Analyzer
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
