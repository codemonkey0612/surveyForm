// api/webhook.js — Vercel Serverless Function
// ─────────────────────────────────────────────────────────────
// IMPORTANT: CommonJS syntax only (require/module.exports)
// DO NOT use import/export — that causes the ESM compile error
// ─────────────────────────────────────────────────────────────

// ⚠️ SET THIS to your GAS deployment URL after deploying GAS
// GASエディタ → デプロイ → 新しいデプロイ → ウェブアプリ → URLをコピー
const GAS_ENDPOINT = process.env.GAS_ENDPOINT || "https://script.google.com/macros/s/AKfycbyWhv_1z9aLbWCbtF1Z74i6kTzlmg8317mDfr4o1AwgRt5aVikxt5o7hhKG8rpOjiz58g/exec";

module.exports = async function handler(req, res) {
  // CORS headers — allow LINE LIFF / browsers to POST
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);

    // Forward to GAS
    const gasRes = await fetch(GAS_ENDPOINT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    body,
      redirect: "follow",
    });

    const text = await gasRes.text();

    // Try to parse as JSON; fall back to text
    let data;
    try { data = JSON.parse(text); }
    catch (_) { data = { raw: text }; }

    return res.status(200).json(data);

  } catch (err) {
    console.error("webhook error:", err);
    return res.status(500).json({ error: err.message });
  }
};
