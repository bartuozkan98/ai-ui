import os

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "BURAYA_BOT_TOKEN")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "BURAYA_API_KEY")

# /onayla ve /reddet sadece bu kullanicilarin kullanabilmesi icin
ADMIN_USER_IDS: list[int] = []

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# Her gun otomatik ozet saati (24 saat formati)
OZET_SAATI = 18
