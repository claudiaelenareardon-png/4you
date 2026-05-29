# 4you — AI Content Creator

Upload photos/videos → AI generates captions & hashtags → Post to TikTok & Instagram.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel (free, 2 minutes)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project
3. Import your repo → click Deploy
4. Done — your app is live

## Deploy to Netlify (alternative)

1. Run `npm run build` — creates a `dist/` folder
2. Go to https://netlify.com → drag & drop the `dist/` folder
3. Done

## Connect real AI (Anthropic API)

In `src/App.jsx`, replace the `GENERATED_VERSIONS` constant with a real API call:

```js
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Generate 3 social media caption versions (TikTok hook, Instagram story, short bold) 
      with hashtags for this content: ${fileDescriptions}. 
      Return JSON array with: platforms, title, caption, hashtags.`
    }]
  })
});
```

Add your key to `.env`:
```
VITE_ANTHROPIC_API_KEY=your_key_here
```

## Connect TikTok & Instagram

- TikTok API: https://developers.tiktok.com
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api

Both require OAuth — use a backend (Vercel serverless functions work great).
