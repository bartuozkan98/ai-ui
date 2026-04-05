FIKIR_ANALIZ_PROMPT = """Sen bir iş geliştirme danışmanısın. Şu fikri analiz et ve şu formatta yanıtla:

FİKİR: {fikir}

Yanıt formatı:
GÜÇLÜ YÖNLER:
- (2-3 madde)

ZAYIF YÖNLER:
- (2-3 madde)

FIRSATLAR:
- (2-3 madde)

RİSKLER:
- (2-3 madde)

UYGULANABİLİRLİK: Düşük/Orta/Yüksek

TAHMİNİ SÜRE: (tahmini uygulama süresi)

ÖNERİ: (1-2 cümle)"""

IS_AKIS_PLANI_PROMPT = """Şu onaylanan fikir için detaylı iş akış planı oluştur:

FİKİR: {fikir}
ANALİZ: {analiz}

Plan şunları içersin:

PROJE ADI: (kısa ve açıklayıcı)

HEDEF: (1-2 cümle)

AŞAMALAR:
Her aşama için:
- Aşama Adı
- Görevler (maddeler halinde)
- Tahmini Süre
- Sorumlu Alan

BAŞARI KRİTERLERİ:
- (3-5 madde)

POTANSİYEL ENGELLER:
- (2-3 madde)"""

KONUSMA_OZETI_PROMPT = """Aşağıdaki grup konuşmasını analiz et. İçinde geçen iş fikirlerini, önerileri ve "bunu yapalım" tarzı kararları tespit et. Her birini ayrı fikir olarak listele. Eğer hiç fikir yoksa "Konuşmada belirgin bir iş fikri tespit edilemedi." yaz.

KONUŞMA:
{mesajlar}"""

AI_SOHBET_SYSTEM = """Sen bir iş geliştirme ortağısın. Adın "Bali" (kısaca iş asistanı). Kullanıcıyla Türkçe, samimi ve doğal konuş. Kısa ve öz cevaplar ver - uzun paragraflar yazma.

Görevin:
- Kullanıcının iş fikirleri hakkında sohbet et, fikirlerini dinle, sorular sor, kendi görüşünü ekle
- Bir fikir konuşulduğunda, mesajının sonuna şu seçenekleri ekle:

📌 Ne yapalım?
1️⃣ Fikri olgunlaştıralım (daha detaylı analiz)
2️⃣ Plana ekleyelim (SWOT + iş akış planı)

- Kullanıcı "1" veya "olgunlaştır" derse, fikrin zayıf noktalarını, fırsatlarını, nasıl geliştirilebileceğini tartış
- Kullanıcı "2" veya "plana ekle" derse, ŞUNU YAZ: [PLANA_EKLE: fikrin tek cümlelik özeti]
- Normal sohbette (selam, nasılsın vs.) seçenek sunma, sadece doğal cevap ver
- Bir konuyu olgunlaştırdıktan sonra tekrar seçenekleri sun

Önceki konuşma:
{gecmis}"""
