import React, { useState, useEffect } from "react";

export default function FourModelCompare() {
  const [question, setQuestion] = useState("");
  const [loadingModels, setLoadingModels] = useState({});
  const [responses, setResponses] = useState({});
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  const modelKeys = ["openai", "gemini", "deepseek", "groq"];


  // Apply dark mode to html tag and persist preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      const isDark = JSON.parse(saved);
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;

    setResponses({});
    setError(null);
    const loading = {};
    modelKeys.forEach((m) => (loading[m] = true));
    setLoadingModels(loading);

    try {
      const results = {};
      await Promise.all(
        modelKeys.map(async (model) => {
          try {
            const res = await fetch("http://localhost:5000/api/query", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ model, prompt: question }),
            });
            const data = await res.json();
            results[model] = data;
          } catch (err) {
            results[model] = { success: false, error: err.message, output: "" };
          }
        })
      );
      setResponses(results);
    } catch (err) {
      setError(err.message);
    }

    const done = {};
    modelKeys.forEach((m) => (done[m] = false));
    setLoadingModels(done);
  };

  // copy handler for card responses
  const handleCopy = async (key) => {
    const resp = responses[key];
    let textToCopy = resp?.success ? (resp.output || "") : (resp?.error || "");
    // Fallback: read visible text from the DOM in case response shape differs
    if (!textToCopy) {
      try {
        const el = document.querySelector(`[data-model="${key}"] .response-content`);
        if (el) textToCopy = el.innerText || el.textContent || "";
      } catch (e) {
        /* ignore */
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const ta = document.createElement("textarea");
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopyStatus((s) => ({ ...s, [key]: "Copied!" }));
      setTimeout(() => setCopyStatus((s) => ({ ...s, [key]: "" })), 1500);
    } catch (e) {
      setCopyStatus((s) => ({ ...s, [key]: "Failed" }));
      setTimeout(() => setCopyStatus((s) => ({ ...s, [key]: "" })), 1500);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br 
      from-indigo-100 via-purple-100 to-blue-50
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
      transition-all duration-700">

      {/* 🔥 Neon Mesh Background Blur */}
      <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40">
        <div className="absolute -top-20 left-10 w-96 h-96 bg-indigo-400 rounded-full blur-[150px]"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-[170px]"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-400 rounded-full blur-[150px]"></div>
      </div>

      {/* Neon Mesh Gradient Overlay */}
      <div className="neon-mesh"></div>

      {/* Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-4 mb-8 flex justify-between items-center py-8">
        <div className="flex-1">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-cyan-300 drop-shadow-lg">
            AI Quartet
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Compare 4 AI models in real-time</p>
        </div>

        {/* Ultra-Modern Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`toggle-switch ${darkMode ? "active" : ""}`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        ></button>
      </header>

      {/* Model Cards Grid - Exactly 4 Equal Columns */}
      <main className="relative z-20 max-w-7xl mx-auto 
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 
        pb-40 px-4">

        {modelKeys.map((key) => (
          <div
            key={key}
            data-model={key}
            className="card-glow rounded-2xl p-6 h-80 
              bg-white/70 dark:bg-slate-800/60 
              backdrop-blur-xl 
              shadow-2xl
              flex flex-col min-h-0"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-bold text-left 
                text-slate-700 dark:text-slate-200 uppercase tracking-widest
                text-xs md:text-sm">
                {key === "openai" && "🧠 OpenAI"}
                {key === "gemini" && "✨ Google Gemini"}
                {key === "deepseek" && "🔍 DeepSeek"}
                {key === "groq" && "⚡ Groq"}
              </h2>

              <button
                type="button"
                aria-label={`Copy response for ${key}`}
                onClick={() => handleCopy(key)}
                className="ml-2 px-2 py-1 text-xs rounded-md bg-white/30 dark:bg-black/30 text-slate-700 dark:text-slate-200 border border-white/20 hover:scale-105 transition"
              >
                {copyStatus[key] || 'Copy'}
              </button>
            </div>

            <div className="mt-2 flex-1 overflow-auto text-sm 
              text-slate-700 dark:text-slate-300 whitespace-pre-wrap pr-2 response-content select-text">
              {loadingModels[key] ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin mb-2">
                      <div className="w-6 h-6 border-3 border-transparent border-t-indigo-500 rounded-full"></div>
                    </div>
                    <div className="text-slate-400 text-xs">Thinking...</div>
                  </div>
                </div>
              ) : responses[key] ? (
                responses[key]?.success ? (
                  responses[key]?.output || "No response"
                ) : (
                  <div className="text-red-500 dark:text-red-400">
                    <strong>Error:</strong> {responses[key]?.error || "Unknown error"}
                  </div>
                )
              ) : (
                <span className="text-slate-400 text-sm">Awaiting input...</span>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Input - Frosted Glass Style */}
      <form
        onSubmit={submit}
        className="fixed left-1/2 -translate-x-1/2 bottom-8 w-11/12 max-w-4xl z-30"
      >
        <div className="frosted-input rounded-full p-4 flex items-center gap-4 shadow-2xl">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question for all models..."
            className="flex-1 bg-transparent outline-none px-2 
            text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400
            text-sm md:text-base"
          />
          <button
            type="submit"
            className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-500 hover:to-purple-500
            text-white text-sm font-semibold rounded-full 
            transition-all duration-300
            hover:shadow-lg hover:shadow-purple-500/50
            whitespace-nowrap"
          >
            Ask
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mt-4 text-red-600 dark:text-red-400 text-sm animate-pulse">
            ⚠️ {error}
          </div>
        )}
      </form>
    </div>
  );
}
