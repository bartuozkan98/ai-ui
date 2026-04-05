import logging
from datetime import time

from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    filters,
)

from config import TELEGRAM_BOT_TOKEN, OZET_SAATI
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


async def otomatik_ozet(context) -> None:
    """Scheduled daily summary - sends to all chats that have message history."""
    from handlers import mesaj_gecmisi, ozet_cmd
    from datetime import datetime, timedelta
    import claude_client

    son_24_saat = datetime.now() - timedelta(hours=24)

    for chat_id, mesajlar in mesaj_gecmisi.items():
        son_mesajlar = [
            m for m in mesajlar
            if datetime.fromisoformat(m["tarih"]) > son_24_saat
        ]
        if not son_mesajlar:
            continue

        mesaj_metni = "\n".join(
            f"{m['kullanici']}: {m['metin']}" for m in son_mesajlar
        )
        try:
            ozet = await claude_client.konusma_ozeti_olustur(mesaj_metni)
            await context.bot.send_message(
                chat_id=chat_id,
                text=f"Gunluk Otomatik Ozet (Son 24 Saat):\n\n{ozet}",
            )
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

    # Daily scheduled summary
    job_queue = app.job_queue
    if job_queue:
        job_queue.run_daily(
            otomatik_ozet,
            time=time(hour=OZET_SAATI, minute=0),
            name="gunluk_ozet",
        )
        logger.info(f"Gunluk otomatik ozet saat {OZET_SAATI:02d}:00 icin ayarlandi.")

    # Error handler
    async def error_handler(update, context):
        logger.error(f"Hata: {context.error}")
        if update and update.message:
            await update.message.reply_text("Bir hata olustu, tekrar deneyin.")

    app.add_error_handler(error_handler)

    logger.info("Bot baslatiliyor...")
    app.run_polling()


if __name__ == "__main__":
    main()
