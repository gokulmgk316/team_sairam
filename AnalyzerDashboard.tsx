import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Image as ImageIcon, 
  UserCheck, 
  Video, 
  Mic, 
  Film, 
  UploadCloud, 
  Link as LinkIcon, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Play, 
  Square, 
  RefreshCw,
  Eye,
  Info,
  Layers,
  Sparkle,
  Search
} from 'lucide-react';
import { AnalysisMode, AnalysisReport, SampleCase } from '../../types';
import { SAMPLE_CASES } from '../../data/sampleCases';

interface AnalyzerDashboardProps {
  initialMode?: AnalysisMode;
  onAnalysisComplete: (report: AnalysisReport) => void;
  selectedSample?: SampleCase | null;
  onClearSample?: () => void;
}

export const AnalyzerDashboard: React.FC<AnalyzerDashboardProps> = ({
  initialMode = 'news',
  onAnalysisComplete,
  selectedSample,
  onClearSample,
}) => {
  const [activeMode, setActiveMode] = useState<AnalysisMode>(initialMode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const ANALYSIS_STEPS = [
    { label: 'Uploading', desc: 'Preparing content payload' },
    { label: 'Processing', desc: 'Signal & feature extraction' },
    { label: 'Gemini Analysis', desc: 'AI multimodal forensic reasoning' },
    { label: 'Generating Report', desc: 'Compiling structured report' },
  ] as const;

  // Form states: News
  const [newsHeadline, setNewsHeadline] = useState('');
  const [newsText, setNewsText] = useState('');
  const [newsUrl, setNewsUrl] = useState('');

  // Form states: Text
  const [textContent, setTextContent] = useState('');

  // Form states: Image / FaceSwap
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form states: Video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Form states: Audio
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Apply selected sample if passed
  React.useEffect(() => {
    if (selectedSample) {
      setActiveMode(selectedSample.mode);
      if (selectedSample.mode === 'news') {
        setNewsHeadline(selectedSample.data.headline || '');
        setNewsText(selectedSample.data.articleText || '');
        setNewsUrl(selectedSample.data.sourceUrl || '');
      } else if (selectedSample.mode === 'text') {
        setTextContent(selectedSample.data.text || '');
      } else if (selectedSample.mode === 'image' || selectedSample.mode === 'faceswap') {
        setImagePreview(selectedSample.data.imageUrl || null);
      } else if (selectedSample.mode === 'video' || selectedSample.mode === 'dubbing') {
        // demo sample video
        setVideoPreview('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      } else if (selectedSample.mode === 'audio') {
        setAudioPreview('sample_audio_memo');
      }
    }
  }, [selectedSample]);

  // Helper to downscale and optimize uploaded images for fast, resilient transmission
  const compressImageForAnalysis = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1280;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Resilient fetch wrapper with timeout, auto-retry, and clear error reporting
  const safeAnalyzeFetch = async (url: string, body: any, maxRetries = 1): Promise<any> => {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          let errMsg = `Server returned status ${res.status}`;
          try {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          } catch {
            // text response fallback
          }
          throw new Error(errMsg);
        }

        return await res.json();
      } catch (err: any) {
        attempt++;
        if (attempt > maxRetries) {
          if (err.name === 'AbortError') {
            throw new Error('Analysis timed out. The server or AI model is taking longer than expected. Please retry.');
          }
          if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
            throw new Error('Connection to the analysis server was interrupted. If the cloud container is waking up from idle, please wait 3-5 seconds and click "Run Forensics Scan" again.');
          }
          throw err;
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  };

  // Handle Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file (JPEG, PNG, WebP).');
      return;
    }
    onClearSample?.();
    setImageFile(file);
    setErrorMessage(null);

    try {
      const optimized = await compressImageForAnalysis(file);
      setImagePreview(optimized);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to extract keyframe screenshots from a video source for AI inspection
  const extractVideoKeyframes = async (videoSource: string | File): Promise<string[]> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        let objectUrl: string | null = null;
        if (typeof videoSource === 'string') {
          video.src = videoSource;
        } else {
          objectUrl = URL.createObjectURL(videoSource);
          video.src = objectUrl;
        }

        const cleanUp = () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        };

        const frames: string[] = [];
        const timer = setTimeout(() => {
          cleanUp();
          resolve(frames);
        }, 4000);

        video.onloadeddata = async () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth || 640, 640);
            canvas.height = Math.min(video.videoHeight || 360, 360);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              cleanUp();
              clearTimeout(timer);
              return resolve([]);
            }

            const duration = Math.max(video.duration || 3, 1);
            const times = [0.25 * duration, 0.5 * duration, 0.75 * duration];

            for (const t of times) {
              video.currentTime = t;
              await new Promise((res) => {
                const onSeeked = () => {
                  video.removeEventListener('seeked', onSeeked);
                  try {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg', 0.65));
                  } catch {
                    // cross origin or codec restriction
                  }
                  res(true);
                };
                video.addEventListener('seeked', onSeeked);
              });
            }
            cleanUp();
            clearTimeout(timer);
            resolve(frames);
          } catch {
            cleanUp();
            clearTimeout(timer);
            resolve([]);
          }
        };

        video.onerror = () => {
          cleanUp();
          clearTimeout(timer);
          resolve([]);
        };
      } catch {
        resolve([]);
      }
    });
  };

  // Handle Video Upload
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Please upload a video file (MP4, WebM).');
      return;
    }
    onClearSample?.();
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Handle Audio Upload
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please upload an audio file (MP3, WAV, WebM).');
      return;
    }
    onClearSample?.();
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Handle Microphone Recording
  const startRecording = async () => {
    try {
      onClearSample?.();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioPreview(url);
        const file = new File([audioBlob], 'recorded_speech.webm', { type: 'audio/webm' });
        setAudioFile(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMessage('Microphone access denied or unsupported. Please upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Load a sample directly
  const handleLoadSample = (sample: SampleCase) => {
    setActiveMode(sample.mode);
    if (sample.mode === 'news') {
      setNewsHeadline(sample.data.headline || '');
      setNewsText(sample.data.articleText || '');
      setNewsUrl(sample.data.sourceUrl || '');
    } else if (sample.mode === 'text') {
      setTextContent(sample.data.text || '');
    } else if (sample.mode === 'image' || sample.mode === 'faceswap') {
      setImagePreview(sample.data.imageUrl || null);
    } else if (sample.mode === 'video' || sample.mode === 'dubbing') {
      setVideoPreview('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    } else if (sample.mode === 'audio') {
      setAudioPreview('sample_audio_memo');
    }
    setErrorMessage(null);
  };

  // Main Submit Analysis
  const handleAnalyze = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setStageProgress(15);
    setCurrentStage('Ingesting content and validating digital signatures...');

    try {
      // Check if this is an instant demo match
      if (selectedSample && selectedSample.sampleReport) {
        // simulate realistic stages
        setCurrentStage('Extracting multi-signal forensic vectors...');
        setStageProgress(45);
        await new Promise((r) => setTimeout(r, 600));

        setCurrentStage('Cross-referencing factual claims and biometrics...');
        setStageProgress(80);
        await new Promise((r) => setTimeout(r, 600));

        const completedReport: AnalysisReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: selectedSample.mode,
          title: selectedSample.title,
          inputPreview: selectedSample.data.headline || selectedSample.data.text?.slice(0, 100) || 'Analyzed Media Content',
          mediaUrl: imagePreview || videoPreview || undefined,
          assessment: selectedSample.sampleReport.assessment || 'Needs Verification',
          confidence: selectedSample.sampleReport.confidence || 80,
          truthScore: selectedSample.sampleReport.truthScore,
          manipulationScore: selectedSample.sampleReport.manipulationScore,
          aiLikelihood: selectedSample.sampleReport.aiLikelihood,
          syntheticScore: selectedSample.sampleReport.syntheticScore,
          summary: selectedSample.sampleReport.summary || '',
          claims: selectedSample.sampleReport.claims,
          indicators: selectedSample.sampleReport.indicators || [],
          detectedEvidence: selectedSample.sampleReport.detectedEvidence,
          aiInference: selectedSample.sampleReport.aiInference,
          evidence: selectedSample.sampleReport.evidence,
          reviewRegions: selectedSample.sampleReport.reviewRegions,
          timeline: selectedSample.sampleReport.timeline,
          patterns: selectedSample.sampleReport.patterns,
          transcript: selectedSample.sampleReport.transcript,
          verificationSteps: selectedSample.sampleReport.verificationSteps || [],
          limitations: selectedSample.sampleReport.limitations || [],
          explainableAI: selectedSample.sampleReport.explainableAI || '',
          isDemo: true,
        };

        saveToHistory(completedReport);
        onAnalysisComplete(completedReport);
        setIsAnalyzing(false);
        return;
      }

      // Live Server API Calls
      if (activeMode === 'news') {
        if (!newsText.trim() && !newsHeadline.trim()) {
          throw new Error('Please enter either a headline or article text to analyze.');
        }

        setCurrentStage('Analyzing rhetorical structure, claims, and contradictions...');
        setStageProgress(50);

        const data = await safeAnalyzeFetch('/api/analyze/news', {
          headline: newsHeadline,
          articleText: newsText,
          sourceUrl: newsUrl,
        });

        setStageProgress(90);
        setCurrentStage('Compiling verification indicators and evidence report...');

        const finalReport: AnalysisReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: 'news',
          title: newsHeadline || 'Submitted News Content',
          inputPreview: newsText ? newsText.slice(0, 160) + '...' : newsHeadline,
          assessment: data.assessment,
          confidence: data.confidence,
          truthScore: data.truthScore ?? 50,
          summary: data.summary,
          claims: data.claims,
          indicators: data.indicators || [],
          evidence: data.evidence,
          verificationSteps: data.verificationSteps || [],
          limitations: data.limitations || [],
          explainableAI: data.explainableAI || '',
        };

        saveToHistory(finalReport);
        onAnalysisComplete(finalReport);

      } else if (activeMode === 'text') {
        if (!textContent.trim() || textContent.trim().length < 20) {
          throw new Error('Text must be at least 20 characters for meaningful stylometric evaluation.');
        }

        setCurrentStage('Evaluating perplexity, sentence burstiness, and formulaic markers...');
        setStageProgress(60);

        const data = await safeAnalyzeFetch('/api/analyze/text', { text: textContent });
        setStageProgress(90);

        const finalReport: AnalysisReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: 'text',
          title: 'AI-Generated Text Analysis',
          inputPreview: textContent.slice(0, 160) + '...',
          assessment: data.assessment,
          confidence: data.confidence,
          aiLikelihood: data.aiLikelihood,
          summary: data.summary,
          indicators: data.indicators || [],
          patterns: data.patterns || [],
          verificationSteps: data.verificationSteps || [],
          limitations: data.limitations || [],
          explainableAI: data.explainableAI || '',
        };

        saveToHistory(finalReport);
        onAnalysisComplete(finalReport);

      } else if (activeMode === 'image' || activeMode === 'faceswap') {
        if (!imagePreview) {
          throw new Error('Please upload an image or select a sample image to analyze.');
        }

        setCurrentStage('Scanning pixel sensor noise, lighting gradients, and boundary seams...');
        setStageProgress(50);

        const data = await safeAnalyzeFetch('/api/analyze/image', {
          imageBase64: imagePreview,
          mode: activeMode,
          metadata: {
            name: imageFile?.name || 'uploaded_image',
            type: imageFile?.type || 'image/jpeg',
            size: imageFile?.size ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Unknown',
          },
        });

        setStageProgress(90);
        setCurrentStage('Highlighting regions requiring human verification...');

        const finalReport: AnalysisReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: activeMode,
          title: activeMode === 'faceswap' ? 'Face-Swap & Deepfake Biometric Scan' : 'Digital Image Forensic Analysis',
          inputPreview: imageFile?.name || 'Image submission',
          mediaUrl: imagePreview,
          assessment: data.assessment,
          confidence: data.confidence,
          manipulationScore: data.manipulationScore,
          summary: data.summary,
          detectedEvidence: data.detectedEvidence,
          aiInference: data.aiInference,
          indicators: data.indicators || [],
          reviewRegions: data.reviewRegions || [],
          verificationSteps: data.verificationSteps || [],
          limitations: data.limitations || [],
          explainableAI: data.explainableAI || '',
        };

        saveToHistory(finalReport);
        onAnalysisComplete(finalReport);

      } else if (activeMode === 'video' || activeMode === 'dubbing') {
        if (!videoFile && !videoPreview) {
          throw new Error('Please select or upload a video clip to analyze.');
        }

        // 5-stage progress representation
        setCurrentStage('Uploading & Demuxing video stream...');
        setStageProgress(25);
        await new Promise((r) => setTimeout(r, 600));

        setCurrentStage('Extracting keyframes and facial landmarks...');
        setStageProgress(45);
        let extractedFrames: string[] = [];
        try {
          if (videoFile) {
            extractedFrames = await extractVideoKeyframes(videoFile);
          } else if (videoPreview) {
            extractedFrames = await extractVideoKeyframes(videoPreview);
          }
        } catch (kfErr) {
          console.warn('Keyframe extraction notice:', kfErr);
        }

        setCurrentStage('Evaluating temporal optical flow & phoneme-viseme alignment...');
        setStageProgress(70);

        const data = await safeAnalyzeFetch('/api/analyze/video', {
          videoName: videoFile?.name || 'demo_video.mp4',
          duration: '10s',
          mode: activeMode,
          frameImages: extractedFrames,
        });

        setStageProgress(95);

        const finalReport: AnalysisReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: activeMode,
          title: activeMode === 'dubbing' ? 'Lip-Sync & Video Dubbing Desync Scan' : 'Video Deepfake & Temporal Consistency Scan',
          inputPreview: videoFile?.name || 'Video clip analysis',
          mediaUrl: videoPreview || undefined,
          assessment: data.assessment,
          confidence: data.confidence,
          manipulationScore: data.manipulationScore,
          summary: data.summary,
          detectedEvidence: data.detectedEvidence,
          aiInference: data.aiInference,
          indicators: data.indicators || [],
          timeline: data.timeline || [],
          verificationSteps: data.verificationSteps || [],
          limitations: data.limitations || [],
          explainableAI: data.explainableAI || '',
        };

        saveToHistory(finalReport);
        onAnalysisComplete(finalReport);

      } else if (activeMode === 'audio') {
        if (!audioFile && !audioPreview) {
          throw new Error('Please record audio with your microphone or upload an audio file.');
        }

        setCurrentStage('Extracting acoustic spectral features & biological breath cues...');
        setStageProgress(40);

        let audioBase64 = '';
        if (audioFile) {
          audioBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(audioFile);
          });
        }

        setCurrentStage('Transcribing audio via Gemini 3.5 Transcribe & checking vocoder signatures...');
        setStageProgress(75);

        const data = await safeAnalyzeFetch('/api/analyze/audio', {
          audioBase64,
          fileName: audioFile?.name || 'recorded_speech.webm',
          audioName: audioFile?.name || 'recorded_speech.webm',
          mimeType: audioFile?.type || 'audio/webm',
        });

        setStageProgress(95);

        const finalReport: AnalysisReport = {
          id: `rep-${Date.now()}`,
          timestamp: new Date().toISOString(),
          mode: 'audio',
          title: 'Synthetic Voice Clone & Acoustic Forensics',
          inputPreview: audioFile?.name || 'Recorded voice audio clip',
          mediaUrl: audioPreview || undefined,
          assessment: data.assessment,
          confidence: data.confidence,
          syntheticScore: data.syntheticScore,
          transcript: data.transcript,
          summary: data.summary,
          detectedEvidence: data.detectedEvidence,
          aiInference: data.aiInference,
          indicators: data.indicators || [],
          verificationSteps: data.verificationSteps || [],
          limitations: data.limitations || [],
          explainableAI: data.explainableAI || '',
        };

        saveToHistory(finalReport);
        onAnalysisComplete(finalReport);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      let msg = err.message || 'An unexpected error occurred during analysis.';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        msg = 'Connection to the analysis server was interrupted. If the cloud container is waking up from idle, please wait 3-5 seconds and click "Run Forensics Scan" again.';
      }
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
      setStageProgress(0);
      setCurrentStage('');
    }
  };

  const saveToHistory = (report: AnalysisReport) => {
    try {
      const existing = localStorage.getItem('truthlens_history');
      const list = existing ? JSON.parse(existing) : [];
      const updated = [
        {
          id: report.id,
          timestamp: report.timestamp,
          mode: report.mode,
          title: report.title,
          assessment: report.assessment,
          score: report.truthScore ?? (100 - (report.manipulationScore ?? report.syntheticScore ?? report.aiLikelihood ?? 50)),
          report,
        },
        ...list.slice(0, 24),
      ];
      localStorage.setItem('truthlens_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const modeTabs = [
    { id: 'news' as AnalysisMode, label: 'News', icon: FileText, desc: 'Fake News & Claims' },
    { id: 'text' as AnalysisMode, label: 'Text', icon: Sparkles, desc: 'AI-Generated Writing' },
    { id: 'image' as AnalysisMode, label: 'Image', icon: ImageIcon, desc: 'Image Manipulation' },
    { id: 'faceswap' as AnalysisMode, label: 'Face-Swap', icon: UserCheck, desc: 'Facial Deepfakes' },
    { id: 'video' as AnalysisMode, label: 'Video', icon: Video, desc: 'Video Deepfake' },
    { id: 'audio' as AnalysisMode, label: 'Audio', icon: Mic, desc: 'Voice Deepfake' },
    { id: 'dubbing' as AnalysisMode, label: 'Dubbing', icon: Film, desc: 'Lip-Sync Mismatch' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header of Analyzer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              TruthLens Analyzer
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Select a media mode, enter or upload content, and evaluate with multi-signal forensic indicators.
          </p>
        </div>

        {/* Quick Demo Preloader Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Demo Cases:</span>
          <select 
            onChange={(e) => {
              const s = SAMPLE_CASES.find(c => c.id === e.target.value);
              if (s) handleLoadSample(s);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 hover:border-cyan-500 focus:outline-none focus:border-cyan-400"
            defaultValue=""
          >
            <option value="" disabled>Select Sample Case...</option>
            {SAMPLE_CASES.map(s => (
              <option key={s.id} value={s.id}>
                [{s.mode.toUpperCase()}] {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Sample banner if loaded */}
      {selectedSample && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-cyan-400" />
            <span>Loaded Demo Case: <strong>{selectedSample.title}</strong> ({selectedSample.tag})</span>
          </div>
          <button 
            onClick={onClearSample}
            className="text-[11px] underline text-cyan-300 hover:text-white"
          >
            Clear Sample
          </button>
        </div>
      )}

      {/* Mode Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {modeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMode(tab.id);
                setErrorMessage(null);
              }}
              className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-950/30'
                  : 'bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </div>
              <div className="mt-2">
                <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {tab.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Analyzer Input Workspace Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">

        {/* 1. NEWS MODE */}
        {activeMode === 'news' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Headline (Optional but recommended)
              </label>
              <input
                id="input-news-headline"
                type="text"
                value={newsHeadline}
                onChange={(e) => {
                  if (selectedSample) onClearSample?.();
                  setNewsHeadline(e.target.value);
                }}
                placeholder="e.g. Miracle Himalayan Compound Reverses Aging in 48 Hours..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                Source URL (Optional)
              </label>
              <input
                id="input-news-url"
                type="url"
                value={newsUrl}
                onChange={(e) => {
                  if (selectedSample) onClearSample?.();
                  setNewsUrl(e.target.value);
                }}
                placeholder="https://example.com/article/10294"
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Article Body / Content Claims
                </label>
                <span className="text-[11px] text-slate-400">
                  {newsText.length} characters
                </span>
              </div>
              <textarea
                id="input-news-text"
                rows={7}
                value={newsText}
                onChange={(e) => {
                  if (selectedSample) onClearSample?.();
                  setNewsText(e.target.value);
                }}
                placeholder="Paste the full article text, social media caption, or claim statements here for misinformation analysis..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors font-sans leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* 2. TEXT / AI GENERATED CONTENT MODE */}
        {activeMode === 'text' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Text to Analyze for AI Generation Likelihood
              </label>
              <span className="text-[11px] text-slate-400">
                {textContent.trim().split(/\s+/).filter(Boolean).length} words · {textContent.length} chars
              </span>
            </div>

            <textarea
              id="input-text-content"
              rows={8}
              value={textContent}
              onChange={(e) => {
                if (selectedSample) onClearSample?.();
                setTextContent(e.target.value);
              }}
              placeholder="Paste essays, articles, blog posts, or cover letters to estimate AI-generation likelihood through syntactic burstiness, predictability, and formulaic transitions..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
            />

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Methodology Notice:</strong> AI text detection is probabilistic. Highly polished or formal human academic writing can share statistical features with Large Language Models. Results represent "AI-generation likelihood", not absolute proof.
              </span>
            </div>
          </div>
        )}

        {/* 3. IMAGE & FACE-SWAP MODE */}
        {(activeMode === 'image' || activeMode === 'faceswap') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                {activeMode === 'faceswap' ? <UserCheck className="w-4 h-4 text-teal-400" /> : <ImageIcon className="w-4 h-4 text-amber-400" />}
                {activeMode === 'faceswap' ? 'Upload Face or Portrait for Deepfake / Swap Analysis' : 'Upload Image for Forensic Tampering & Diffusion Detection'}
              </label>
              {imagePreview && (
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Dropzone / Preview */}
            {!imagePreview ? (
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group">
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-cyan-400 transition-colors mb-2" />
                <span className="text-sm font-semibold text-slate-200">
                  Click to browse or drag & drop image
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Supports JPEG, PNG, WebP (Up to 25MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="relative max-h-80 overflow-hidden rounded-lg flex items-center justify-center bg-black/40">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-80 object-contain rounded"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-900/80 text-[11px] text-cyan-300 font-mono border border-slate-700">
                    Source: {imageFile?.name || 'Sample Image'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
                  <span>
                    Forensic Signals: Lighting Coherence, Sensor Noise Floor, Jaw Boundary Blending
                  </span>
                  <label className="text-cyan-400 hover:underline cursor-pointer">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. VIDEO & DUBBING MODE */}
        {(activeMode === 'video' || activeMode === 'dubbing') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                {activeMode === 'dubbing' ? <Film className="w-4 h-4 text-teal-400" /> : <Video className="w-4 h-4 text-indigo-400" />}
                {activeMode === 'dubbing' ? 'Upload Video for Lip-Sync & Dubbing Desync Analysis' : 'Upload Video for Temporal Deepfake Inspection'}
              </label>
              {videoPreview && (
                <button
                  onClick={() => {
                    setVideoPreview(null);
                    setVideoFile(null);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove Video
                </button>
              )}
            </div>

            {!videoPreview ? (
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group">
                <Video className="w-10 h-10 text-slate-400 group-hover:text-cyan-400 transition-colors mb-2" />
                <span className="text-sm font-semibold text-slate-200">
                  Select video or drag & drop clip
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Supports MP4, WebM (Recommended under 60 seconds)
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <video
                  src={videoPreview}
                  controls
                  className="max-h-72 w-full rounded-lg bg-black"
                />
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Multi-stage pipeline: Uploading → Keyframe Extraction → Facial Biometrics → Temporal Consistency</span>
                  <label className="text-cyan-400 hover:underline cursor-pointer">
                    Change Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. AUDIO MODE */}
        {activeMode === 'audio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-rose-400" />
                Voice Deepfake & Audio Synthesis Analysis
              </label>
              {audioPreview && (
                <button
                  onClick={() => {
                    setAudioPreview(null);
                    setAudioFile(null);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear Audio
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Upload Audio File */}
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group text-center">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 mb-2" />
                <span className="text-sm font-semibold text-slate-200">Upload Audio File</span>
                <span className="text-xs text-slate-500 mt-0.5">MP3, WAV, WebM, M4A</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                />
              </label>

              {/* Option B: Live Microphone Capture */}
              <div className="border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-950/50 text-center space-y-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isRecording ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  <Mic className="w-6 h-6" />
                </div>
                
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-lg shadow-rose-950/50"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 shadow-lg shadow-cyan-950/50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Record with Microphone
                  </button>
                )}
                <span className="text-[11px] text-slate-500">
                  {isRecording ? 'Recording audio stream... click stop when done' : 'Transcribe & analyze vocal cadence'}
                </span>
              </div>
            </div>

            {/* Audio Player Preview */}
            {audioPreview && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <audio controls src={audioPreview} className="w-full sm:w-80 h-9" />
                <span className="text-xs text-slate-400">
                  Ready for acoustic respiration & neural vocoder check
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Notification with Recovery Action */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Retry Analysis
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  if (activeMode === 'news') {
                    setNewsHeadline('Miracle Himalayan Compound Reverses Biological Aging in 48 Hours');
                    setNewsText('Researchers at an unaccredited private clinic in Geneva claim that a rare botanical compound harvested from the high Himalayas can reverse cellular senescence by up to 20 years within two days. The study has not yet been submitted to any peer-reviewed scientific journal.');
                  } else if (activeMode === 'text') {
                    setTextContent('Furthermore, it is undeniably paramount to acknowledge that advancements in modern technology have revolutionized our daily lives. In conclusion, one must inevitably contemplate the multifaceted implications of this paradigm shift across global societies.');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors cursor-pointer"
              >
                Load Sample Test Case
              </button>
            </div>
          </div>
        )}

        {/* Progress Display during Active Analysis */}
        {isAnalyzing && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-800/60 space-y-4 shadow-xl shadow-cyan-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Analysis Pipeline
              </span>
              <span className="font-mono text-xs text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/50">
                {stageProgress}% Complete
              </span>
            </div>

            {/* 4-Step Stepper: Uploading → Processing → Gemini Analysis → Generating Report */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {ANALYSIS_STEPS.map((step, idx) => {
                const isCompleted = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-center gap-2.5 ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                        : isCurrent
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-100 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                            ? 'bg-cyan-400 text-slate-950 ring-2 ring-cyan-300/40 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-white">{step.label}</div>
                      <div className="text-[10px] opacity-75 truncate">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {currentStage || 'Evaluating content signals...'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out"
                  style={{ width: `${stageProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Action Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-signal forensic modeling with Gemini 3.8</span>
          </div>

          <button
            id="btn-run-analysis"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
              isAnalyzing 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-950/50'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Forensics Scan...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze {activeMode.toUpperCase()}
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
