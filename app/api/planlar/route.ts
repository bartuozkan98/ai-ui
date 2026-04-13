import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'telegram-is-asistani', 'data');

export async function GET() {
  try {
    const fikirlerPath = path.join(DATA_DIR, 'fikirler.json');
    const planlarPath = path.join(DATA_DIR, 'is_akis_plani.json');

    const fikirler = fs.existsSync(fikirlerPath)
      ? JSON.parse(fs.readFileSync(fikirlerPath, 'utf-8'))
      : {};

    const planlarData = fs.existsSync(planlarPath)
      ? JSON.parse(fs.readFileSync(planlarPath, 'utf-8'))
      : { planlar: [] };

    return NextResponse.json({
      fikirler,
      planlar: planlarData.planlar,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Veri okunamadi' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { fikir_id, plan_metni } = body;

    const planlarPath = path.join(DATA_DIR, 'is_akis_plani.json');
    const planlarData = fs.existsSync(planlarPath)
      ? JSON.parse(fs.readFileSync(planlarPath, 'utf-8'))
      : { planlar: [] };

    const idx = planlarData.planlar.findIndex((p: any) => p.fikir_id === fikir_id);
    if (idx !== -1) {
      planlarData.planlar[idx].plan_metni = plan_metni;
    }

    fs.writeFileSync(planlarPath, JSON.stringify(planlarData, null, 2), 'utf-8');

    // Also update fikirler.json
    const fikirlerPath = path.join(DATA_DIR, 'fikirler.json');
    if (fs.existsSync(fikirlerPath)) {
      const fikirler = JSON.parse(fs.readFileSync(fikirlerPath, 'utf-8'));
      if (fikirler[fikir_id]) {
        fikirler[fikir_id].plan = plan_metni;
        fs.writeFileSync(fikirlerPath, JSON.stringify(fikirler, null, 2), 'utf-8');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Guncelleme basarisiz' }, { status: 500 });
  }
}
