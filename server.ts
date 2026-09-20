import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasServerGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Helper to get Gemini client
  function getGeminiClient(customKey?: string) {
    const key = customKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Generate AI Performance Insights / Report
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, customKey } = req.body;
      const ai = getGeminiClient(customKey);

      if (!ai) {
        return res.status(400).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment or configure it in Settings.",
        });
      }

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            systemInstruction ||
            "You are an academic performance analysis advisor for college staff. Provide objective, constructive, and actionable educational insights based strictly on provided student data.",
          temperature: 0.4,
        },
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini Generate Error:", error);
      res.status(500).json({
        error: error?.message || "Failed to generate AI analysis. Please check your API key or connection.",
      });
    }
  });

  // AI Academic Chat Assistant
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, studentContext, history, customKey } = req.body;
      const ai = getGeminiClient(customKey);

      if (!ai) {
        return res.status(400).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment or configure it in Settings.",
        });
      }

      const sysInstruction = `You are a Smart Academic Assistant designed for college staff/professors.
You assist staff with reviewing student academic data, understanding performance trends, pinpointing weakness areas, explaining risk categories, and suggesting interventions.

Current Selected Student Academic Context:
${studentContext || "No student selected yet."}

Guidelines:
1. Ground answers strictly on the student's provided scores, IAs, assignments, attendance, and trends.
2. Frame all statements as academic guidance and indicators, never absolute medical/psychological judgments or pass/fail guarantees.
3. Keep advice specific to the student's actual subjects and marks. Avoid generic advice like 'study harder'.
4. Be professional, concise, respectful, and helpful.`;

      // Build contents array if history exists
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item.sender === "user") {
            contents.push({ role: "user", parts: [{ text: item.text }] });
          } else if (item.sender === "ai") {
            contents.push({ role: "model", parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.5,
        },
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({
        error: error?.message || "AI Chat failed to respond. Please try again.",
      });
    }
  });

  // Vite middleware in dev or static files in prod
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
