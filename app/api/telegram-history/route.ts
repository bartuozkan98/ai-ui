import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'telegram-is-asistani', 'data');

interface Message {
  kullanici: string;
  metin: string;
  tarih: string;
  bot?: boolean;
  tip?: string;
  source: 'telegram' | 'web';
}

function readJson<T>(p: string, fallback: T): T {
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const result: Message[] = [];

    // Telegram mesajlari
    const telData = readJson<Record<string, any[]>>(
      path.join(DATA_DIR, 'mesaj_gecmisi.json'),
      {}
    );
    for (const chatId of Object.keys(telData)) {
      for (const m of telData[chatId]) {
        if (!m || !m.tarih) continue;
        result.push({
          kullanici: m.kullanici || 'Bilinmeyen',
          metin: m.metin || '',
          tarih: m.tarih,
          bot: Boolean(m.bot),
          tip: m.tip,
          source: 'telegram',
        });
      }
    }

    // Web arayuzunden gelen mesajlar
    const webData = readJson<{ messages?: any[] }>(
      path.join(DATA_DIR, 'web_mesaj.json'),
      { messages: [] }
    );
    for (const m of webData.messages || []) {
      if (!m || !m.tarih) continue;
      result.push({
        kullanici: m.kullanici || 'Web',
        metin: m.metin || '',
        tarih: m.tarih,
        bot: Boolean(m.bot),
        source: 'web',
      });
    }

    // Zaman siralamasi
    result.sort(
      (a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime()
    );

    return NextResponse.json({ messages: result });
  } catch (error) {
    return NextResponse.json(
      { messages: [], error: String(error) },
      { status: 500 }
    );
  }
}
