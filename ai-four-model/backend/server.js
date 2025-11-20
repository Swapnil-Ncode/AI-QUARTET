import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ────────────────────────────────
   🔍 HEALTH CHECK
────────────────────────────────── */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeysConfigured: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
    },
    devMock: !!process.env.DEV_MOCK,
  });
});

/* ────────────────────────────────
   🤖 MAIN AI ENDPOINT
────────────────────────────────── */
app.post("/api/query", async (req, res) => {
  const { model, prompt } = req.body;

  if (!model || !prompt) {
    return res
      .status(400)
      .json({ error: "Missing model or prompt", success: false });
  }

  let output = "";
  let error = null;

  try {
    /* ────────────────────────────────
       1️⃣ OPENAI (NOW USING GEMMA2 FREE MODEL)
    ───────────────────────────────── */
    if (model === "openai") {
      if (!process.env.GROQ_API_KEY) {
        error = "GROQ_API_KEY missing";
      } else {
        try {
          const r = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.1-8b-instant",
              messages: [{ role: "user", content: prompt }],
            },
            {
              headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
              timeout: 30000,
            }
          );

          output =
            r.data.choices?.[0]?.message?.content || "No response from Gemma2";
        } catch (e) {
          error =
            "Gemma2 (Groq) API error: " +
            (e.response?.data?.error?.message || e.message);

          if (process.env.DEV_MOCK === "true") {
            output = `Mock response for ${model}: Gemma2 unavailable (${error}). This is a simulated reply.`;
            error = null;
          }
        }
      }
    }

    /* ────────────────────────────────
       2️⃣ Google Gemini 2 Flash
    ───────────────────────────────── */
    else if (model === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        error = "GEMINI_API_KEY missing";
      } else {
        try {
          const r = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: [{ parts: [{ text: prompt }] }],
            },
            { timeout: 30000 }
          );

          output =
            r.data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response";
        } catch (e) {
          error =
            "Gemini API: " +
            (e.response?.data?.error?.message || e.message);
        }
      }
    }

    /* ────────────────────────────────
       3️⃣ DeepSeek R1 via Groq
    ───────────────────────────────── */
    else if (model === "deepseek") {
      if (!process.env.GROQ_API_KEY) {
        error = "GROQ_API_KEY missing";
      } else {
        try {
          const r = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
            },
            {
              headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
              timeout: 30000,
            }
          );

          output =
            r.data.choices?.[0]?.message?.content ||
            "No response from DeepSeek model";
        } catch (e) {
          error =
            "DeepSeek (Groq) API: " +
            (e.response?.data?.error?.message || e.message);
        }
      }
    }

    /* ────────────────────────────────
       4️⃣ GROQ - LLaMA 3.3 70B
    ───────────────────────────────── */
    else if (model === "groq") {
      if (!process.env.GROQ_API_KEY) {
        error = "GROQ_API_KEY missing";
      } else {
        try {
          const r = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }],
            },
            {
              headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
              timeout: 30000,
            }
          );

          output =
            r.data.choices?.[0]?.message?.content ||
            "No response from Groq model";
        } catch (e) {
          error =
            "Groq API: " +
            (e.response?.data?.error?.message || e.message);
        }
      }
    }

    /* ────────────────────────────────
       ❌ Unknown Model
    ───────────────────────────────── */
    else {
      error = `Unknown model '${model}'`;
    }

    return res.json({
      success: !error,
      model,
      output,
      error,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error: " + err.message,
    });
  }
});

/* ────────────────────────────────
   🚀 START SERVER
────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
