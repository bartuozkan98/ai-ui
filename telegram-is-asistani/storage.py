import json
import os
from datetime import datetime

from config import DATA_DIR

FIKIRLER_PATH = os.path.join(DATA_DIR, "fikirler.json")
IS_AKIS_PATH = os.path.join(DATA_DIR, "is_akis_plani.json")


def _ensure_data_files() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(FIKIRLER_PATH):
        _write_json(FIKIRLER_PATH, {})
    if not os.path.exists(IS_AKIS_PATH):
        _write_json(IS_AKIS_PATH, {"planlar": []})


def _read_json(path: str) -> dict | list:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_json(path: str, data: dict | list) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _get_fikirler() -> dict:
    _ensure_data_files()
    return _read_json(FIKIRLER_PATH)


def _save_fikirler(fikirler: dict) -> None:
    _write_json(FIKIRLER_PATH, fikirler)


def _get_planlar() -> dict:
    _ensure_data_files()
    return _read_json(IS_AKIS_PATH)


def _save_planlar(planlar: dict) -> None:
    _write_json(IS_AKIS_PATH, planlar)


def sonraki_fikir_id() -> str:
    fikirler = _get_fikirler()
    if not fikirler:
        return "F001"
    max_num = max(int(fid[1:]) for fid in fikirler)
    return f"F{max_num + 1:03d}"


def fikir_ekle(metin: str, kullanici_adi: str, analiz: str) -> str:
    fikirler = _get_fikirler()
    fikir_id = sonraki_fikir_id()
    fikirler[fikir_id] = {
        "id": fikir_id,
        "metin": metin,
        "onerilen_by": kullanici_adi,
        "tarih": datetime.now().isoformat(),
        "durum": "beklemede",
        "analiz": analiz,
        "plan": None,
        "red_gerekce": None,
    }
    _save_fikirler(fikirler)
    return fikir_id


def fikir_getir(fikir_id: str) -> dict | None:
    fikirler = _get_fikirler()
    return fikirler.get(fikir_id.upper())


def tum_fikirleri_getir() -> dict:
    return _get_fikirler()


def fikir_durumu_guncelle(fikir_id: str, durum: str, **kwargs: str) -> bool:
    fikirler = _get_fikirler()
    fid = fikir_id.upper()
    if fid not in fikirler:
        return False
    fikirler[fid]["durum"] = durum
    for key, value in kwargs.items():
        if key in fikirler[fid]:
            fikirler[fid][key] = value
    _save_fikirler(fikirler)
    return True


def plan_kaydet(fikir_id: str, fikir_metni: str, plan_metni: str) -> None:
    data = _get_planlar()
    # Remove existing plan for this fikir_id if any
    data["planlar"] = [p for p in data["planlar"] if p["fikir_id"] != fikir_id.upper()]
    data["planlar"].append({
        "fikir_id": fikir_id.upper(),
        "fikir_metni": fikir_metni,
        "plan_metni": plan_metni,
        "onayland_tarih": datetime.now().isoformat(),
        "durum": "aktif",
    })
    _save_planlar(data)

    # Also update the fikir record
    fikirler = _get_fikirler()
    fid = fikir_id.upper()
    if fid in fikirler:
        fikirler[fid]["plan"] = plan_metni
        _save_fikirler(fikirler)


def onaylanan_planlari_getir() -> list[dict]:
    data = _get_planlar()
    return [p for p in data["planlar"] if p["durum"] == "aktif"]
