# Taboo

A playful Chrome extension that looks at your open tabs and roasts your browsing habits with AI.

Tab analyzer = facts. Gemini = the joke.

## Project structure

```text
TABOO/
├── extension/          # Chrome extension (Manifest V3)
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── manifest.json
│   ├── icons/
│   └── js/
│       ├── tabAnalyzer.js
│       └── contextBuilder.js
└── server/             # Local Express backend
    ├── server.js
    ├── services/geminiService.js
    └── .env            # GEMINI_API_KEY (not committed)
```

## Setup

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
GEMINI_API_KEY=your_key_here
```

Start the server:

```bash
npm start
```

You should see it running on `http://localhost:3000`.

### 2. Extension

1. Open Chrome → `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `extension` folder
5. Pin Taboo from the extensions menu

## How to use

1. Keep the server running
2. Open a few tabs (the messier, the better)
3. Click the Taboo icon → **Roast me**

## Privacy notes (MVP)

- The extension reads tab **titles** and **domains** (not page content)
- Raw URLs are not sent to the AI context
- Email-looking text in titles is redacted
- The Gemini API key stays on the server only
- Large tab sets are trimmed before sending

## Learning map

| Piece | Job |
|-------|-----|
| `tabAnalyzer.js` | Count tabs, domains, duplicates |
| `contextBuilder.js` | Build a privacy-aware AI payload |
| `popup.js` | UI + talk to the backend |
| `server.js` | Validate requests, protect the API key |
| `geminiService.js` | Prompt Gemini and return a roast |

## Requirements

- Node.js 18+
- Chrome (Manifest V3)
- A Gemini API key
