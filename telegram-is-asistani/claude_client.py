from openai import OpenAI

from config import OPENROUTER_API_KEY
from prompts import FIKIR_ANALIZ_PROMPT, IS_AKIS_PLANI_PROMPT, KONUSMA_OZETI_PROMPT

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)
MODEL = "anthropic/claude-sonnet-4-20250514"


def _chat(prompt: str, max_tokens: int = 1024) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


async def fikir_analiz_et(fikir: str) -> str:
    prompt = FIKIR_ANALIZ_PROMPT.format(fikir=fikir)
    return _chat(prompt, max_tokens=1024)


async def is_akis_plani_olustur(fikir: str, analiz: str) -> str:
    prompt = IS_AKIS_PLANI_PROMPT.format(fikir=fikir, analiz=analiz)
    return _chat(prompt, max_tokens=2048)


async def konusma_ozeti_olustur(mesajlar: str) -> str:
    prompt = KONUSMA_OZETI_PROMPT.format(mesajlar=mesajlar)
    return _chat(prompt, max_tokens=1024)
