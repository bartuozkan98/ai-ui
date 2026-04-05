# Telegram Is Fikri Asistani

## Proje Ozeti
Telegram grubu icin hibrit (pasif dinleme + interaktif komut) is fikri asistani botu. Claude API (Anthropic) kullanarak fikirleri analiz eder, SWOT uretir, is akis planlari olusturur.

## Teknik Stack
- **Python 3.10+**
- **python-telegram-bot 20.x** (async)
- **anthropic SDK** (claude-sonnet-4-20250514 modeli)
- **JSON dosya tabanli storage** (veritabani gerektirmez)

## Dosya Yapisi
- `main.py` - Bot giris noktasi, komut kayitlari ve gunluk zamanlayici
- `handlers.py` - Tum komut handler fonksiyonlari ve pasif mesaj dinleyici
- `claude_client.py` - Anthropic API istemcisi (analiz, plan, ozet)
- `storage.py` - JSON dosya okuma/yazma, fikir ve plan CRUD islemleri
- `prompts.py` - Claude prompt sablonlari (SWOT, plan, ozet)
- `config.py` - Konfigurasyonlar (token, API key, admin listesi)
- `data/fikirler.json` - Fikir veritabani
- `data/is_akis_plani.json` - Onaylanan is akis planlari

## Komutlar
| Komut | Aciklama |
|-------|----------|
| `/fikir [metin]` | Yeni fikir ekle + SWOT analizi |
| `/ozet` | Son 24 saat konusma ozeti |
| `/planla [F001]` | Fikir icin is akis plani olustur |
| `/onayla [F001]` | Fikri onayla (admin) |
| `/reddet [F001] [gerekce]` | Fikri reddet (admin) |
| `/fikirler` | Tum fikirleri listele |
| `/plan_goster` | Onaylanan planlari goster |

## Kurulum
```bash
cd telegram-is-asistani
pip install -r requirements.txt
```

`config.py` icinde veya ortam degiskenlerinde ayarla:
- `TELEGRAM_BOT_TOKEN` - BotFather'dan alinan token
- `ANTHROPIC_API_KEY` - Anthropic API anahtari
- `ADMIN_USER_IDS` - Admin Telegram user ID listesi (bos birak = herkes admin)

Botu baslat:
```bash
python main.py
```

## Onemli Notlar
- `data/` klasoru ve JSON dosyalari otomatik olusturulur
- Mesaj gecmisi (ozet icin) bellekte tutulur, bot yeniden basladiginda sifirlanir
- Telegram mesaj limiti 4096 karakter; uzun planlar kesilir
- Gunluk otomatik ozet `OZET_SAATI` config'ine gore calisir (varsayilan 18:00)

## Sonraki Adimlar
- SQLite/PostgreSQL'e gecis (kalici mesaj gecmisi icin)
- Fikir oylamasi (/oyla F001)
- Inline butonlarla interaktif onay/red
- Webhook modu (polling yerine)
- Docker desteği
- Coklu dil destegi
