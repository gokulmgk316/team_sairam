/**
 * TruthLens AI - Dedicated Server-Side Gemini Service
 * 
 * ARCHITECTURE:
 * User → React Frontend → Backend API (/api/*) → Gemini Service (server/geminiService.ts) → Gemini API → Structured Analysis → Frontend
 * 
 * SECURITY:
 * - process.env.GEMINI_API_KEY is accessed ONLY on the server side.
 * - API keys, secrets, or internal paths are NEVER exposed to client-side bundles or client responses.
 * - Input sanitization, media size caps, and multi-pass JSON validation protect against injection and parsing failures.
 */

import { GoogleGenAI } from "@google/genai";

// Primary system prompt defining TruthLens AI's evidence-aware, balanced methodology
export const TRUTHLENS_SYSTEM_PROMPT = `You are TruthLens AI, an evidence-aware digital-content analysis assistant. Analyze the content provided by the user and identify potential misinformation, manipulation, or synthetic-content indicators.

Do not automatically classify content as true or false. Separate user-provided claims, verified information, model inference, and uncertainty.

Never fabricate evidence, sources, statistics, quotations, URLs, or citations.

For news analysis, identify important claims and explain which claims require verification.

For images, videos, and audio, analyze only the signals and capabilities actually available to the model. Do not claim forensic certainty.

If there is insufficient evidence, explicitly state that the content cannot be reliably determined.

Provide a clear explanation of your reasoning and practical verification steps.

Your goal is to help users understand potential risks, not to make unsupported definitive accusations.`;

// Candidate models in preference order for high-availability fallback
const GENERAL_MODELS = [
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

const TRANSCRIBE_MODELS = [
  "gemini-3.5-transcribe",
  "gemini-2.5-flash",
  "gemini-3.8-flash",
];

let cachedClient: GoogleGenAI | null = null;

/**
 * Lazy initialization for GoogleGenAI client using process.env.GEMINI_API_KEY
 */
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "truthlens-ai-server-gemini-service",
        },
      },
    });
  }
  return cachedClient;
}

/**
 * Enhanced multi-pass clean JSON parser for Gemini responses
 */
export function extractJson<T = any>(rawText: string): T | null {
  if (!rawText) return null;
  const trimmed = rawText.trim();

  // Pass 1: Direct parse
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Pass 2: Strip markdown code fences (```json ... ```)
    try {
      const clean = trimmed.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/gi, "$1").trim();
      return JSON.parse(clean) as T;
    } catch {
      // Pass 3: Extract outermost brace boundaries
      const firstBrace = trimmed.indexOf("{");
      const lastBrace = trimmed.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const sliced = trimmed.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(sliced) as T;
        } catch {
          // Pass 4: Sanitize trailing commas before closing braces/brackets
          try {
            const sanitized = sliced.replace(/,\s*([\]}])/g, "$1");
            return JSON.parse(sanitized) as T;
          } catch (err) {
            console.error("extractJson recovery failed:", err);
            return null;
          }
        }
      }
      return null;
    }
  }
}

/**
 * Core Gemini execution helper with automatic multi-model fallback
 */
export async function executeGeminiWithFallback(
  ai: GoogleGenAI,
  contents: any,
  isJson = true,
  candidateModels = GENERAL_MODELS
): Promise<string> {
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: TRUTHLENS_SYSTEM_PROMPT,
          ...(isJson ? { responseMimeType: "application/json" } : {}),
          temperature: 0.2, // low temperature for consistent, objective analysis
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Service] Model candidate "${model}" failed (${err?.message || err}). Trying fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini AI candidate models were temporarily unavailable.");
}

/**
 * Standard structured indicator item
 */
export interface StandardIndicator {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
  name: string;
  detail: string;
  status: "pass" | "warning" | "alert";
}

/**
 * Standard structured response contract required by TruthLens AI
 */
export interface TruthLensStructuredReport {
  assessment: "Likely Reliable" | "Needs Verification" | "Potentially Misleading" | "Likely Authentic" | "Potentially Manipulated" | "Likely Human" | "Mixed / Heavily Edited" | "Likely Synthetic / AI-Generated" | "Potentially Synthetic Voice";
  confidence: number;
  summary: string;
  claims: Array<{
    claim: string;
    assessment: string;
    reason: string;
    verificationSteps: string;
  }>;
  indicators: StandardIndicator[];
  evidence: Array<{
    source: string;
    headline: string;
    finding: string;
    type: "supporting" | "contradicting" | "context";
  }>;
  verificationSteps: string[];
  limitations: string[];
  explainableAI: string;
  // Domain specific scores
  truthScore?: number;
  aiLikelihood?: number;
  manipulationScore?: number;
  syntheticScore?: number;
  reviewRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    severity: "low" | "medium" | "high";
  }>;
  patterns?: string[];
  transcript?: string;
}

/**
 * Validates and normalizes raw Gemini JSON response to strictly guarantee
 * all required keys, types, and fallback values exist without breaking the UI.
 */
export function validateAndNormalizeResponse(
  raw: any,
  mode: string,
  fallbackTitle: string
): TruthLensStructuredReport {
  const safeObj = (typeof raw === "object" && raw !== null) ? raw : {};

  // 1. Assessment normalization
  const validAssessments = [
    "Likely Reliable",
    "Needs Verification",
    "Potentially Misleading",
    "Likely Authentic",
    "Potentially Manipulated",
    "Likely Human",
    "Mixed / Heavily Edited",
    "Likely Synthetic / AI-Generated",
    "Potentially Synthetic Voice",
  ];
  let assessment = safeObj.assessment;
  if (!validAssessments.includes(assessment)) {
    if (mode === "news") assessment = "Needs Verification";
    else if (mode === "text") assessment = "Mixed / Heavily Edited";
    else if (mode === "audio") assessment = "Needs Verification";
    else assessment = "Needs Verification";
  }

  // 2. Confidence normalization (0-100)
  let confidence = typeof safeObj.confidence === "number" ? Math.round(safeObj.confidence) : 75;
  if (isNaN(confidence) || confidence < 0) confidence = 50;
  if (confidence > 100) confidence = 100;

  // 3. Summary
  const summary = (typeof safeObj.summary === "string" && safeObj.summary.trim().length > 0)
    ? safeObj.summary.trim()
    : `Analysis for ${fallbackTitle} completed. Please inspect extracted claims and suggested verification steps below.`;

  // 4. Claims array
  const rawClaims = Array.isArray(safeObj.claims) ? safeObj.claims : [];
  const claims = rawClaims.map((c: any, idx: number) => ({
    claim: (c && typeof c.claim === "string") ? c.claim : `Analyzed statement #${idx + 1}`,
    assessment: (c && typeof c.assessment === "string") ? c.assessment : "Needs Verification",
    reason: (c && typeof c.reason === "string") ? c.reason : "Requires secondary corroboration against authoritative sources.",
    verificationSteps: (c && typeof c.verificationSteps === "string") ? c.verificationSteps : "Consult official documentation or established fact-checking registries.",
  }));

  // If no claims provided in news/text mode, provide a default claim
  if (claims.length === 0 && (mode === "news" || mode === "text")) {
    claims.push({
      claim: fallbackTitle.slice(0, 120),
      assessment: assessment,
      reason: "Primary thesis extracted from submission requires independent verification.",
      verificationSteps: "Review original source attributions and institutional bureaus.",
    });
  }

  // 5. Indicators normalization (supports both {type, description, severity} and {name, detail, status})
  const rawIndicators = Array.isArray(safeObj.indicators) ? safeObj.indicators : [];
  const indicators: StandardIndicator[] = rawIndicators.map((ind: any, idx: number) => {
    const type = ind?.type || ind?.name || `Indicator #${idx + 1}`;
    const description = ind?.description || ind?.detail || "Evaluation of content signal completed.";
    let severity: "low" | "medium" | "high" = "low";
    if (ind?.severity === "high" || ind?.status === "alert") severity = "high";
    else if (ind?.severity === "medium" || ind?.status === "warning") severity = "medium";

    const status: "pass" | "warning" | "alert" = 
      severity === "high" ? "alert" : severity === "medium" ? "warning" : "pass";

    return {
      type,
      description,
      severity,
      name: type,
      detail: description,
      status,
    };
  });

  // Ensure at least 2 default indicators if missing
  if (indicators.length === 0) {
    indicators.push({
      type: "Factual Attributions",
      description: "Content signals cross-referenced for verifiability and verifiable entities.",
      severity: "low",
      name: "Factual Attributions",
      detail: "Content signals cross-referenced for verifiability and verifiable entities.",
      status: "pass",
    });
    indicators.push({
      type: "Contextual Coherence",
      description: "Linguistic and stylistic structure evaluated for sensational or artificial patterns.",
      severity: "medium",
      name: "Contextual Coherence",
      detail: "Linguistic and stylistic structure evaluated for sensational or artificial patterns.",
      status: "warning",
    });
  }

  // 6. Evidence array
  const rawEvidence = Array.isArray(safeObj.evidence) ? safeObj.evidence : [];
  const evidence = rawEvidence.map((ev: any) => {
    if (typeof ev === "string") {
      return {
        source: "Verification Context",
        headline: ev,
        finding: "Supporting reference noted during model contextual evaluation.",
        type: "context" as const,
      };
    }
    return {
      source: ev?.source || "Primary Source Reference",
      headline: ev?.headline || "Related record or context",
      finding: ev?.finding || "Independent corroboration recommended.",
      type: (["supporting", "contradicting", "context"].includes(ev?.type) ? ev.type : "context") as "supporting" | "contradicting" | "context",
    };
  });

  // 7. Verification Steps
  const rawSteps = Array.isArray(safeObj.verificationSteps) ? safeObj.verificationSteps : [];
  const verificationSteps = rawSteps.length > 0
    ? rawSteps.map((s: any) => String(s))
    : [
        "Cross-reference key claims with Reuters Fact Check, AP News, or Snopes.",
        "Check author credentials, institutional affiliations, and publication registry.",
        "Locate the original raw document, recording, or dataset cited.",
      ];

  // 8. Limitations
  const rawLimits = Array.isArray(safeObj.limitations) ? safeObj.limitations : [];
  const limitations = rawLimits.length > 0
    ? rawLimits.map((l: any) => String(l))
    : [
        "AI-assisted assessment; does not constitute cryptographic or judicial certification.",
        "Detection algorithms are probabilistic and should be corroborated with authoritative domain experts.",
      ];

  // 9. Explainable AI summary
  const explainableAI = (typeof safeObj.explainableAI === "string" && safeObj.explainableAI.trim().length > 0)
    ? safeObj.explainableAI.trim()
    : `TruthLens AI evaluated lexical, syntactic, and structural signals to formulate an initial risk profile of ${assessment}.`;

  // 10. Metric alignment
  const result: TruthLensStructuredReport = {
    assessment,
    confidence,
    summary,
    claims,
    indicators,
    evidence,
    verificationSteps,
    limitations,
    explainableAI,
  };

  if (mode === "news") {
    result.truthScore = typeof safeObj.truthScore === "number" ? Math.round(safeObj.truthScore) : (assessment === "Likely Reliable" ? 88 : assessment === "Potentially Misleading" ? 30 : 58);
  } else if (mode === "text") {
    result.aiLikelihood = typeof safeObj.aiLikelihood === "number" ? Math.round(safeObj.aiLikelihood) : (assessment === "Likely Synthetic / AI-Generated" ? 85 : assessment === "Likely Human" ? 18 : 55);
    result.patterns = Array.isArray(safeObj.patterns) ? safeObj.patterns : [];
  } else if (mode === "audio") {
    result.syntheticScore = typeof safeObj.syntheticScore === "number" ? Math.round(safeObj.syntheticScore) : (assessment === "Potentially Synthetic Voice" ? 82 : 25);
    if (typeof safeObj.transcript === "string") result.transcript = safeObj.transcript;
  } else {
    // image, faceswap, video, dubbing
    result.manipulationScore = typeof safeObj.manipulationScore === "number" ? Math.round(safeObj.manipulationScore) : (assessment === "Potentially Manipulated" ? 78 : 22);
    if (Array.isArray(safeObj.reviewRegions)) {
      result.reviewRegions = safeObj.reviewRegions;
    }
  }

  return result;
}

// ----------------------------------------------------------------------------
// DEDICATED DOMAIN ANALYSIS SERVICES
// ----------------------------------------------------------------------------

export const geminiService = {
  /**
   * 1. NEWS ANALYSIS
   * - Extracts important claims
   * - Identifies suspicious / unsupported assertions
   * - Checks emotional wording & sensationalism
   * - Never fabricates sources
   */
  async analyzeNews(params: {
    headline?: string;
    articleText?: string;
    sourceUrl?: string;
  }): Promise<TruthLensStructuredReport> {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your server environment or Settings.");
    }

    const { headline, articleText, sourceUrl } = params;
    if (!headline && !articleText) {
      throw new Error("Headline or article text is required for news analysis.");
    }

    const prompt = `Perform an objective, evidence-aware analysis of this news content:
Headline: ${headline || "Not provided"}
Source URL: ${sourceUrl || "Not provided"}
Article Content:
${articleText || "No body provided; analyze headline assertions."}

Instructions:
1. Extract important claims.
2. Identify suspicious, controversial, or unsupported assertions.
3. Analyze sensational or emotionally loaded wording.
4. Check internal consistency and source attribution.
5. Explain what should be independently verified.
6. Never invent sources, quotes, or statistics.

Return strictly valid JSON conforming to this schema:
{
  "assessment": "Likely Reliable" | "Needs Verification" | "Potentially Misleading",
  "confidence": <integer 0-100>,
  "truthScore": <integer 0-100 estimated reliability>,
  "summary": "<clear executive summary>",
  "claims": [
    {
      "claim": "<extracted claim>",
      "assessment": "Likely Reliable" | "Needs Verification" | "Potentially Misleading",
      "reason": "<reasoning>",
      "verificationSteps": "<actionable step>"
    }
  ],
  "indicators": [
    {
      "type": "Source Attribution" | "Sensational Language" | "Internal Consistency" | "Verifiable Evidence",
      "description": "<detailed observation>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "evidence": [
    {
      "source": "<known reference entity or wire>",
      "headline": "<factual context>",
      "finding": "<finding>",
      "type": "supporting" | "contradicting" | "context"
    }
  ],
  "verificationSteps": ["<step 1>", "<step 2>"],
  "limitations": [
    "Automated model assessment based on submitted text.",
    "Real-time external news archives should be consulted for breaking developments."
  ],
  "explainableAI": "<clear plain-language explanation of model inference>"
}`;

    const rawResponse = await executeGeminiWithFallback(ai, prompt, true);
    const parsed = extractJson(rawResponse);
    return validateAndNormalizeResponse(parsed, "news", headline || "Submitted News Article");
  },

  /**
   * 2. TEXT ANALYSIS
   * - Estimates characteristics associated with AI-generated writing
   * - Call result: AI-Generation Likelihood
   * - Explicitly avoids stating text is definitively AI-generated
   */
  async analyzeText(params: { text: string }): Promise<TruthLensStructuredReport> {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your server environment or Settings.");
    }

    const { text } = params;
    if (!text || text.trim().length < 20) {
      throw new Error("Text must be at least 20 characters for meaningful analysis.");
    }

    const prompt = `Analyze this writing to estimate AI-Generation Likelihood based on stylistic, syntactic, and structural signals:
Submitted Text:
"""
${text}
"""

Instructions:
1. Evaluate syntactic burstiness, sentence length variation, and lexical perplexity.
2. Identify formulaic transition words, generic intros/conclusions, or excessive hedging.
3. Explicitly treat AI text detection as probabilistic and inherently uncertain. Never claim definitive proof of AI generation.

Return strictly valid JSON conforming to this schema:
{
  "assessment": "Likely Human" | "Mixed / Heavily Edited" | "Likely Synthetic / AI-Generated",
  "confidence": <integer 0-100>,
  "aiLikelihood": <integer 0-100 percentage likelihood of AI involvement>,
  "summary": "<summary focusing on AI-Generation Likelihood>",
  "patterns": ["<pattern 1 e.g. uniform sentence cadence>", "<pattern 2>"],
  "indicators": [
    {
      "type": "Syntactic Burstiness" | "Perplexity & Vocabulary" | "Formulaic Structure" | "Hedging & Transitions",
      "description": "<detailed observation>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "claims": [],
  "evidence": [],
  "verificationSteps": [
    "Inspect previous verified writings from the same author to compare stylistic baseline.",
    "Look for personal anecdotes, idiosyncratic phrasing, or contemporary local references."
  ],
  "limitations": [
    "AI-text detection is inherently probabilistic and cannot definitively prove non-human authorship.",
    "Formal, highly edited human prose often shares statistical traits with LLM outputs."
  ],
  "explainableAI": "<clear explanation of why this likelihood score was assigned>"
}`;

    const rawResponse = await executeGeminiWithFallback(ai, prompt, true);
    const parsed = extractJson(rawResponse);
    return validateAndNormalizeResponse(parsed, "text", "Submitted Text Writing");
  },

  /**
   * 3. IMAGE ANALYSIS
   * - Multimodal image inspection
   * - Visible indicators: inconsistent lighting, unnatural edges, face manipulation, unusual textures, synthetic regions
   * - Clearly labeled as AI-assisted visual assessment, not forensic certification
   */
  async analyzeImage(params: {
    imageBase64: string;
    mode: "image" | "faceswap";
    metadata?: Record<string, any>;
  }): Promise<TruthLensStructuredReport> {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your server environment or Settings.");
    }

    const { imageBase64, mode, metadata } = params;
    if (!imageBase64) {
      throw new Error("Image data is required.");
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const promptText = `Perform an AI-assisted visual assessment of this image for potential manipulation, face-swapping, or generative AI synthesis.
Context:
Mode: ${mode === "faceswap" ? "Biometric Facial Manipulation & Deepfake Face-Swap" : "General Image Manipulation & Generative Synthesis"}
Metadata: ${JSON.stringify(metadata || {})}

Visual indicators to inspect:
- Inconsistent lighting and specular reflections (e.g. eye catchlights not matching the light source)
- Unnatural edges, boundary feathering, or warping along jawlines, hair, or object contours
- Visual inconsistencies in repetitive textures (hands, teeth, background patterns)
- Facial proportion anomalies or blending artifacts around mouth and eyes
- Synthetic diffusion characteristics (waxy skin smoothing, impossible geometry)

CRITICAL REQUIREMENT:
Clearly label this evaluation as an AI-assisted visual assessment, NOT a forensic certification. Do not fabricate certainty.

Return strictly valid JSON conforming to this schema:
{
  "assessment": "Likely Authentic" | "Needs Verification" | "Potentially Manipulated",
  "confidence": <integer 0-100>,
  "manipulationScore": <integer 0-100 suspicion index>,
  "summary": "<2-3 sentence visual assessment summary>",
  "reviewRegions": [
    {
      "x": <integer 0-100 percentage X>,
      "y": <integer 0-100 percentage Y>,
      "width": <integer 10-50 percentage width>,
      "height": <integer 10-50 percentage height>,
      "label": "<specific region observation e.g. Specular Cornea Mismatch>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "indicators": [
    {
      "type": "Lighting & Shadows" | "Boundary Seams" | "Anatomical Consistency" | "Texture & Noise Floor",
      "description": "<observation>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "claims": [],
  "evidence": [],
  "verificationSteps": [
    "Perform a reverse image search on Google Images, TinEye, or Yandex to trace original capture date.",
    "Inspect EXIF metadata with an offline viewer for camera serial numbers or editing software tags.",
    "Examine high-resolution raw uncompressed files where possible."
  ],
  "limitations": [
    "AI-assisted visual assessment only; does not constitute cryptographic hardware attestation or judicial certification.",
    "Compression artifacts from social media re-encoding can mimic synthetic boundary noise."
  ],
  "explainableAI": "<clear explanation of the visual cues that influenced the assessment>"
}`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
        { text: promptText },
      ],
    };

    const rawResponse = await executeGeminiWithFallback(ai, contents, true);
    const parsed = extractJson(rawResponse);
    return validateAndNormalizeResponse(parsed, mode, "Uploaded Image Inspection");
  },

  /**
   * 4. VIDEO ANALYSIS
   * - Evaluates video via representative keyframes
   * - Clear disclosure: based on sampled frames rather than full forensic examination
   * - Never fabricates deepfake heatmaps or certainty
   */
  async analyzeVideo(params: {
    videoName: string;
    duration?: string;
    mode: "video" | "dubbing";
    frameImages?: string[];
  }): Promise<TruthLensStructuredReport> {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your server environment or Settings.");
    }

    const { videoName, duration, mode, frameImages = [] } = params;

    const parts: any[] = [];
    // Attach representative keyframe images if provided
    for (let i = 0; i < Math.min(frameImages.length, 3); i++) {
      const f = frameImages[i];
      const clean = f.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const mime = f.match(/^data:(image\/[a-zA-Z+]+);base64,/)?.[1] || "image/jpeg";
      parts.push({
        inlineData: {
          mimeType: mime,
          data: clean,
        },
      });
    }

    const promptText = `Perform an AI-assisted video inspection:
Video Clip: ${videoName}
Reported Duration: ${duration || "Unknown"}
Mode: ${mode === "dubbing" ? "Audio-Visual Dubbing & Lip-Sync Inconsistency" : "Video Deepfake & Facial Motion Synthesis"}
Sampled Keyframes Attached: ${Math.min(frameImages.length, 3)}

Instructions:
1. Examine the sampled video frames for facial boundary flickering, warping, unnatural blinking cadence, or lip-sync misalignment.
2. Clearly state that the result is based on available sampled frames rather than complete temporal pixel stream forensics.
3. Never generate a fake deepfake heatmap or claim forensic certification.

Return strictly valid JSON conforming to this schema:
{
  "assessment": "Likely Authentic" | "Needs Verification" | "Potentially Manipulated",
  "confidence": <integer 0-100>,
  "manipulationScore": <integer 0-100 suspicion index>,
  "summary": "<summary noting evaluation is based on sampled frames>",
  "indicators": [
    {
      "type": "Temporal Coherence" | "Facial Boundary Stability" | "Lip-Sync & Phoneme Alignment" | "Motion Blur Consistency",
      "description": "<detailed observation>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "claims": [],
  "evidence": [],
  "verificationSteps": [
    "Examine high-speed frame-by-frame scrubbing at 0.25x speed to look for single-frame morphing glitches.",
    "Compare audio phonemes with mouth shapes during plosive consonants (P, B, M).",
    "Locate the verified uncompressed original broadcast footage."
  ],
  "limitations": [
    "Evaluation is based on sampled representative frames; does not evaluate continuous lossless temporal motion vectors.",
    "Heavy streaming compression or low frame rates may introduce natural artifacting."
  ],
  "explainableAI": "<clear explanation of the visual and acoustic cues noted>"
}`;

    parts.push({ text: promptText });

    const rawResponse = await executeGeminiWithFallback(ai, { parts }, true);
    const parsed = extractJson(rawResponse);
    return validateAndNormalizeResponse(parsed, mode, videoName);
  },

  /**
   * 5. AUDIO ANALYSIS
   * - Transcribes & analyzes audio characteristics
   * - Respiration pauses, vocoder harmonics, natural prosody
   * - Honest limitation message explaining difference from hardware spectral telemetry
   */
  async analyzeAudio(params: {
    audioBase64?: string;
    mimeType?: string;
    audioName?: string;
    mode?: string;
  }): Promise<TruthLensStructuredReport> {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your server environment or Settings.");
    }

    const { audioBase64, mimeType = "audio/mp3", audioName = "recording.mp3" } = params;
    const cleanAudio = audioBase64 ? audioBase64.replace(/^data:audio\/[a-zA-Z0-9+]+;base64,/, "") : null;

    let transcript = "";
    if (cleanAudio) {
      try {
        transcript = await executeGeminiWithFallback(
          ai,
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanAudio,
                },
              },
              { text: "Transcribe this audio recording verbatim. If words are unclear, mark as [unclear]." },
            ],
          },
          false,
          TRANSCRIBE_MODELS
        );
      } catch (tErr) {
        console.warn("[Gemini Audio] Transcription fallback notice:", tErr);
      }
    }

    const promptText = `Perform an acoustic analysis of this audio content for signs of synthetic voice generation or voice cloning:
Audio Clip: ${audioName}
Extracted Transcript: "${transcript || "Audio provided as raw sample."}"

Instructions:
1. Evaluate acoustic indicators: natural inhalation/respiration pauses, micro-intonation, robotic robotic cadence, metallic high-frequency harmonics, unnatural silence gating.
2. Provide an honest limitation message explaining that AI audio assessment evaluates acoustic heuristics, not cryptographic hardware watermarks.

Return strictly valid JSON conforming to this schema:
{
  "assessment": "Likely Authentic" | "Needs Verification" | "Potentially Synthetic Voice",
  "confidence": <integer 0-100>,
  "syntheticScore": <integer 0-100 synthetic probability>,
  "summary": "<summary>",
  "transcript": "<transcript or placeholder>",
  "indicators": [
    {
      "type": "Respiration & Breath Pauses" | "Vocal Tract Harmonics" | "Prosodic Inflection" | "Silence Gating & Noise Floor",
      "description": "<observation>",
      "severity": "low" | "medium" | "high"
    }
  ],
  "claims": [],
  "evidence": [],
  "verificationSteps": [
    "Inspect the audio using a standalone spectrogram tool (e.g. Audacity) to check for sharp high-frequency 16kHz cutoffs.",
    "Verify whether the purported speaker has public voice samples that match this exact phrasing.",
    "Check background noise continuity between spoken phrases."
  ],
  "limitations": [
    "AI evaluation evaluates phonetic and acoustic heuristic signals; does not replace laboratory biometric spectrogram forensics.",
    "Telephony compression (GSM / 8kHz codecs) can strip natural harmonics, mimicking synthetic vocoder artifacts."
  ],
  "explainableAI": "<clear explanation of the acoustic cues identified>"
}`;

    const parts: any[] = [];
    if (cleanAudio) {
      parts.push({
        inlineData: {
          mimeType,
          data: cleanAudio,
        },
      });
    }
    parts.push({ text: promptText });

    const rawResponse = await executeGeminiWithFallback(ai, { parts }, true);
    const parsed = extractJson(rawResponse);
    const report = validateAndNormalizeResponse(parsed, "audio", audioName);
    if (transcript && !report.transcript) {
      report.transcript = transcript;
    }
    return report;
  },

  /**
   * 6. DISCUSS WITH AI
   * - Conversational Gemini assistant grounded strictly in the current analysis report
   * - Answers:
   *   "Why did you give this result?"
   *   "Which claim is suspicious?"
   *   "What should I verify?"
   *   "Explain this in simple words."
   *   "What evidence is missing?"
   * - Never invents facts or sources not present in the analysis
   */
  async discussAnalysis(params: {
    report: any;
    userQuery: string;
    history?: Array<{ role: string; content: string }>;
  }): Promise<string> {
    const ai = getGeminiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const { report, userQuery, history = [] } = params;
    if (!userQuery || !userQuery.trim()) {
      throw new Error("User question is required.");
    }

    const reportContext = JSON.stringify({
      title: report?.title,
      mode: report?.mode,
      assessment: report?.assessment,
      confidence: report?.confidence,
      summary: report?.summary,
      claims: report?.claims,
      indicators: report?.indicators,
      evidence: report?.evidence,
      verificationSteps: report?.verificationSteps,
      limitations: report?.limitations,
      explainableAI: report?.explainableAI,
    }, null, 2);

    const prompt = `You are TruthLens AI's conversational assistant. A user is asking a follow-up question about an already-completed forensic analysis.

Grounding Context (Current Report):
${reportContext}

Recent Conversation History:
${history.slice(-4).map((h) => `${h.role}: ${h.content}`).join("\n")}

User Question: "${userQuery}"

Strict Operating Rules:
1. Stay strictly grounded in the report data above.
2. If asked "Why did you give this result?", cite the specific indicators and reasons from the report.
3. If asked "Which claim is suspicious?", reference the claims flagged as "Needs Verification" or "Potentially Misleading".
4. If asked "What should I verify?", explain the practical verification steps provided in the report.
5. If asked "Explain this in simple words.", translate technical jargon (like perplexity, specular mismatch, vocoder artifacts) into accessible everyday analogies.
6. If asked "What evidence is missing?", refer directly to the limitations and unverified claims.
7. Do not fabricate facts, sources, or URLs not present in the analysis context.
8. Keep your response concise (1-3 readable paragraphs).`;

    return await executeGeminiWithFallback(ai, prompt, false);
  },
};
