import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = 'anthropic/claude-sonnet-4';
const DATA_DIR = path.join(process.cwd(), 'telegram-is-asistani', 'data');
const HAVUZ_PATH = path.join(DATA_DIR, 'asama_havuzu.json');
const IS_AKIS_PATH = path.join(DATA_DIR, 'is_akis_plani.json');
const FIKIRLER_PATH = path.join(DATA_DIR, 'fikirler.json');

function readJson<T>(p: string, fallback: T): T {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) as T; } catch { return fallback; }
}

function writeJson(p: string, data: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function parseExistingStages(planMetni: string): string[] {
  const stages: string[] = [];
  for (const line of planMetni.split('\n')) {
    const t = line.trim();
    if (/^(\*\*|##|#+)/.test(t) || /^\d+\.\s+\*\*/.test(t) || /^\d+\.\s+[A-ZÇĞİÖŞÜ]/.test(t)) {
      stages.push(t.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '').replace(/^\d+\.\s*/, ''));
    }
  }
  return stages;
}

async function reorderPlan(fikirMetni: string, allItems: string[]): Promise<string> {
  const itemList = allItems.map((item, i) => `${i + 1}. ${item}`).join('\n');

  const systemPrompt = `Sen bir is plani uzmanisin. Sana bir is fikri ve mevcut + yeni asamalar verilecek.

GOREV:
- [MEVCUT] etiketli olanlar zaten planda var, [YENI] olanlar yeni eklendi
- TAMAMINI en mantikli is akisi sirasina koy
- Her asamanin basligini net yaz
- Her asama icin 2-3 cumlelik aciklama yaz
- Her asama icin yapilacak alt maddeleri (3-5 adet) listele
- Gerekirse bazi asamalari birlestir veya ayir

FORMAT (KESINLIKLE bu formatta yaz, baska bir sey ekleme):
**1. Asama Basligi**
Aciklama cumlesi buraya.
- Alt madde 1
- Alt madde 2
- Alt madde 3

**2. Ikinci Asama**
Aciklama cumlesi buraya.
- Alt madde 1
- Alt madde 2`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `IS FIKRI: ${fikirMetni}\n\nTUM ASAMALAR:\n${itemList}` },
      ],
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// POST: Update all plans (manual trigger or cron)
export async function POST() {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY bos' }, { status: 500 });
  }

  const iaData = readJson<{ planlar: any[] }>(IS_AKIS_PATH, { planlar: [] });
  const havuz = readJson<Record<string, any[]>>(HAVUZ_PATH, {});

  if (iaData.planlar.length === 0) {
    return NextResponse.json({ error: 'Plan yok' }, { status: 400 });
  }

  const results: { plan_id: string; success: boolean; error?: string }[] = [];

  for (const plan of iaData.planlar) {
    try {
      const existing = parseExistingStages(plan.plan_metni || '');
      const havuzItems = (havuz[plan.fikir_id] || []).map((h: any) => h.metin);

      const allItems = [
        ...existing.map(s => `[MEVCUT] ${s}`),
        ...havuzItems.map((m: string) => `[YENI] ${m}`),
      ];

      if (allItems.length === 0) {
        results.push({ plan_id: plan.fikir_id, success: true, error: 'Asama yok, atlanıyor' });
        continue;
      }

      const newPlanText = await reorderPlan(plan.fikir_metni, allItems);

      if (!newPlanText.trim()) {
        results.push({ plan_id: plan.fikir_id, success: false, error: 'AI bos yanit' });
        continue;
      }

      // Update plan
      const idx = iaData.planlar.findIndex((p: any) => p.fikir_id === plan.fikir_id);
      if (idx !== -1) {
        iaData.planlar[idx].plan_metni = newPlanText;
      }

      // Clear havuz for this plan (items are now in the plan)
      if (havuz[plan.fikir_id]) {
        havuz[plan.fikir_id] = [];
      }

      results.push({ plan_id: plan.fikir_id, success: true });
    } catch (e) {
      results.push({ plan_id: plan.fikir_id, success: false, error: String(e) });
    }
  }

  // Save all changes
  writeJson(IS_AKIS_PATH, iaData);
  writeJson(HAVUZ_PATH, havuz);

  // Also update fikirler.json
  const fikirler = readJson<Record<string, any>>(FIKIRLER_PATH, {});
  for (const plan of iaData.planlar) {
    if (fikirler[plan.fikir_id]) {
      fikirler[plan.fikir_id].plan = plan.plan_metni;
    }
  }
  writeJson(FIKIRLER_PATH, fikirler);

  return NextResponse.json({ success: true, results });
}
