import os

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

if not TELEGRAM_BOT_TOKEN:
    raise RuntimeError(
        "TELEGRAM_BOT_TOKEN ortam degiskeni bos. "
        "systemd service dosyasinda Environment=TELEGRAM_BOT_TOKEN=... ekle."
    )
if not OPENROUTER_API_KEY:
    raise RuntimeError(
        "OPENROUTER_API_KEY ortam degiskeni bos. "
        "systemd service dosyasinda Environment=OPENROUTER_API_KEY=... ekle."
    )

# /onayla ve /reddet sadece bu kullanicilarin kullanabilmesi icin
ADMIN_USER_IDS: list[int] = []

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
