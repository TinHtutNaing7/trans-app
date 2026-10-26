# EPUB → Myanmar translator
- Static `index.html` (client-side EPUB unzip/rebuild with JSZip) + `api/translate.js` (Vercel serverless, calls Anthropic).
- No build step. Never expose ANTHROPIC_API_KEY to the browser.
- Goal: natural, native Myanmar writer-style prose, not literal translation.
- Ideas: resume after failure, translate toc.ncx, preserve inline <em>/<b>, Myanmar font embedding.
