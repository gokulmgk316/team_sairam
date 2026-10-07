import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { geminiService, getGeminiClient } from "./server/geminiService.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser for base64 media uploads (up to 50MB for video/image data URLs)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enable CORS for all cross-origin requests, preview iframes, and subdomains
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Range");
  res.header("Access-Control-Expose-Headers", "Content-Length, Content-Range");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// ----------------------------------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------------------------------
app.get("/api/health", (_req, res) => {
  const client = getGeminiClient();
  const hasKey = !!client;
  res.json({
    status: "ok",
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------------------------------
// 1. News Misinformation & Claim Verification Analysis
// ----------------------------------------------------------------------------
app.post("/api/analyze/news", async (req, res) => {
  try {
    const { headline, articleText, sourceUrl } = req.body;
    if (!articleText && !headline) {
      return res.status(400).json({ error: "Headline or article text is required." });
    }

    // Call dedicated server-side Gemini service
    const report = await geminiService.analyzeNews({
      headline,
      articleText,
      sourceUrl,
    });

    return res.json(report);
  } catch (error: any) {
    console.error("[News Analysis Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze news content.",
    });
  }
});

// ----------------------------------------------------------------------------
// 2. AI-Generated Text & Stylometric Likelihood Analysis
// ----------------------------------------------------------------------------
app.post("/api/analyze/text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Text must be at least 20 characters for meaningful analysis." });
    }

    // Call dedicated server-side Gemini service
    const report = await geminiService.analyzeText({ text });
    return res.json(report);
  } catch (error: any) {
    console.error("[Text Analysis Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze text.",
    });
  }
});

// ----------------------------------------------------------------------------
// 3. Image Manipulation & Face-Swap Visual Assessment
// ----------------------------------------------------------------------------
app.post("/api/analyze/image", async (req, res) => {
  try {
    const { imageBase64, mode = "image", metadata } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required." });
    }

    // Call dedicated server-side Gemini service with multimodal input
    const report = await geminiService.analyzeImage({
      imageBase64,
      mode: mode === "faceswap" ? "faceswap" : "image",
      metadata,
    });

    return res.json(report);
  } catch (error: any) {
    console.error("[Image Analysis Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze image.",
    });
  }
});

// ----------------------------------------------------------------------------
// 4. Video Manipulation & Dubbing Keyframe Analysis
// ----------------------------------------------------------------------------
app.post("/api/analyze/video", async (req, res) => {
  try {
    const { videoName = "video_clip.mp4", duration = "10s", mode = "video", frameImages = [] } = req.body;

    // Call dedicated server-side Gemini service with sampled keyframe images
    const report = await geminiService.analyzeVideo({
      videoName,
      duration,
      mode: mode === "dubbing" ? "dubbing" : "video",
      frameImages,
    });

    return res.json(report);
  } catch (error: any) {
    console.error("[Video Analysis Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze video.",
    });
  }
});

// ----------------------------------------------------------------------------
// 5. Audio Acoustic & Synthetic Voice Analysis
// ----------------------------------------------------------------------------
app.post("/api/analyze/audio", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/mp3", audioName = "audio.mp3", mode = "audio" } = req.body;

    // Call dedicated server-side Gemini service with audio buffer & transcription
    const report = await geminiService.analyzeAudio({
      audioBase64,
      mimeType,
      audioName,
      mode,
    });

    return res.json(report);
  } catch (error: any) {
    console.error("[Audio Analysis Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze audio.",
    });
  }
});

// ----------------------------------------------------------------------------
// 6. Discuss With AI - Conversational Follow-up Grounded in Analysis
// ----------------------------------------------------------------------------
app.post("/api/discuss", async (req, res) => {
  try {
    const { question, contextReport, chatHistory = [] } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Call dedicated server-side conversational Gemini assistant
    const reply = await geminiService.discussAnalysis({
      report: contextReport,
      userQuery: question,
      history: chatHistory,
    });

    return res.json({ reply });
  } catch (error: any) {
    console.error("[Discuss Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to complete AI discussion.",
    });
  }
});

// ----------------------------------------------------------------------------
// Vite Server Integration (SPA Middleware in dev, Static serving in prod)
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TruthLens AI server running on http://localhost:${PORT}`);
  });
}

startServer();
