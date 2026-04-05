import os

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8728997832:AAEHk65hZwQ0gHIuKoFyNcOeq9yupjtRFJI")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "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")

# /onayla ve /reddet sadece bu kullanicilarin kullanabilmesi icin
ADMIN_USER_IDS: list[int] = []

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
