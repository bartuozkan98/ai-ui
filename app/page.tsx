"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [includeNews, setIncludeNews] = useState(true);

  async function send() {
    if (!input.trim()) return;
    setLoading(true);
    setData(null);

    const r = await fetch("/api/consensus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: input,
        includeNews // ✅ bunu yolluyoruz
      })
    });

    const result = await r.json();
    setData(result);
    setLoading(false);
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>AI Consensus UI</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 10 }}
        placeholder="Soru yaz..."
      />

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={includeNews}
            onChange={(e) => setIncludeNews(e.target.checked)}
          />
          Haberleri (RSS) dahil et
        </label>
      </div>

      <button
        onClick={send}
        style={{ marginTop: 10, padding: "10px 20px" }}
      >
        {loading ? "Çalışıyor..." : "Gönder"}
      </button>

      {data && (
        <div style={{ marginTop: 30 }}>
          <h2>İşlem Günlüğü</h2>
          <ul>
            {(data.logs || []).map((log: string, i: number) => (
              <li key={i}>{log}</li>
            ))}
          </ul>

          <h2>Sonuç</h2>
          <pre style={{ background: "#f5f5f5", padding: 20 }}>
            {JSON.stringify(data.result, null, 2)}
          </pre>

          <h3>Ham Cevap (Debug)</h3>
          <pre style={{ background: "#f0f0f0", padding: 20 }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}