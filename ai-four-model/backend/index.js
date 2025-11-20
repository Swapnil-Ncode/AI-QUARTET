// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Helper functions for each provider
async function callOpenAI(prompt) {
  // OpenAI Responses API (example). Ensure OPENAI_KEY is set in .env
  const url = process.env.OPENAI_URL || 'https://api.openai.com/v1/responses';
  const key = process.env.OPENAI_KEY;
  const payload = {
    model: process.env.OPENAI_MODEL || 'o1-mini', // default to o1-mini
    input: prompt
  };

  const res = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    timeout: 15000
  });

  // Normalization: adapt to the provider response shape
  // For OpenAI Responses API: res.data.output[0].content or res.data.output_text may vary
  // Try common fields safely:
  const data = res.data;
  // try multiple fallback paths
  const text = (data.output && data.output[0] && data.output[0].content && data.output[0].content[0] && data.output[0].content[0].text)
    || data.output_text
    || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
    || JSON.stringify(data).slice(0, 2000);

  return { text, raw: data };
}

async function callGemini(prompt) {
  // Google Generative Language / Gemini example
  // This uses a Google API key (GOOGLE_API_KEY). Some users use OAuth/service accounts instead.
  const key = process.env.GOOGLE_API_KEY;
  const url = process.env.GOOGLE_URL ||
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GOOGLE_MODEL || 'gemini-1.5-flash'}:generateText?key=${key}`;

  const payload = {
    // This structure may vary; many docs use `prompt` or `messages` / `input`.
    prompt: {
      text: prompt
    }
  };

  const res = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000
  });

  const data = res.data;
  // Best-effort extract
  const text = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content[0] && data.candidates[0].content[0].text)
    || data.candidates?.[0]?.output || JSON.stringify(data).slice(0, 2000);

  return { text, raw: data };
}

async function callDeepSeek(prompt) {
  // Example via OpenRouter (DeepSeek hosted there). Use OPENROUTER_KEY
  const url = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const key = process.env.OPENROUTER_KEY;
  const payload = {
    model: process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-r1:free',
    messages: [{ role: 'user', content: prompt }]
  };

  const res = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    timeout: 20000
  });

  const data = res.data;
  // typical OpenRouter shape: data.choices[0].message.content
  const text = data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 2000);
  return { text, raw: data };
}

async function callGroq(prompt) {
  // Groq Cloud / Groq OpenAI-compatible endpoint example
  const url = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
  const key = process.env.GROQ_KEY;
  const payload = {
    model: process.env.GROQ_MODEL || 'mixtral-8x7b', // adapt if needed
    messages: [{ role: 'user', content: prompt }]
  };

  const res = await axios.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    timeout: 20000
  });

  const data = res.data;
  const text = data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 2000);
  return { text, raw: data };
}

// Main endpoint: receive prompt, send to all 4 providers concurrently
app.post('/api/ask', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    // kick off all calls in parallel
    const calls = [
      callOpenAI(prompt).then(r => ({ model: 'openai', ok: true, ...r })).catch(e => ({ model: 'openai', ok: false, text: `Error: ${e.message}` })),
      callGemini(prompt).then(r => ({ model: 'gemini', ok: true, ...r })).catch(e => ({ model: 'gemini', ok: false, text: `Error: ${e.message}` })),
      callDeepSeek(prompt).then(r => ({ model: 'deepseek', ok: true, ...r })).catch(e => ({ model: 'deepseek', ok: false, text: `Error: ${e.message}` })),
      callGroq(prompt).then(r => ({ model: 'groq', ok: true, ...r })).catch(e => ({ model: 'groq', ok: false, text: `Error: ${e.message}` })),
    ];

    const results = await Promise.all(calls);

    // build normalized response
    const payload = {
      results: results.reduce((acc, r) => {
        acc[r.model] = { ok: r.ok, text: r.text, raw: r.raw };
        return acc;
      }, {})
    };

    return res.json(payload);
  } catch (err) {
    console.error('Server error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
