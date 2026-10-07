export type AnalysisMode = 
  | 'news' 
  | 'text' 
  | 'image' 
  | 'faceswap' 
  | 'video' 
  | 'audio' 
  | 'dubbing';

export type AssessmentStatus = 
  | 'Likely Reliable' 
  | 'Needs Verification' 
  | 'Potentially Misleading'
  | 'Likely Authentic'
  | 'Potentially Manipulated'
  | 'Likely Human'
  | 'Mixed / Heavily Edited'
  | 'Likely Synthetic / AI-Generated'
  | 'Potentially Synthetic Voice';

export interface ClaimItem {
  claim: string;
  assessment: 'Likely Reliable' | 'Needs Verification' | 'Potentially Misleading' | 'Unverified' | string;
  reason: string;
  verificationSteps: string;
}

export interface IndicatorItem {
  name: string;
  status: 'pass' | 'warning' | 'alert';
  detail: string;
  type?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface EvidenceItem {
  source: string;
  headline: string;
  finding: string;
  type: 'supporting' | 'contradicting' | 'context' | string;
}

export interface ReviewRegion {
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  label: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimelineEvent {
  time: string;
  status: 'pass' | 'warning' | 'alert';
  event: string;
}

export interface AnalysisReport {
  id: string;
  timestamp: string;
  mode: AnalysisMode;
  title: string;
  inputPreview?: string;
  mediaUrl?: string;
  assessment: AssessmentStatus;
  confidence: number;
  truthScore?: number; // 0-100 (reliability)
  manipulationScore?: number; // 0-100 (suspicion)
  aiLikelihood?: number; // 0-100 (text synthetic likelihood)
  syntheticScore?: number; // 0-100 (audio synthetic likelihood)
  summary: string;
  claims?: ClaimItem[];
  indicators: IndicatorItem[];
  detectedEvidence?: string[];
  aiInference?: string[];
  evidence?: EvidenceItem[];
  reviewRegions?: ReviewRegion[];
  timeline?: TimelineEvent[];
  patterns?: string[];
  transcript?: string;
  verificationSteps: string[];
  limitations: string[];
  explainableAI: string;
  isDemo?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  mode: AnalysisMode;
  title: string;
  assessment: AssessmentStatus;
  score: number;
  report: AnalysisReport;
}

export interface SampleCase {
  id: string;
  title: string;
  mode: AnalysisMode;
  tag: string;
  description: string;
  data: {
    headline?: string;
    articleText?: string;
    sourceUrl?: string;
    text?: string;
    imageBase64?: string;
    imageUrl?: string;
    videoName?: string;
    audioName?: string;
    metadata?: Record<string, string>;
  };
  sampleReport: Partial<AnalysisReport>;
}
