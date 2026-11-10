# Renders the social cards and PNG icons with Playwright (Python): python scripts/og.py
# Outputs: public/og/g2buzz.png (site), public/og/<slug>.jpg (one per quiz, 1200x630),
#          favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
# ponytail: paths come from __file__ and cwd, never argv: Python mangles the non-ASCII project path in argv.
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
pub = root / "public"
data = json.loads(subprocess.check_output(["node", "scripts/og-data.ts"], cwd=root))
svg = (pub / "favicon.svg").read_text(encoding="utf-8")
site = {
    "eyebrow": "Quizzes autorais em português",
    "title": "Descubra quem você é. Prove o que você sabe.",
    "html": "Descubra quem você é. <b>Prove o que você sabe.</b>",
    "meta": f"{len(data['quizzes'])} quizzes",
    "hue": "#fffdf7",
    "grid": data["categories"],
}

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1200, "height": 630})
    page.goto((root / "scripts" / "og.html").as_uri())
    page.evaluate("document.fonts.ready")
    (pub / "og").mkdir(exist_ok=True)
    page.evaluate("d => render(d)", site)
    page.screenshot(path=str(pub / "og" / "g2buzz.png"))
    for q in data["quizzes"]:
        page.evaluate("d => render(d)", q)
        page.screenshot(path=str(pub / "og" / f"{q['slug']}.jpg"), type="jpeg", quality=86)
    for name, size, pad in [("favicon-32.png", 32, 0), ("apple-touch-icon.png", 180, 16), ("icon-192.png", 192, 0), ("icon-512.png", 512, 0)]:
        page.set_viewport_size({"width": size, "height": size})
        bg = "#f4f1e8" if pad else "transparent"
        page.set_content(f'<body style="margin:0;background:{bg};display:grid;place-items:center;width:{size}px;height:{size}px">'
                         f'<div style="width:{size - 2 * pad}px;height:{size - 2 * pad}px">{svg.replace("<svg ", "<svg width=100% height=100% ")}</div></body>')
        page.screenshot(path=str(pub / name), omit_background=not pad)
    b.close()
print(f"og: public/og/g2buzz.png + {len(data['quizzes'])} quiz cards + icons")
