import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

export async function POST(request: Request) {
  try {
    const { messages, plan_context } = await request.json();

    const systemPrompt = `Sen bir iş geliştirme danışmanısın. Adın Bali. Türkçe konuş.

Kullanıcı bir iş planını düzenlemek istiyor. Plan detayları:
${plan_context || '(henüz plan yok)'}

Görevin:
- Kullanıcının plan hakkındaki sorularını cevapla
- Düzenleme isteklerini anla ve uygula
- Düzenleme yapacaksan, güncellenmiş plan metnini [GUNCELLE_PLAN] ve [/GUNCELLE_PLAN] tagları arasında yaz
- Değişiklik yapmadan önce kullanıcıdan onay al: "Bu değişikliği yapmamı ister misin?" diye sor
- Onay aldıktan sonra [GUNCELLE_PLAN]yeni plan metni[/GUNCELLE_PLAN] şeklinde yaz
- Terimleri açıkla, basit ve anlaşılır ol`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Cevap alinamadi.';

    // Check if there's a plan update
    let updatedPlan = null;
    const match = reply.match(/\[GUNCELLE_PLAN\]([\s\S]*?)\[\/GUNCELLE_PLAN\]/);
    if (match) {
      updatedPlan = match[1].trim();
    }

    return NextResponse.json({
      reply: reply.replace(/\[GUNCELLE_PLAN\][\s\S]*?\[\/GUNCELLE_PLAN\]/, '').trim(),
      updatedPlan,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Chat hatasi' }, { status: 500 });
  }
}
