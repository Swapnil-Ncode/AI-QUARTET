import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { model, prompt } = req.body ?? {};

    if (!model || !prompt)
      return res
        .status(400)
        .json({ error: "Missing model or prompt", success: false });

    let output = "";
    let error = null;

    // ----- GROQ (DeepSeek, Groq, Gemma, Llama all use Groq API) -----
    if (["openai", "deepseek", "groq"].includes(model)) {
      if (!process.env.GROQ_API_KEY) {
        error = "GROQ_API_KEY missing";
      } else {
        const groqModel =
          model === "openai"
            ? "llama-3.1-8b-instant"
            : model === "deepseek"
            ? "llama-3.1-70b-versatile"
            : "llama-3.1-70b-versatile";

        try {
          const r = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: groqModel,
                messages: [{ role: "user", content: prompt }],
              }),
            }
          );

          const data = await r.json();
          output =
            data.choices?.[0]?.message?.content ||
            data?.error?.message ||
            "No response";
        } catch (e) {
          error = "Groq API error: " + e.message;
        }
      }
    }

    // ----- GEMINI -----
    else if (model === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        error = "GEMINI_API_KEY missing";
      } else {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          });

          const data = await r.json();
          output =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            data?.error?.message ||
            "No response";
        } catch (e) {
          error = "Gemini API error: " + e.message;
        }
      }
    }

    // ----- UNKNOWN MODEL -----
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
    return res
      .status(500)
      .json({ success: false, error: "Server error: " + err.message });
  }
}
