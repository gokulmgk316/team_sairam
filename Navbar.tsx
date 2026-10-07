import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  History, 
  Info, 
  Search, 
  Menu, 
  X, 
  Layers, 
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { SampleCase } from '../types';
import { SAMPLE_CASES } from '../data/sampleCases';

interface NavbarProps {
  activeView: 'home' | 'analyzer' | 'history' | 'about';
  setActiveView: (view: 'home' | 'analyzer' | 'history' | 'about') => void;
  onSelectSample: (sample: SampleCase) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeView, 
  setActiveView,
  onSelectSample
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleNavClick = (view: 'home' | 'analyzer' | 'history' | 'about') => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setActiveView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-md shadow-cyan-900/30 border border-cyan-400/30 group-hover:border-cyan-400 transition-all">
              <ShieldCheck className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  Truth<span className="text-cyan-400">Lens</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Digital Forensics & Verification</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'home' 
                  ? 'bg-slate-800 text-cyan-400 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('analyzer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'analyzer' 
                  ? 'bg-slate-800 text-cyan-400 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Analyzer
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              How It Works
            </button>

            <button
              onClick={() => handleNavClick('history')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'history' 
                  ? 'bg-slate-800 text-cyan-400 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'about' 
                  ? 'bg-slate-800 text-cyan-400 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              About
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Demo Cases Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition-colors"
                title="Load pre-configured demo cases"
              >
                <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                Demo Cases
              </button>

              {demoMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/50 py-2 z-50"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pre-configured Hackathon Demos
                  </div>
                  {SAMPLE_CASES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        onSelectSample(sample);
                        setDemoMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 flex flex-col gap-0.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{sample.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                          {sample.mode}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{sample.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Action Button: Analyze Now */}
            <button
              onClick={() => handleNavClick('analyzer')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-950/50 transition-all transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              Analyze Now
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('analyzer')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 text-white"
            >
              Analyze
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => handleNavClick('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('analyzer')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-cyan-400 hover:bg-slate-800"
          >
            TruthLens Analyzer
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('history')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Analysis History
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            About & Limitations
          </button>

          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-semibold px-3 mb-1">Load Demo Case:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_CASES.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSample(s);
                    setMobileMenuOpen(false);
                  }}
                  className="px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white text-left truncate"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
