import anthropic

from config import ANTHROPIC_API_KEY
from prompts import FIKIR_ANALIZ_PROMPT, IS_AKIS_PLANI_PROMPT, KONUSMA_OZETI_PROMPT

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
MODEL = "claude-sonnet-4-20250514"


async def fikir_analiz_et(fikir: str) -> str:
    prompt = FIKIR_ANALIZ_PROMPT.format(fikir=fikir)
    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


async def is_akis_plani_olustur(fikir: str, analiz: str) -> str:
    prompt = IS_AKIS_PLANI_PROMPT.format(fikir=fikir, analiz=analiz)
    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


async def konusma_ozeti_olustur(mesajlar: str) -> str:
    prompt = KONUSMA_OZETI_PROMPT.format(mesajlar=mesajlar)
    message = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text
