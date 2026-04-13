import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const MODEL = 'anthropic/claude-sonnet-4';
const DATA_DIR = path.join(process.cwd(), 'telegram-is-asistani', 'data');
const WEB_MESAJ_PATH = path.join(DATA_DIR, 'web_mesaj.json');
const FIKIRLER_PATH = path.join(DATA_DIR, 'fikirler.json');
const IS_AKIS_PATH = path.join(DATA_DIR, 'is_akis_plani.json');
const PERMANENT_PATH = path.join(DATA_DIR, 'permanent_gecmis.json');

function readJson<T>(p: string, fallback: T): T {
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(p: string, data: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function saveWebMesaj(kullanici: string, metin: string, bot = false) {
  const data = readJson<{ messages: any[] }>(WEB_MESAJ_PATH, { messages: [] });
  data.messages.push({
    kullanici,
    metin,
    tarih: new Date().toISOString(),
    bot,
  });
  // Son 500 mesaji tut
  data.messages = data.messages.slice(-500);
  writeJson(WEB_MESAJ_PATH, data);
}

async function callClaude(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  maxTokens = 2048
): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

function sonrakiFikirId(fikirler: Record<string, any>): string {
  const ids = Object.keys(fikirler)
    .filter((k) => /^F\d+$/.test(k))
    .map((k) => parseInt(k.slice(1), 10));
  const next = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  return `F${String(next).padStart(3, '0')}`;
}

export async function POST(request: Request) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            'OPENROUTER_API_KEY ortam degiskeni bos. systemd service dosyasinda Environment=OPENROUTER_API_KEY=... ekle.',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, user = 'Web' } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Bos mesaj' }, { status: 400 });
    }

    // Kullanici mesajini web_mesaj.json'a kaydet
    saveWebMesaj(user, message, false);

    // Context olusturma: son telegram + web mesajlari
    const telData = readJson<Record<string, any[]>>(
      path.join(DATA_DIR, 'mesaj_gecmisi.json'),
      {}
    );
    const recentMessages: string[] = [];
    for (const chatId of Object.keys(telData)) {
      for (const m of (telData[chatId] || []).slice(-40)) {
        const prefix = m.bot ? 'Bali' : m.kullanici || 'Bilinmeyen';
        recentMessages.push(`[${prefix}]: ${m.metin}`);
      }
    }
    const webData = readJson<{ messages: any[] }>(WEB_MESAJ_PATH, {
      messages: [],
    });
    for (const m of (webData.messages || []).slice(-20)) {
      const prefix = m.bot ? 'Bali' : m.kullanici || 'Web';
      recentMessages.push(`[${prefix}]: ${m.metin}`);
    }

    const planlarData = readJson<{ planlar: any[] }>(IS_AKIS_PATH, {
      planlar: [],
    });
    const planOzeti = planlarData.planlar
      .map((p: any) => `- ${p.fikir_id}: ${p.fikir_metni}`)
      .join('\n');

    // Kalici baglam: asla unutulmayan ekip gecmisi
    const permanentData = readJson<{ messages: any[] }>(PERMANENT_PATH, {
      messages: [],
    });
    const kaliciBaglam = (permanentData.messages || [])
      .map((m: any) => `[${m.kullanici || 'Bilinmeyen'}]: ${m.metin || ''}`)
      .join('\n');

    const systemPrompt = `Sen Bali'sin, bir is fikri ve plan gelistirme asistanisin. Turkce konusursun. Sade, dostane, net.

KALICI BAGLAM (bu konusmalari her zaman hatirla - ekibin gecmis planlari ve kararlari):
${kaliciBaglam || '(kalici baglam bos)'}

MEVCUT PLANLAR:
${planOzeti || '(henuz plan yok)'}

SON KONUSMALAR (Telegram + Web):
${recentMessages.slice(-30).join('\n')}

GOREVIN:
- Kullaniciyla fikirleri birlikte olgunlastir.
- Iki secenek sun: 1) Fikri detaylandirmaya devam, 2) Plana ekle
- Kullanici "plana ekle" veya "evet ekle" derse cevabinin SONUNA tam olarak sunu yaz: [PLANA_EKLE: fikrin kisa ozeti]
- Sadece kullanici net onay verdiginde plana ekle
- Mevcut bir plani degistirmek icin [GUNCELLE_PLAN:F00X] yeni plan metni [/GUNCELLE_PLAN] kullan
- Kisa ve okunakli yanitlar ver. Gerekmedikce uzun aciklama yapma.`;

    const rawReply = await callClaude(
      systemPrompt,
      [{ role: 'user', content: `[${user}]: ${message}` }],
      2048
    );

    let cleanReply = rawReply;
    let newPlanId: string | null = null;
    let updatedPlanId: string | null = null;

    // PLANA_EKLE kontrolu
    const planMatch = rawReply.match(/\[PLANA_EKLE:\s*([^\]]+)\]/);
    if (planMatch) {
      const fikirMetni = planMatch[1].trim();

      try {
        const analiz = await callClaude(
          'Verilen is fikri icin kisa bir SWOT analizi yap. Bolumler: Guclu Yanlar, Zayif Yanlar, Firsatlar, Tehditler. Her bolum 2-3 madde.',
          [{ role: 'user', content: fikirMetni }],
          1024
        );

        const plan = await callClaude(
          'Verilen is fikri ve SWOT analizine gore detayli adim adim bir is akis plani olustur. Numaralandirilmis bolumler kullan (1. 2. 3...). Her bolumde alt maddeler (- ile), yaklasik sure, sorumlu onerisi yer alsin. Baslıklar net olsun.',
          [{ role: 'user', content: `Fikir: ${fikirMetni}\n\nSWOT:\n${analiz}` }],
          2500
        );

        const fikirlerData = readJson<Record<string, any>>(FIKIRLER_PATH, {});
        const fikirId = sonrakiFikirId(fikirlerData);

        fikirlerData[fikirId] = {
          id: fikirId,
          metin: fikirMetni,
          onerilen_by: `${user} (Web)`,
          tarih: new Date().toISOString(),
          durum: 'onaylandi',
          analiz,
          plan,
          red_gerekce: null,
        };
        writeJson(FIKIRLER_PATH, fikirlerData);

        const iaData = readJson<{ planlar: any[] }>(IS_AKIS_PATH, {
          planlar: [],
        });
        iaData.planlar = iaData.planlar.filter(
          (p: any) => p.fikir_id !== fikirId
        );
        iaData.planlar.push({
          fikir_id: fikirId,
          fikir_metni: fikirMetni,
          plan_metni: plan,
          onayland_tarih: new Date().toISOString(),
          durum: 'aktif',
        });
        writeJson(IS_AKIS_PATH, iaData);

        newPlanId = fikirId;
        cleanReply =
          rawReply.replace(planMatch[0], '').trim() +
          `\n\n✅ Yeni plan olusturuldu: **${fikirId}**`;
      } catch (e) {
        cleanReply =
          rawReply.replace(planMatch[0], '').trim() +
          `\n\n⚠️ Plan olusturulurken hata oldu.`;
      }
    }

    // GUNCELLE_PLAN kontrolu
    const updateMatch = rawReply.match(
      /\[GUNCELLE_PLAN:\s*(F\d+)\]([\s\S]*?)\[\/GUNCELLE_PLAN\]/
    );
    if (updateMatch) {
      const fikirId = updateMatch[1];
      const newPlanText = updateMatch[2].trim();

      const iaData = readJson<{ planlar: any[] }>(IS_AKIS_PATH, {
        planlar: [],
      });
      const idx = iaData.planlar.findIndex((p: any) => p.fikir_id === fikirId);
      if (idx !== -1) {
        iaData.planlar[idx].plan_metni = newPlanText;
        writeJson(IS_AKIS_PATH, iaData);

        const fikirlerData = readJson<Record<string, any>>(FIKIRLER_PATH, {});
        if (fikirlerData[fikirId]) {
          fikirlerData[fikirId].plan = newPlanText;
          writeJson(FIKIRLER_PATH, fikirlerData);
        }

        updatedPlanId = fikirId;
        cleanReply =
          rawReply.replace(updateMatch[0], '').trim() +
          `\n\n✅ **${fikirId}** plani guncellendi`;
      }
    }

    // Bali cevabini kaydet
    saveWebMesaj('Bali', cleanReply, true);

    return NextResponse.json({
      reply: cleanReply,
      newPlanId,
      updatedPlanId,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
