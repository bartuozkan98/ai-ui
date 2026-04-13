import logging
import signal
import sys
from datetime import time

from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    filters,
)

from config import TELEGRAM_BOT_TOKEN
from handlers import (
    start_cmd,
    ai_cmd,
    mesaj_dinle,
    fikir_cmd,
    ozet_cmd,
    planla_cmd,
    onayla_cmd,
    reddet_cmd,
    fikirler_cmd,
    plan_goster_cmd,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


# Track last summary time per chat to avoid duplicate messages
son_ozet_zamani: dict[int, str] = {}


async def otomatik_ozet(context) -> None:
    """Scheduled summary - runs at 12:00 and 21:00, summarizes messages since last summary."""
    from handlers import mesaj_gecmisi
    from datetime import datetime
    import claude_client

    now = datetime.now()

    for chat_id, mesajlar in mesaj_gecmisi.items():
        # Get messages since last summary (or last 12 hours if first run)
        son_zaman = son_ozet_zamani.get(chat_id)
        if son_zaman:
            kesim = datetime.fromisoformat(son_zaman)
        else:
            from datetime import timedelta
            kesim = now - timedelta(hours=12)

        son_mesajlar = [
            m for m in mesajlar
            if datetime.fromisoformat(m["tarih"]) > kesim
        ]
        if not son_mesajlar:
            continue

        mesaj_metni = "\n".join(
            f"{m['kullanici']}: {m['metin']}" for m in son_mesajlar
        )
        try:
            ozet = await claude_client.konusma_ozeti_olustur(mesaj_metni)
            saat = "🕐 Ogle" if now.hour < 15 else "🌙 Aksam"
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"{saat} Ozeti\n\n{ozet}",
            )
            son_ozet_zamani[chat_id] = now.isoformat()
        except Exception as e:
            logger.error(f"Otomatik ozet hatasi (chat {chat_id}): {e}")


def main() -> None:
    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # Command handlers
    app.add_handler(CommandHandler("start", start_cmd))
    app.add_handler(CommandHandler("ai", ai_cmd))
    app.add_handler(CommandHandler("fikir", fikir_cmd))
    app.add_handler(CommandHandler("ozet", ozet_cmd))
    app.add_handler(CommandHandler("planla", planla_cmd))
    app.add_handler(CommandHandler("onayla", onayla_cmd))
    app.add_handler(CommandHandler("reddet", reddet_cmd))
    app.add_handler(CommandHandler("fikirler", fikirler_cmd))
    app.add_handler(CommandHandler("plan_goster", plan_goster_cmd))

    # Passive message listener (captures all non-command text messages)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, mesaj_dinle))

    # Scheduled summaries at 12:00 and 21:00
    job_queue = app.job_queue
    if job_queue:
        job_queue.run_daily(
            otomatik_ozet,
            time=time(hour=12, minute=0),
            name="ogle_ozeti",
        )
        job_queue.run_daily(
            otomatik_ozet,
            time=time(hour=21, minute=0),
            name="aksam_ozeti",
        )
        logger.info("Otomatik ozet: 12:00 ve 21:00 icin ayarlandi.")

    # Error handler - log but don't crash
    async def error_handler(update, context):
        logger.error(f"Hata: {context.error}", exc_info=context.error)
        try:
            if update and update.message:
                await update.message.reply_text("Bir hata olustu, tekrar deneyin.")
        except Exception:
            pass

    app.add_error_handler(error_handler)

    # Graceful shutdown on signals
    def signal_handler(sig, frame):
        logger.info(f"Signal {sig} alindi, bot kapatiliyor...")
        sys.exit(0)

    signal.signal(signal.SIGTERM, signal_handler)

    logger.info("Bot baslatiliyor...")
    app.run_polling(drop_pending_updates=False)


if __name__ == "__main__":
    main()
