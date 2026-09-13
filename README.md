# Taboo

A playful Chrome extension that looks at your open tabs and roasts your browsing habits with AI.

Tab analyzer = facts. Gemini = the joke.

## Project structure

```text
TABOO/
├── extension/          # Chrome extension (Manifest V3)
│   ├── popup.*         # UI
│   ├── js/config.js    # API URL lives here
│   └── js/             # tabAnalyzer + contextBuilder
├── worker/             # Cloudflare Worker API (recommended deploy)
└── server/             # Optional local Express API (learning/debug)
```

## Deploy for free (Cloudflare Workers)

### 1. Install + login

```bash
cd worker
npm install
npx wrangler login
```

This opens a browser so you can authorize Cloudflare (free account).

### 2. Put your Gemini key in Workers secrets

```bash
npm run secret:gemini
```

Paste your `GEMINI_API_KEY` when prompted.  
It is stored by Cloudflare — not in git.

### 3. Deploy

```bash
npm run deploy
```

Copy the URL Wrangler prints, like:

```text
https://taboo-api.<your-subdomain>.workers.dev
```

Test in a browser:

```text
https://taboo-api.<your-subdomain>.workers.dev/
```

You should see `{ "message": "Taboo Worker is alive" }`.

### 4. Point the extension at the Worker

Edit `extension/js/config.js`:

```js
export const API_BASE_URL = "https://taboo-api.<your-subdomain>.workers.dev";
```

Reload the extension on `chrome://extensions`.

### 5. Roast

Click **Roast me**. No local Node server needed.

## Share with friends ($0 — no Chrome Web Store)

1. Keep the Worker deployed  
2. Zip the `extension` folder (with your Worker URL already in `config.js`)  
3. They: `chrome://extensions` → Developer mode → **Load unpacked**

No Store fee required.

## Local Express (optional)

```bash
cd server
npm install
npm start
```

Use in `extension/js/config.js`:

```js
export const API_BASE_URL = "http://localhost:3000";
```

## Privacy notes (MVP)

- Reads tab **titles** and **domains** (not page content)
- Raw URLs are not sent to the AI context
- Email-looking text in titles is redacted
- Gemini API key stays in Worker secrets / server `.env` only
- Large tab sets are trimmed before sending

## Learning map

| Piece | Job |
|-------|-----|
| `tabAnalyzer.js` | Count tabs, domains, duplicates |
| `contextBuilder.js` | Build a privacy-aware AI payload |
| `popup.js` + `config.js` | UI + call the API URL |
| `worker/` | Free hosted API (validation + Gemini) |
| `server/` | Same idea, local Express |

## Requirements

- Node.js 18+
- Chrome (Manifest V3)
- Free Cloudflare account
- A Gemini API key
