# AI Quartet — Four AI Models Comparison

A professional full-stack application to compare responses from four AI models (Gemma2, Google Gemini 2.0 Flash, DeepSeek, and LLaMA 3.3) in real-time, side-by-side.

**Stack**: React 19 + Vite 7.2 (frontend) | Express 5.1 + Node.js (backend) | Tailwind CSS 3.4 | Axios for API calls.

**Features**: Premium neon/dark UI with animated gradients, ultra-modern toggle switch, scrollable response cards, per-card copy buttons with clipboard fallbacks, dark mode persistence, DEV_MOCK mode for testing, and robust API error handling.

---

## Key Features

### Frontend (React + Vite + Tailwind)
- **4 AI Model Cards** side-by-side in a responsive grid (mobile: 1 col, tablet: 2 cols, desktop: 4 cols)
- **Dark Mode Toggle** with smooth animations and localStorage persistence
- **Neon Mesh Gradient Background** with 15-second animation loop (pink, cyan, purple, blue)
- **Premium Card Design**: gradient borders, glow effects, hover lift animations, flex-based scrollable response areas
- **Scrollable Response Text**: full overflow support within fixed-height cards so long responses are readable
- **Selectable Text**: `user-select: text` CSS ensures responses can be selected manually
- **Copy Button per Card**: small unobtrusive button that copies the response to clipboard; falls back to DOM text if needed
- **Frosted Glass Input Bar**: backdrop blur + saturate, neon glow on focus, responsive layout
- **Real-time Loading States**: animated spinner with "Thinking..." text while awaiting responses
- **Error Display**: per-model error messages in red when API calls fail

### Backend (Express + Node)
- **4 Model Endpoints** behind a single `/api/query` POST endpoint
- **Normalized Response Format**: all models return `{ success, model, output, error, timestamp }`
- **Per-Model Error Handling**: specific error messages for each provider (API key missing, deprecated models, etc.)
- **DEV_MOCK Mode**: when `DEV_MOCK=true`, simulated responses replace errors so you can test UI without real API access
- **Health Check Endpoint**: `GET /health` reports server status, configured API keys, and DEV_MOCK flag
- **30-second Request Timeout**: prevents hanging requests; CORS enabled for frontend communication
- **Model Support**:
  - **OpenAI** → Groq's Llama 3.1 8B Instant (fast, free tier available)
  - **Gemini** → Google Gemini 2.0 Flash (official Google API)
  - **DeepSeek** → Groq's LLaMA 3.3 70B Versatile
  - **Groq** → Groq's LLaMA 3.3 70B Versatile

---

## Project Structure

```
ai-four-model/
├── backend/
│   ├── server.js               # Express server with 4 model endpoints
│   ├── package.json            # Backend dependencies (express, axios, cors, dotenv)
│   ├── .env                    # Environment: GROQ_API_KEY, GEMINI_API_KEY, PORT, DEV_MOCK
│   └── node_modules/           # (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── FourModelCompare.jsx    # Main UI (dark mode, cards, copy, scroll)
│   │   ├── index.css                   # Global styles, neon theme, CSS variables
│   │   ├── main.jsx                    # React entry point
│   │   └── App.jsx                     # Renders FourModelCompare
│   ├── package.json            # Frontend dependencies (react, vite, tailwind, axios)
│   ├── tailwind.config.js      # Tailwind theme config
│   ├── vite.config.js          # Vite build config
│   ├── index.html              # HTML entry point
│   └── public/                 # Static assets
├── package.json                # Root scripts (dev, build)
├── README.md                   # This file
├── DARK_MODE_NEON_REPORT.md   # Detailed dark mode implementation notes
├── INTEGRATION_REPORT.md       # API integration and normalization details
└── FULLSTACK_FIXES_REPORT.md  # Bug fixes from initial development
```

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (included with Node) or **yarn**
- **API Keys** (optional with DEV_MOCK):
  - GROQ API key from [console.groq.com](https://console.groq.com) (required for OpenAI model endpoint, and used for DeepSeek/Groq)
  - Google Gemini API key from [ai.google.dev](https://ai.google.dev) (for Gemini model)

---

## Installation & Setup

### 1. Clone and Navigate
```powershell
cd d:\NG-AI\ai-four-model
```

### 2. Install Dependencies
**Backend**:
```powershell
cd backend
npm install
```

**Frontend**:
```powershell
cd ..\frontend
npm install
```

### 3. Configure Environment Variables

Create `backend/.env` with your API keys:

```env
GEMINI_API_KEY=<your-gemini-key>
GROQ_API_KEY=<your-groq-key>
PORT=5000
DEV_MOCK=true
```

**Note**: 
- `OPENAI_API_KEY` is not needed; the OpenAI model endpoint uses Groq's LLaMA instead.
- `GROQ_API_KEY` is required for all three Groq-based endpoints (OpenAI model, DeepSeek, Groq).
- `GEMINI_API_KEY` is required for the Gemini model endpoint.
- `DEV_MOCK=true` makes the server return simulated responses when external APIs fail (great for testing UI without live keys).
- **Security**: Never commit `.env` with real keys to git. A `.gitignore` entry for `.env` is already in place.

### 4. Run Servers

**Option A: Run both servers concurrently (from project root)**
```powershell
cd d:\NG-AI\ai-four-model
npm run dev
```
This runs `concurrently` to start backend on port 5000 and frontend on the next available port (5173+).

**Option B: Run separately (recommended for debugging)**

Terminal 1 — Backend:
```powershell
cd d:\NG-AI\ai-four-model\backend
npm start
```
Backend will log:
```
🚀 Server running on port 5000
🔗 Health check: http://localhost:5000/health
```

Terminal 2 — Frontend:
```powershell
cd d:\NG-AI\ai-four-model\frontend
npm run dev
```
Vite will log:
```
  VITE v7.2.2  ready in X ms
  ➜  Local:   http://localhost:5173/
```

### 5. Open the App

Visit the URL from Vite output (typically `http://localhost:5173`). The frontend automatically detects the backend at `http://localhost:5000/api/query`.

---

## How to Use

1. **Type a Question**: Enter any prompt in the frosted-glass input bar at the bottom.
2. **Click "Ask"**: All 4 models receive the same question and respond in parallel.
3. **Wait for Responses**: Each card shows a spinning loader while waiting.
4. **Read Responses**: Scroll within each card if the response is longer than the visible area.
5. **Copy a Response**: Click the small `Copy` button (top-right of each card) to copy that model's response to clipboard. Or manually select and copy text.
6. **Toggle Dark Mode**: Click the animated switch in the header to toggle between light and dark themes (preference is saved).

---

## API Reference

### Health Check

```
GET http://localhost:5000/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T...",
  "apiKeysConfigured": {
    "openai": false,
    "gemini": true,
    "groq": true
  },
  "devMock": true
}
```

### Query Endpoint

```
POST http://localhost:5000/api/query
Content-Type: application/json

{
  "model": "openai",  // or "gemini", "deepseek", "groq"
  "prompt": "Your question here"
}
```

**Success Response**:
```json
{
  "success": true,
  "model": "openai",
  "output": "Response text from the model...",
  "error": null,
  "timestamp": "2025-11-20T..."
}
```

**Error Response (example: missing API key)**:
```json
{
  "success": false,
  "model": "gemini",
  "output": "",
  "error": "GEMINI_API_KEY missing",
  "timestamp": "2025-11-20T..."
}
```

**DEV_MOCK Fallback** (when `DEV_MOCK=true` and API fails):
```json
{
  "success": true,
  "model": "openai",
  "output": "Mock response for openai: Gemma2 unavailable (...). This is a simulated reply.",
  "error": null,
  "timestamp": "2025-11-20T..."
}
```

---

## Frontend Features Deep Dive

### Dark Mode
- Click the toggle switch in the header to toggle dark/light mode.
- Preference is persisted in `localStorage` under key `"darkMode"`.
- CSS variables in `index.css` define colors for both modes.
- Theme class `.dark` is applied to the `html` element; Tailwind reads this for `dark:` utilities.

### Scrolling
- Each model card container uses `flex flex-col min-h-0` so the inner response area can scroll independently.
- Response area has `overflow-auto` class; long text automatically shows a scrollbar.
- Text inside is `user-select: text` so manual selection works.

### Copy Button
- Small, unobtrusive button positioned top-right in each card title.
- Copies the `output` field from the backend response (or falls back to visible DOM text if needed).
- Shows "Copy" by default; changes to "Copied!" for 1.5 seconds after a successful copy, or "Failed" if copy errors.
- Uses `navigator.clipboard.writeText()` where available; falls back to a temporary `textarea` with `execCommand('copy')` for older browsers.

### Loading & Errors
- While waiting for responses, each card shows an animated spinner + "Thinking..." text centered in the response area.
- On error, the response area displays the error message in red.
- Network errors are caught and shown to the user.

---

## Styling & Theme

### CSS Variables (index.css)
```css
:root {
  --bg-1, --bg-2: background gradients
  --text: text color
  --primary: primary accent
  --neon-pink, --neon-cyan, --neon-purple, --neon-blue: premium colors
}

.dark {
  /* dark mode overrides */
}
```

### Tailwind Config
- Configured in `tailwind.config.js` with `darkMode: "class"`
- Extended with custom color definitions and font families

### Neon Mesh Gradient
- Defined in `index.css` with a `@keyframes mesh-gradient` animation
- Runs continuously in the background layer
- Different opacity in dark mode for better contrast

---

## Troubleshooting

### Frontend shows "Awaiting input..." but no responses appear
**Check**:
1. Backend is running: visit `http://localhost:5000/health`
2. Browser console (F12 → Console) for network errors
3. Backend terminal for error logs
4. If using real API keys: verify they're valid and have quota remaining
5. If using `DEV_MOCK=true`: restart backend after changing `.env`

### Copy button shows "Failed"
**Likely causes**:
- Browser sandboxing prevents clipboard writes (some browsers in strict cross-origin contexts)
- Workaround: manually select and `Ctrl+C` or right-click → Copy

### Model responses are slow or timeout
- Model API providers can be slow; the frontend waits up to 45 seconds before showing a timeout error
- Backend has a 30-second per-request timeout to the external API
- Check the external provider's status page

### "Model deprecated" error
**Example**: "llama-3.3-70b-versatile has been decommissioned"
**Solution**: 
1. Visit the provider's docs (e.g., [console.groq.com](https://console.groq.com))
2. Check available model IDs
3. Update `backend/server.js` with the new model name
4. Restart the backend

### Port already in use
**Frontend**: Vite automatically tries the next port (5174, 5175, etc.)
**Backend**: Change `PORT` in `.env` and restart

---

## Development Notes

### Key Files
- `frontend/src/components/FourModelCompare.jsx`: Main React component (dark mode state, submit handler, copy logic, JSX layout)
- `frontend/src/index.css`: All global styles, neon theme, CSS variables, animations
- `backend/server.js`: Express app with `/health` and `/api/query` endpoints

### Testing Copy & Scroll Without Real APIs
1. Set `DEV_MOCK=true` in `backend/.env`
2. Restart backend
3. Ask a question in the UI
4. Each card shows a simulated response
5. Test scrolling by asking long questions
6. Test copy button on the mock responses

### Adding a New Model
1. Add endpoint handler in `backend/server.js` (new `else if` branch in the switch)
2. Add model key to `const modelKeys` in `frontend/src/components/FourModelCompare.jsx`
3. Add emoji/name mapping in the JSX render logic
4. Restart both servers

---

## Build for Production

### Frontend
```powershell
cd frontend
npm run build
```
Outputs to `frontend/dist/`. Host these files on a static server or CDN.

### Backend
Keep `server.js` running in a Node.js process manager (e.g., PM2, Docker, etc.)

---

## References & Links

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js](https://expressjs.com)
- [Groq API](https://console.groq.com)
- [Google Gemini API](https://ai.google.dev)
- [Axios Docs](https://axios-http.com)

---

## License & Notes

This project is for educational and demonstration purposes. Ensure API keys are kept secure and never committed to public repositories.

For questions or improvements, refer to the detailed reports:
- `DARK_MODE_NEON_REPORT.md` — Dark mode and neon visual implementation
- `INTEGRATION_REPORT.md` — Full-stack API integration details
- `FULLSTACK_FIXES_REPORT.md` — Bug fixes and improvements made

---

**Last Updated**: November 20, 2025  
**Status**: Fully functional with DEV_MOCK support for testing
