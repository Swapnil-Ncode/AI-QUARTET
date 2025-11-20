export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeysConfigured: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
    },
    devMock: process.env.DEV_MOCK === "true",
  });
}
