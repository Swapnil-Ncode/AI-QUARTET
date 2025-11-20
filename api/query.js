import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const { model, prompt } = req.body;

  if (!model || !prompt) {
    return res.status(400).json({ success: false, error: "Missing model or prompt" });
  }

  let output = "";
  let error = null;

  try {
    // ────────────────────────────────
    // 1️⃣ OPENAI (using Groq free model)
    // ────────────────────────────────
    if (model === "openai") {
      if (!process.env.GROQ_API_KEY) error = "GROQ_API_KEY missing";
      else {
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

          output = r.data.choices?.[0]?.message?.content || "No response from Groq (OpenAI mode)";
        } catch (e) {
          error = "OpenAI (Groq) error: " + (e.response?.data?.error?.message || e.message);
        }
      }
    }

    // ────────────────────────────────
    // 2️⃣ GOOGLE GEMINI
    // ────────────────────────────────
    else if (model === "gemini") {
      if (!process.env.GEMINI_API_KEY) error = "GEMINI_API_KEY missing";
      else {
        try {
          const r = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { timeout: 30000 }
          );

          output = r.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        } catch (e) {
          error = "Gemini error: " + (e.response?.data?.error?.message || e.message);
        }
      }
    }

    // ────────────────────────────────
    // 3️⃣ DEEPSEEK (via Groq)
    // ────────────────────────────────
    else if (model === "deepseek") {
      if (!process.env.GROQ_API_KEY) error = "GROQ_API_KEY missing";
      else {
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

          output = r.data.choices?.[0]?.message?.content || "No response";
        } catch (e) {
          error = "DeepSeek error: " + (e.response?.data?.error?.message || e.message);
        }
      }
    }

    // ────────────────────────────────
    // 4️⃣ GROQ
    // ────────────────────────────────
    else if (model === "groq") {
      if (!process.env.GROQ_API_KEY) error = "GROQ_API_KEY missing";
      else {
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

          output = r.data.choices?.[0]?.message?.content || "No response";
        } catch (e) {
          error = "Groq error: " + (e.response?.data?.error?.message || e.message);
        }
      }
    }

    // ────────────────────────────────
    // UNKNOWN MODEL
    // ────────────────────────────────
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
    return res.status(500).json({
      success: false,
      error: "Server error: " + err.message,
    });
  }
}
