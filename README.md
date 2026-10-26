# EPUB → Myanmar Translator (Vercel)

## Deploy
1. Create a GitHub repo, push these files (`git init && git add . && git commit -m init && git push`).
2. vercel.com → Add New Project → import the repo (Framework: Other, no build command).
3. Settings → Environment Variables: `ANTHROPIC_API_KEY`, `APP_PASSWORD`, optional `MODEL`.
4. Redeploy. Open the URL, upload EPUB, translate, download `*.my.epub`.

## Local / Claude Code
```
npm i -g vercel
cp .env.example .env.local
vercel dev
claude   # then ask Claude Code to extend the app
```
