import Parser from "rss-parser";
import { FEEDS } from "./feeds";

export type NewsItem = {
  title: string;
  link: string;
  pubDate?: string;
  source: string;
};

const parser = new Parser({
  timeout: 20000,
  headers: { "User-Agent": "ai-consensus-ui/1.0 (+http://localhost)" },
  // RSS içerik alanlarını daha iyi yakalamak için:
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["content", "contentRaw"],
      ["description", "description"],
      ["summary", "summary"],
    ],
  },
});

// --- URL normalize (www. ile başlayan feed'ler parseURL'de patlıyor) ---
function normalizeFeedUrl(url: string) {
  const u = (url || "").trim();
  if (!u) return u;

  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("www.")) return `https://${u}`;
  return u; // yine de denesin
}

// --- keyword/regex (TR+EN) ---
const BTC_REGEXES: RegExp[] = [
  /\bbitcoin\b/i,
  /\bbtc\b/i,
  /\bsatoshi\b/i,
  /\bblockchain\b/i,
  /\bkripto\b/i,
  /\bkripto\s*para\b/i,
  /\bkripto\s*varl[ıi]k\b/i,
  /\bdijital\s*para\b/i,
  /\bhalving\b/i,
  /\betf\b/i,
  /\bspot\s*etf\b/i,
  /\bblackrock\b/i,
  /\bfidelity\b/i,
  /\bbinance\b/i,
  /\bcoinbase\b/i,
  /\bweb3\b/i,
];

function containsBitcoin(text: string) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return false;
  return BTC_REGEXES.some((re) => re.test(t));
}

function safeText(v: any) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v);
}

function pickLink(it: any) {
  // bazı RSS’lerde link yerine guid var
  const link = safeText(it.link) || safeText(it.guid) || safeText(it.id);
  return link;
}

function pickContent(it: any) {
  // title dışında yakalayabildiğimiz her şeyi birleştiriyoruz
  return [
    safeText(it.contentSnippet),
    safeText((it as any).contentEncoded),
    safeText((it as any).contentRaw),
    safeText((it as any).description),
    safeText((it as any).summary),
    safeText(it.content),
  ]
    .filter(Boolean)
    .join(" ");
}

function toNewsItems(feed: any, url: string): NewsItem[] {
  const source = safeText(feed?.title) || url;

  return (feed?.items || []).map((it: any) => {
    const title = safeText(it.title);
    const link = pickLink(it);
    const pubDate = safeText(it.pubDate || it.isoDate || it.published || "");
    return { title, link, pubDate, source };
  });
}

// --- tek feed parse + retry ---
async function parseFeedWithRetry(url: string) {
  const u = normalizeFeedUrl(url);

  try {
    return await parser.parseURL(u);
  } catch (e1) {
    // 1 kere daha dene (bazı feed’lerde ilk deneme fail olabiliyor)
    try {
      return await parser.parseURL(u);
    } catch (e2) {
      return null;
    }
  }
}

function parseDateScore(d?: string) {
  if (!d) return 0;
  const ms = Date.parse(d);
  return Number.isFinite(ms) ? ms : 0;
}

export async function fetchBitcoinNews(limit = 60): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  const feeds = await Promise.allSettled(
    FEEDS.map(async (rawUrl) => {
      const feed = await parseFeedWithRetry(rawUrl);
      if (!feed) return [];

      const url = normalizeFeedUrl(rawUrl);
      const items = toNewsItems(feed, url);

      // filtre: title + link + content alanlarından arıyoruz
      const filtered: NewsItem[] = [];
      for (const it of feed.items || []) {
        const title = safeText(it.title);
        const link = pickLink(it);
        const pubDate = safeText(it.pubDate || it.isoDate || it.published || "");
        const source = safeText(feed.title) || url;

        if (!title || !link) continue;

        const content = pickContent(it);
        const hay = `${title} ${link} ${content}`;

        if (containsBitcoin(hay)) {
          filtered.push({ title, link, pubDate, source });
        }
      }

      // hiç content yakalanamadıysa en azından basic items listesini dene
      if (filtered.length === 0) {
        for (const basic of items) {
          const hay = `${basic.title} ${basic.link}`;
          if (containsBitcoin(hay)) filtered.push(basic);
        }
      }

      return filtered;
    })
  );

  for (const f of feeds) {
    if (f.status === "fulfilled") {
      for (const item of f.value) {
        if (!item.link || !item.title) continue;
        results.push(item);
      }
    }
  }

  // unique (link bazlı)
  const seen = new Set<string>();
  const unique = results.filter((x) => {
    const key = x.link.trim();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // yeni -> eski
  unique.sort((a, b) => parseDateScore(b.pubDate) - parseDateScore(a.pubDate));

  return unique.slice(0, limit);
}