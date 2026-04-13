import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'telegram-is-asistani', 'data');
const HAVUZ_PATH = path.join(DATA_DIR, 'asama_havuzu.json');

interface HavuzItem {
  id: string;
  metin: string;
  kaynak: string;
  tarih: string;
  plan_id: string;
}

function readHavuz(): Record<string, HavuzItem[]> {
  if (!fs.existsSync(HAVUZ_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(HAVUZ_PATH, 'utf-8')); } catch { return {}; }
}

function writeHavuz(data: Record<string, HavuzItem[]>) {
  fs.mkdirSync(path.dirname(HAVUZ_PATH), { recursive: true });
  fs.writeFileSync(HAVUZ_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get('plan_id');
  const data = readHavuz();
  if (planId) return NextResponse.json(data[planId] || []);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { plan_id, metin, kaynak = 'web' } = body;
  if (!plan_id || !metin?.trim()) {
    return NextResponse.json({ error: 'plan_id ve metin gerekli' }, { status: 400 });
  }
  const data = readHavuz();
  if (!data[plan_id]) data[plan_id] = [];
  const id = `h_${Date.now()}`;
  data[plan_id].push({ id, metin: metin.trim(), kaynak, tarih: new Date().toISOString(), plan_id });
  writeHavuz(data);
  return NextResponse.json({ success: true, id });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { plan_id, item_id } = body;
  if (!plan_id || !item_id) {
    return NextResponse.json({ error: 'plan_id ve item_id gerekli' }, { status: 400 });
  }
  const data = readHavuz();
  if (data[plan_id]) {
    data[plan_id] = data[plan_id].filter(i => i.id !== item_id);
  }
  writeHavuz(data);
  return NextResponse.json({ success: true });
}
