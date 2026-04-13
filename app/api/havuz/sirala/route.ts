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

export async function POST(request: Request) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY bos' }, { status: 500 });
  }

  const body = await request.json();
  const { plan_id } = body;
  if (!plan_id) {
    return NextResponse.json({ error: 'plan_id gerekli' }, { status: 400 });
  }

  const havuz = readJson<Record<string, any[]>>(HAVUZ_PATH, {});
  const havuzItems = havuz[plan_id] || [];

  // Get existing plan context + current stages
  const iaData = readJson<{ planlar: any[] }>(IS_AKIS_PATH, { planlar: [] });
  const plan = iaData.planlar.find((p: any) => p.fikir_id === plan_id);
  const fikirMetni = plan?.fikir_metni || '';

  // Parse existing plan stages
  const existingStages: string[] = [];
  if (plan?.plan_metni) {
    const lines = plan.plan_metni.split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (/^(\*\*|##|#+)/.test(t) || /^\d+\.\s+\*\*/.test(t) || /^\d+\.\s+[A-ZÇĞİÖŞÜ]/.test(t)) {
        existingStages.push(t.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, '').replace(/^\d+\.\s*/, ''));
      }
    }
  }

  const allItems = [
    ...existingStages.map(s => `[MEVCUT] ${s}`),
    ...havuzItems.map((item: any) => `[YENI] ${item.metin}`),
  ];

  if (allItems.length === 0) {
    return NextResponse.json({ error: 'Asama yok' }, { status: 400 });
  }

  const itemList = allItems.map((item, i) => `${i + 1}. ${item}`).join('\n');

  const systemPrompt = `Sen bir is plani uzmanisin. Sana bir is fikri ve bu fikir icin mevcut asamalar + yeni eklenen asamalar verilecek.

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
- Alt madde 2

(bu sekilde devam et)`;

  try {
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
          { role: 'user', content: `IS FIKRI: ${fikirMetni}\n\nTUM ASAMALAR (mevcut + yeni, sirasiz):\n${itemList}` },
        ],
      }),
    });

    const data = await res.json();
    const planText = data.choices?.[0]?.message?.content || '';

    if (!planText.trim()) {
      return NextResponse.json({ error: 'AI bos yanit verdi' }, { status: 500 });
    }

    // Save ordered plan to is_akis_plani.json
    const idx = iaData.planlar.findIndex((p: any) => p.fikir_id === plan_id);
    if (idx !== -1) {
      iaData.planlar[idx].plan_metni = planText;
      writeJson(IS_AKIS_PATH, iaData);

      // Also update fikirler.json
      const fikirler = readJson<Record<string, any>>(FIKIRLER_PATH, {});
      if (fikirler[plan_id]) {
        fikirler[plan_id].plan = planText;
        writeJson(FIKIRLER_PATH, fikirler);
      }
    }

    return NextResponse.json({ success: true, plan_metni: planText });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
