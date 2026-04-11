"""
Eski Telegram sohbetini kalici_gecmis.json'a import eder.

Kullanim:
    python import_eski_sohbet.py [dosya_yolu]

Varsayilan dosya yolu: data/eski_sohbet.txt

BEKLENEN FORMAT (esnek - birden fazla format destekler):

  Format 1 (basit):
    Bartu: merhaba
    Kerem: nasilsin
    Bali: selam, ne var ne yok?

  Format 2 (tarihli):
    [2025-10-15 14:30] Bartu: fikrim var
    [2025-10-15 14:31] Bali: anlat bakalim

  Format 3 (Telegram export stili):
    Bartu Ozkan, [15.10.2025 14:30]
    Fikrim su ki...

Her satir (veya blok) bir mesaj olarak kaydedilir.
Mevcut permanent_gecmis.json'daki mesajlar korunur, yeni mesajlar sonuna eklenir.
Import sonrasinda ayni mesaj tekrar eklenmez (dedup metin+kullanici).
"""

import os
import re
import sys
from datetime import datetime

import storage


def parse_chat_text(metin: str) -> list[dict]:
    """Turkce/karisik format chat metnini mesaj listesine cevirir."""
    mesajlar: list[dict] = []
    satirlar = metin.splitlines()

    # Regex kaliplari
    # [2025-10-15 14:30] Bartu: mesaj
    bracket_time_re = re.compile(
        r"^\[(?P<tarih>[^\]]+)\]\s*(?P<kullanici>[^:]+?):\s*(?P<metin>.+)$"
    )
    # Bartu, [15.10.2025 14:30]  (telegram export header)
    tg_header_re = re.compile(
        r"^(?P<kullanici>[^,]+),\s*\[(?P<tarih>[^\]]+)\]\s*$"
    )
    # Bartu [15.10 14:30]: mesaj
    inline_bracket_re = re.compile(
        r"^(?P<kullanici>[^:\[]+?)\s*\[(?P<tarih>[^\]]+)\]\s*:\s*(?P<metin>.+)$"
    )
    # Bartu: mesaj
    simple_re = re.compile(r"^(?P<kullanici>[^:]{1,40}?):\s*(?P<metin>.+)$")

    pending_header: dict | None = None
    baslangic_tarih = datetime.now()

    for idx, ham in enumerate(satirlar):
        satir = ham.rstrip()
        if not satir.strip():
            pending_header = None
            continue

        # Telegram header: sonraki satir(lar) mesaj govdesi
        m = tg_header_re.match(satir)
        if m:
            pending_header = {
                "kullanici": m.group("kullanici").strip(),
                "tarih": _normalize_tarih(m.group("tarih"), baslangic_tarih, idx),
            }
            continue

        if pending_header is not None:
            mesajlar.append({
                "kullanici": pending_header["kullanici"],
                "metin": satir.strip(),
                "tarih": pending_header["tarih"],
            })
            pending_header = None
            continue

        m = bracket_time_re.match(satir)
        if m:
            mesajlar.append({
                "kullanici": m.group("kullanici").strip(),
                "metin": m.group("metin").strip(),
                "tarih": _normalize_tarih(m.group("tarih"), baslangic_tarih, idx),
            })
            continue

        m = inline_bracket_re.match(satir)
        if m:
            mesajlar.append({
                "kullanici": m.group("kullanici").strip(),
                "metin": m.group("metin").strip(),
                "tarih": _normalize_tarih(m.group("tarih"), baslangic_tarih, idx),
            })
            continue

        m = simple_re.match(satir)
        if m:
            kullanici = m.group("kullanici").strip()
            # Cok uzun "kullanici" alanlarini mesaj govdesi say
            if len(kullanici) > 30 or " " in kullanici and len(kullanici.split()) > 3:
                # Onceki mesajin devami olarak ekle
                if mesajlar:
                    mesajlar[-1]["metin"] += "\n" + satir.strip()
                continue
            mesajlar.append({
                "kullanici": kullanici,
                "metin": m.group("metin").strip(),
                "tarih": _fake_tarih(baslangic_tarih, idx),
            })
            continue

        # Hicbir kalıba uymadi - onceki mesajin devami
        if mesajlar:
            mesajlar[-1]["metin"] += "\n" + satir.strip()

    return mesajlar


def _normalize_tarih(ham: str, baslangic: datetime, idx: int) -> str:
    """Tarih stringini ISO formatina cevirmeye calisir, olmazsa fake uretir."""
    ham = ham.strip()
    formatlar = [
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%d.%m.%Y %H:%M",
        "%d.%m.%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d %m %Y %H:%M",
    ]
    for fmt in formatlar:
        try:
            return datetime.strptime(ham, fmt).isoformat()
        except ValueError:
            continue
    return _fake_tarih(baslangic, idx)


def _fake_tarih(baslangic: datetime, idx: int) -> str:
    """Sira numarasina gore artan sahte tarih uretir (sıralama icin)."""
    from datetime import timedelta
    return (baslangic - timedelta(minutes=(1000 - idx))).isoformat()


def main() -> None:
    varsayilan = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "data",
        "eski_sohbet.txt",
    )
    dosya = sys.argv[1] if len(sys.argv) > 1 else varsayilan

    if not os.path.exists(dosya):
        print(f"HATA: {dosya} bulunamadi.")
        print("Ipucu: data/eski_sohbet.txt dosyasini olustur ve")
        print("       eski Telegram konusmanizi icine yapistir.")
        sys.exit(1)

    with open(dosya, "r", encoding="utf-8") as f:
        metin = f.read()

    yeni_mesajlar = parse_chat_text(metin)
    print(f"[parse] {len(yeni_mesajlar)} mesaj parse edildi.")

    if not yeni_mesajlar:
        print("UYARI: Hicbir mesaj parse edilemedi. Dosya formatini kontrol et.")
        sys.exit(1)

    mevcut = storage.permanent_gecmis_yukle()
    print(f"[mevcut] permanent_gecmis.json'da {len(mevcut)} mesaj var.")

    # Dedup: (kullanici, metin) kombinasyonu
    mevcut_seti = {(m.get("kullanici"), m.get("metin")) for m in mevcut}
    eklenen = 0
    for m in yeni_mesajlar:
        anahtar = (m["kullanici"], m["metin"])
        if anahtar in mevcut_seti:
            continue
        mevcut.append(m)
        mevcut_seti.add(anahtar)
        eklenen += 1

    storage.permanent_gecmis_kaydet(mevcut)
    print(f"[tamam] {eklenen} yeni mesaj eklendi. Toplam: {len(mevcut)}")
    print("Bot bir sonraki /ai cagrisinda bu mesajlari hatirlayacak.")


if __name__ == "__main__":
    main()
