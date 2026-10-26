const STYLES = {
  novel: "Modern Burmese fiction style. Narration in natural spoken-literary register (တယ်/ပါတယ်/သည် as a skilled Myanmar novelist would choose, consistent throughout). Dialogue sounds like real Myanmar speakers, with correct politeness levels (ကျွန်တော်/ကျွန်မ/ငါ/မင်း etc.) matched to each character and relationship.",
  literary: "Formal literary Burmese (စာပေစကားပြေ). Use သည်/၏/၍ endings consistently, elegant and fluent like a senior Myanmar writer.",
  nonfiction: "Clear, smooth modern Burmese for non-fiction/essays. Polite, readable, natural; explain ideas the way a Myanmar author would write them."
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (process.env.APP_PASSWORD && req.headers["x-app-password"] !== process.env.APP_PASSWORD)
    return res.status(401).json({ error: "Wrong password" });

  const { texts, style = "novel", glossary = "", context = "" } = req.body || {};
  if (!Array.isArray(texts) || !texts.length) return res.status(400).json({ error: "texts[] required" });

  const system = `You are an award-winning Myanmar (Burmese) literary translator and editor.
Translate the given texts into Myanmar (Unicode) so it reads as if originally written by a native Myanmar writer.
STYLE: ${STYLES[style] || STYLES.novel}
RULES:
- Translate meaning, tone and rhythm, not word-by-word. Restructure sentences naturally; avoid translationese.
- Keep proper names consistent. Transliterate names into Myanmar script unless the glossary says otherwise.
- Keep numbers, punctuation style (။ ၊), and paragraph boundaries. Do not add or omit content.
- Use Myanmar Unicode only (never Zawgyi).
${glossary ? "GLOSSARY (source = Myanmar):\n" + glossary : ""}
${context ? "PREVIOUS PASSAGE (for continuity only, do not translate):\n" + context : ""}
OUTPUT: input is a JSON array of strings. Return ONLY a JSON array of the same length, same order, each item the Myanmar translation. No markdown, no commentary.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-sonnet-5-5",
        max_tokens: 8000,
        system,
        messages: [{ role: "user", content: JSON.stringify(texts) }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "API error" });
    const raw = data.content.map(c => c.text || "").join("");
    const out = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1));
    if (!Array.isArray(out) || out.length !== texts.length) throw new Error("Length mismatch");
    res.status(200).json({ translations: out });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
