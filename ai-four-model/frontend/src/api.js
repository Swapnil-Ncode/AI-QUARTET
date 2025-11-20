export async function askModel(prompt, model) {
  let url = "";
  let headers = {};
  let body = {};

  if (model === "deepseek" || model === "qwen") {
    // OpenRouter (supports DeepSeek + Qwen)
    url = "https://openrouter.ai/api/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
    };

    body = {
      model:
        model === "deepseek"
          ? "deepseek/deepseek-r1:free"
          : "qwen/qwen-2.5-instruct:free",

      messages: [{ role: "user", content: prompt }],
    };
  }

  if (model === "groq") {
    // Groq Llama3.1 70B
    url = "https://api.groq.com/openai/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    };

    body = {
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    };
  }

  if (model === "gemini") {
    // Google Gemini Flash 1.5
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
      import.meta.env.VITE_GOOGLE_KEY
    }`;

    headers = { "Content-Type": "application/json" };

    body = {
      contents: [{ parts: [{ text: prompt }] }],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // Normalize all model outputs
  if (model === "gemini") {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
  } else {
    return data.choices?.[0]?.message?.content || "No output";
  }
}
