export const runtime = "nodejs";

import axios from "axios";
import { fetchBitcoinNews } from "../../lib/rss";

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = [
  "openai/gpt-4.1",
  "google/gemini-2.5-pro",
  "anthropic/claude-sonnet-4.6",
  "x-ai/grok-4.1-fast",
  "deepseek/deepseek-r1",
  "meta-llama/llama-4-maverick",
  "google/gemini-2.5-flash",
  "openai/gpt-4.1-mini",
  "mistralai/mistral-large"
];

function buildModelSystemPrompt() {
  return (
    "Haber + sosyal medya (Twitter/X) bağlamında kısa analiz yap.\n" +
    "ÇIKTI SADECE JSON OLSUN. Markdown yok, açıklama yok.\n\n" +
    "JSON ŞEMASI:\n" +
    "{\n" +
    '  "overall_bias": "bullish|bearish|neutral",\n' +
    '  "confidence": 0.0,\n' +
    '  "summary": "kısa 1-3 cümle"\n' +
    "}\n"
  );
}

function extractJson(text) {
  if (!text) return null;

  let t = String(text).trim();

  // ```json ... ``` temizle (başta/sonda)
  t = t.replace(/^```(?:json)?/i, "").trim();
  t = t.replace(/```$/i, "").trim();

  // metnin içinde JSON varsa yakala
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  const candidate = t.slice(firstBrace, lastBrace + 1).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalize(obj) {
  const out = { overall_bias: "neutral", confidence: 0.5, summary: "" };

  if (obj && typeof obj === "object") {
    if (typeof obj.overall_bias === "string") out.overall_bias = obj.overall_bias.toLowerCase();
    if (typeof obj.confidence === "number") out.confidence = obj.confidence;
    if (typeof obj.summary === "string") out.summary = obj.summary;
  }

  if (!["bullish", "bearish", "neutral"].includes(out.overall_bias)) out.overall_bias = "neutral";

  if (typeof out.confidence !== "number" || Number.isNaN(out.confidence)) out.confidence = 0.5;
  if (out.confidence < 0) out.confidence = 0;
  if (out.confidence > 1) out.confidence = 1;

  return out;
}

function computeConsensus(validModels) {
  const counts = { bullish: 0, bearish: 0, neutral: 0 };
  let sumConf = 0;

  for (const m of validModels) {
    counts[m.data.overall_bias]++;
    sumConf += m.data.confidence;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const overall_bias = sorted[0]?.[0] || "neutral";

  const confidence = validModels.length ? sumConf / validModels.length : 0.5;

  return { overall_bias, confidence, counts };
}

function buildFinalComment(question, consensus, counts, summaries) {
  const total = counts.bullish + counts.bearish + counts.neutral;

  const directionText =
    consensus.overall_bias === "bullish"
      ? "Yukarı yönlü eğilim daha baskın."
      : consensus.overall_bias === "bearish"
      ? "Aşağı yönlü riskler daha baskın."
      : "Net bir yön baskın değil (kararsız / dengeli).";

  const fullReasons = summaries
    .map((s) => s.summary)
    .filter(Boolean)
    .slice(0, 2)
    .join(" | ");

  return (
    `Soru: "${question}". ` +
    `Genel karar: ${consensus.overall_bias.toUpperCase()} (güven: ${Number(consensus.confidence).toFixed(2)}). ` +
    `Dağılım: bullish ${counts.bullish}/${total}, bearish ${counts.bearish}/${total}, neutral ${counts.neutral}/${total}. ` +
    directionText +
    (fullReasons ? ` Öne çıkan gerekçeler: ${fullReasons}` : "")
  );
}

async function callOpenRouter(model, question, apiKey) {
  const r = await axios.post(
    OR_URL,
    {
      model,
      messages: [
        { role: "system", content: buildModelSystemPrompt() },
        { role: "user", content: question }
      ],
      max_tokens: 650,
      temperature: 0.2
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "ai-consensus-ui"
      },
      timeout: 120000
    }
  );

  return r.data?.choices?.[0]?.message?.content?.trim() || "";
}

async function buildBitcoinNewsBlock(logs) {
  try {
    logs.push("Bitcoin RSS çekiliyor (60)...");

    const startedAt = Date.now();
    const news = await fetchBitcoinNews(60);
    const ms = Date.now() - startedAt;

    logs.push(`Bitcoin haber bulundu: ${news.length} (RSS süre: ${ms}ms)`);

    // DEBUG: ilk 10 başlığı yaz (UI'da görürsün)
    if (news && news.length) {
      logs.push("---- İlk 10 BTC haberi (debug) ----");
      news.slice(0, 10).forEach((n, i) => {
        logs.push(`${i + 1}) ${n.title}`);
      });
      logs.push("----------------------------------");
    }

    if (!news || !news.length) return "";

    return (
      "\n\nAŞAĞIDAKİ BITCOIN HABERLERİNE GÖRE ANALİZ YAP:\n" +
      news
        .map(
          (n, i) =>
            `${i + 1}. ${n.title} | ${n.source || ""} | ${n.pubDate || ""} | ${n.link || ""}`
        )
        .join("\n")
    );
  } catch (e) {
    logs.push(`RSS hata: ${e?.message || "rss_failed"}`);
    return "";
  }
}

export async function POST(req) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OPENROUTER_API_KEY yok. ai-ui/.env.local içine ekle." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const question = (body.question || "").trim();
  const includeNews = Boolean(body.includeNews);

  if (!question) {
    return Response.json({ error: "question boş olamaz" }, { status: 400 });
  }

  const logs = [];
  logs.push("Modeller başlatıldı");

  let newsBlock = "";
  if (includeNews) {
    newsBlock = await buildBitcoinNewsBlock(logs);
  }

  const tasks = MODELS.map(async (model) => {
    logs.push(`${model} başladı`);

    try {
      // 1) normal çağrı
      let raw = await callOpenRouter(model, question + newsBlock, apiKey);
      let parsed = extractJson(raw);

      // 2) parse olmazsa 1 kez retry
      if (!parsed) {
        logs.push(`${model} parse hata (retry deneniyor)`);

        const retryQuestion =
          (question + newsBlock) +
          "\n\nNOT: Tek parça, eksiksiz JSON gönder. Markdown kullanma. JSON dışında hiçbir şey yazma.";

        raw = await callOpenRouter(model, retryQuestion, apiKey);
        parsed = extractJson(raw);
      }

      if (!parsed) {
        logs.push(`${model} parse hata`);
        return { model, ok: false, error: "JSON parse edilemedi", raw };
      }

      const data = normalize(parsed);
      logs.push(`${model} tamamlandı`);
      return { model, ok: true, data, raw };
    } catch (e) {
      const msg = e?.response?.data?.error?.message || e?.message || "request_failed";
      logs.push(`${model} hata: ${msg}`);
      return { model, ok: false, error: msg, raw: "" };
    }
  });

  const results = await Promise.all(tasks);
  logs.push("Tüm modeller tamamlandı");

  const valid = results.filter((r) => r.ok && r.data);
  const valid_count = valid.length;

  if (!valid_count) {
    return Response.json({
      question,
      logs,
      results,
      valid_count,
      result: {
        valid_count: 0,
        consensus: { overall_bias: "neutral", confidence: 0.5 },
        models: [],
        summaries: [],
        final_comment: "Hiçbir modelden geçerli JSON alınamadı."
      }
    });
  }

  const { overall_bias, confidence, counts } = computeConsensus(valid);

  const models = results.map((r) => ({
    model: r.model,
    ok: r.ok,
    overall_bias: r.ok ? r.data.overall_bias : null,
    confidence: r.ok ? r.data.confidence : null,
    error: r.ok ? null : r.error
  }));

  const summaries = valid.map((r) => ({
    model: r.model,
    summary: r.data.summary
  }));

  const consensus = { overall_bias, confidence };
  const final_comment = buildFinalComment(question, consensus, counts, summaries);

  return Response.json({
    question,
    logs,
    results,
    valid_count,
    result: {
      valid_count,
      consensus,
      models,
      summaries,
      final_comment
    }
  });
}