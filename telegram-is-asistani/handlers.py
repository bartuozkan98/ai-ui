import re
from collections import defaultdict
from datetime import datetime, timedelta

from telegram import Update
from telegram.ext import ContextTypes

import claude_client
import storage
from config import ADMIN_USER_IDS

# In-memory message buffer for /ozet (per chat)
mesaj_gecmisi: dict[int, list[dict]] = defaultdict(list)

# AI conversation history per chat (shared among all users in the group)
ai_gecmisi: dict[int, list[dict]] = defaultdict(list)

DURUM_EMOJI = {
    "beklemede": "[Beklemede]",
    "onaylandi": "[Onaylandi]",
    "reddedildi": "[Reddedildi]",
}


def _admin_kontrolu(user_id: int) -> bool:
    if not ADMIN_USER_IDS:
        return True  # No admin restriction if list is empty
    return user_id in ADMIN_USER_IDS


async def start_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/start - Karsilama mesaji."""
    await update.message.reply_text(
        "Selam! Ben Bali, is fikri ortaginiz 👋\n\n"
        "Nasil calisiyorum:\n"
        "• Tum mesajlarinizi sessizce kaydediyorum\n"
        "• Her gun 12:00 ve 21:00'de ozet + fikir onerisi veriyorum\n"
        "• /ai [mesaj] ile aninda benimle konusabilirsiniz\n\n"
        "Komutlar:\n"
        "/ai [mesaj] - Benimle sohbet et, fikir gelistir\n"
        "/fikirler - Kayitli fikirleri gor\n"
        "/plan_goster - Is akis planlarini gor\n"
        "/ozet - Manuel ozet al"
    )


async def _ai_yanit_ver(update: Update, mesaj: str) -> None:
    """Shared AI response logic for both /ai command and direct messages."""
    chat_id = update.message.chat_id
    kullanici = update.message.from_user.full_name

    # Shared conversation history for the entire chat/group
    gecmis = ai_gecmisi[chat_id]

    # Include who said what so Bali knows who's talking
    kullanici_mesaj = f"[{kullanici}]: {mesaj}"

    yanit = await claude_client.ai_sohbet(kullanici_mesaj, gecmis)

    # Save to shared conversation history
    gecmis.append({"role": "user", "content": kullanici_mesaj})
    gecmis.append({"role": "assistant", "content": yanit})

    # Check if Claude wants to add to plan
    if "[PLANA_EKLE:" in yanit:
        match = re.search(r"\[PLANA_EKLE:\s*(.+?)\]", yanit)
        if match:
            fikir_metni = match.group(1).strip()

            analiz = await claude_client.fikir_analiz_et(fikir_metni)
            fikir_id = storage.fikir_ekle(fikir_metni, kullanici, analiz)

            plan = await claude_client.is_akis_plani_olustur(fikir_metni, analiz)
            storage.plan_kaydet(fikir_id, fikir_metni, plan)
            storage.fikir_durumu_guncelle(fikir_id, "onaylandi", plan=plan)

            yanit = yanit.replace(match.group(0), "").strip()
            yanit += (
                f"\n\n✅ Fikir plana eklendi!\n"
                f"ID: {fikir_id}\n"
                f"Detaylar icin: /plan_goster"
            )

    await update.message.reply_text(yanit)


async def ai_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/ai [mesaj] - Dogal sohbet ile fikir gelistirme."""
    if not context.args:
        await update.message.reply_text("Kullanim: /ai merhaba, bir fikrim var...")
        return
    await _ai_yanit_ver(update, " ".join(context.args))


async def mesaj_dinle(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Passively saves all messages for daily summaries. Never responds."""
    if not update.message or not update.message.text:
        return

    chat_id = update.message.chat_id
    mesaj_gecmisi[chat_id].append({
        "kullanici": update.message.from_user.full_name,
        "metin": update.message.text,
        "tarih": datetime.now().isoformat(),
    })


async def fikir_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/fikir [metin] - Yeni fikir ekle ve SWOT analizi yap."""
    if not context.args:
        await update.message.reply_text("Kullanim: /fikir [fikir metni]")
        return

    fikir_metni = " ".join(context.args)
    kullanici = update.message.from_user.full_name

    await update.message.reply_text("Fikir analiz ediliyor...")

    analiz = await claude_client.fikir_analiz_et(fikir_metni)
    fikir_id = storage.fikir_ekle(fikir_metni, kullanici, analiz)

    yanit = (
        f"Yeni Fikir Kaydedildi!\n\n"
        f"ID: {fikir_id}\n"
        f"Oneren: {kullanici}\n"
        f"Fikir: {fikir_metni}\n\n"
        f"SWOT Analizi:\n{analiz}"
    )
    await update.message.reply_text(yanit)


async def ozet_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/ozet - Son 24 saatin konusmalarini ozetle."""
    chat_id = update.message.chat_id
    son_24_saat = datetime.now() - timedelta(hours=24)

    mesajlar = [
        m for m in mesaj_gecmisi.get(chat_id, [])
        if datetime.fromisoformat(m["tarih"]) > son_24_saat
    ]

    if not mesajlar:
        await update.message.reply_text("Son 24 saatte kaydedilmis konusma bulunamadi.")
        return

    mesaj_metni = "\n".join(
        f"{m['kullanici']}: {m['metin']}" for m in mesajlar
    )

    await update.message.reply_text("Konusmalar analiz ediliyor...")
    ozet = await claude_client.konusma_ozeti_olustur(mesaj_metni)

    await update.message.reply_text(f"Son 24 Saat Ozeti:\n\n{ozet}")


async def planla_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/planla [F001] - Fikir icin is akis plani olustur."""
    if not context.args:
        await update.message.reply_text("Kullanim: /planla [fikir_id] (ornek: /planla F001)")
        return

    fikir_id = context.args[0].upper()
    fikir = storage.fikir_getir(fikir_id)

    if not fikir:
        await update.message.reply_text(f"{fikir_id} numarali fikir bulunamadi.")
        return

    await update.message.reply_text(f"{fikir_id} icin is akis plani hazirlaniyor...")

    plan = await claude_client.is_akis_plani_olustur(fikir["metin"], fikir["analiz"])
    storage.plan_kaydet(fikir_id, fikir["metin"], plan)

    yanit = (
        f"Is Akis Plani - {fikir_id}\n\n"
        f"Fikir: {fikir['metin']}\n\n"
        f"{plan}"
    )
    await update.message.reply_text(yanit)


async def onayla_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/onayla [F001] - Fikri onayla."""
    if not _admin_kontrolu(update.message.from_user.id):
        await update.message.reply_text("Bu komutu kullanma yetkiniz yok.")
        return

    if not context.args:
        await update.message.reply_text("Kullanim: /onayla [fikir_id]")
        return

    fikir_id = context.args[0].upper()
    fikir = storage.fikir_getir(fikir_id)

    if not fikir:
        await update.message.reply_text(f"{fikir_id} numarali fikir bulunamadi.")
        return

    if fikir["durum"] == "onaylandi":
        await update.message.reply_text(f"{fikir_id} zaten onaylanmis.")
        return

    storage.fikir_durumu_guncelle(fikir_id, "onaylandi")

    # If a plan exists, save it to is_akis_plani.json
    if fikir.get("plan"):
        storage.plan_kaydet(fikir_id, fikir["metin"], fikir["plan"])

    await update.message.reply_text(
        f"ONAYLANDI\n\n"
        f"Fikir {fikir_id}: {fikir['metin']}\n"
        f"Durum: Onaylandi\n"
        f"Onaylayan: {update.message.from_user.full_name}"
    )


async def reddet_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/reddet [F001] [gerekce] - Fikri reddet."""
    if not _admin_kontrolu(update.message.from_user.id):
        await update.message.reply_text("Bu komutu kullanma yetkiniz yok.")
        return

    if len(context.args) < 2:
        await update.message.reply_text("Kullanim: /reddet [fikir_id] [gerekce]")
        return

    fikir_id = context.args[0].upper()
    gerekce = " ".join(context.args[1:])
    fikir = storage.fikir_getir(fikir_id)

    if not fikir:
        await update.message.reply_text(f"{fikir_id} numarali fikir bulunamadi.")
        return

    storage.fikir_durumu_guncelle(fikir_id, "reddedildi", red_gerekce=gerekce)

    await update.message.reply_text(
        f"REDDEDİLDİ\n\n"
        f"Fikir {fikir_id}: {fikir['metin']}\n"
        f"Durum: Reddedildi\n"
        f"Gerekce: {gerekce}\n"
        f"Reddeden: {update.message.from_user.full_name}"
    )


async def fikirler_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/fikirler - Tum fikirleri listele."""
    fikirler = storage.tum_fikirleri_getir()

    if not fikirler:
        await update.message.reply_text("Henuz kayitli fikir yok.")
        return

    satirlar = []
    for fid, fikir in fikirler.items():
        durum = DURUM_EMOJI.get(fikir["durum"], fikir["durum"])
        satirlar.append(f"{fid} {durum} - {fikir['metin'][:80]}")

    await update.message.reply_text("Fikir Listesi:\n\n" + "\n".join(satirlar))


async def plan_goster_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/plan_goster - Onaylanan tum fikirlerin is akis planlarini goster."""
    planlar = storage.onaylanan_planlari_getir()

    if not planlar:
        await update.message.reply_text("Henuz onaylanmis bir is akis plani yok.")
        return

    for plan in planlar:
        metin = (
            f"Plan: {plan['fikir_id']}\n"
            f"Fikir: {plan['fikir_metni']}\n"
            f"Onay Tarihi: {plan['onayland_tarih'][:10]}\n\n"
            f"{plan['plan_metni']}"
        )
        # Telegram has a 4096 char limit per message
        if len(metin) > 4000:
            await update.message.reply_text(metin[:4000] + "\n\n... (devami kesildi)")
        else:
            await update.message.reply_text(metin)
