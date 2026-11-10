# -*- coding: utf-8 -*-
"""Skl: PDF (B1-B5) + podglad HTML v2.2."""
import os
from PIL import Image
Image.init()   # wymagane: inaczej PDF save -> KeyError 'JPEG'
D = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2.2"
IMG = os.path.join(D,"img")

# --- PDF B1..B5 ---
pages=[Image.open(os.path.join(IMG,f"B{i}.png")).convert("RGB") for i in range(1,6)]
pdf=os.path.join(IMG,"lunea_karuzela_linkedin.pdf")
pages[0].save(pdf, save_all=True, append_images=pages[1:], resolution=150.0)
print("PDF:", pdf, os.path.getsize(pdf), "B")

# --- podglad HTML ---
html = """<!doctype html><html lang="pl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Posty Lunea v2.2 — podgląd (publikacja wt 27.10)</title>
<style>
:root{--bg:#0f1115;--card:#171a21;--line:#262b35;--tx:#e8e9ec;--mut:#9aa1ad;--gold:#c9a96e;--gr:#2be38a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif}
header{padding:22px 16px;border-bottom:1px solid var(--line)}
header h1{margin:0 0 4px;font-size:21px} header .m{color:var(--mut);font-size:13px}
.wrap{max-width:1180px;margin:0 auto;padding:18px 16px 60px}
h2{font-size:16px;letter-spacing:.04em;text-transform:uppercase;color:var(--gold);border-bottom:1px solid var(--line);padding-bottom:8px;margin:30px 0 14px}
.grid{display:grid;gap:16px;grid-template-columns:1fr 1fr}
@media(min-width:780px){.grid{grid-template-columns:repeat(3,1fr)} .grid.two{grid-template-columns:1fr 1fr;max-width:720px}}
.g{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.g img{width:100%;display:block;background:#0b0d11}
.g figcaption{padding:9px 12px;font-size:13px;color:var(--mut)}
.note{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-top:14px;font-size:14px;color:#d7dae0}
.note b{color:#fff} .gr{color:var(--gr)}
.pdf{display:inline-block;margin-top:10px;background:var(--gold);color:#1a1205;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:9px}
ul{margin:8px 0 0;padding-left:20px} li{margin:3px 0}
</style></head><body>
<header><h1>Posty Lunea <span style="color:var(--gold)">v2.2 · T7 / P-18</span></h1>
<div class="m">Publikacja: wtorek 27.10. Neon <span class="gr">ZIELONY</span> (jeden HEX <b>#2be38a</b>) zamiast pomarańczowego; miarki/linie większe + glow; B4 bez „(Stylex)"; B5 nowy CTA. Noindex. 2026-10-23.</div></header>
<div class="wrap">

<h2>FB + IG — grafika główna (A · 1080×1350)</h2>
<div class="grid two">
<figure class="g"><a href="img/A.png" target="_blank" rel="noopener"><img loading="lazy" src="img/A.png" alt="A — linijka i miarki zielone, 10 cm zielony"></a><figcaption>A — neon zielony; „MODUŁ U11 · 640 mm" + linia wymiarowa większe, glow</figcaption></figure>
</div>

<h2>LinkedIn — karuzela (B1 → B5 · 1080×1080)</h2>
<div class="grid">
<figure class="g"><a href="img/B1.png" target="_blank"><img loading="lazy" src="img/B1.png" alt="B1 hook"></a><figcaption>B1 · hook — linijka zielona, większa</figcaption></figure>
<figure class="g"><a href="img/B2.png" target="_blank"><img loading="lazy" src="img/B2.png" alt="B2 mechanizm"></a><figcaption>B2 · mechanizm — „640 mm"/„+80 cm" większe, zielone, czytelne</figcaption></figure>
<figure class="g"><a href="img/B3.png" target="_blank"><img loading="lazy" src="img/B3.png" alt="B3 dopasowanie"></a><figcaption>B3 · dopasowanie — rzut zielony</figcaption></figure>
<figure class="g"><a href="img/B4.png" target="_blank"><img loading="lazy" src="img/B4.png" alt="B4 wiarygodnosc"></a><figcaption>B4 · wiarygodność — bez „(Stylex)" w nagłówku</figcaption></figure>
<figure class="g"><a href="img/B5.png" target="_blank"><img loading="lazy" src="img/B5.png" alt="B5 CTA"></a><figcaption>B5 · CTA — Design Post Cologne, wt 27.10 15:30, tel zielony</figcaption></figure>
</div>
<a class="pdf" href="img/lunea_karuzela_linkedin.pdf" target="_blank">⬇ PDF karuzeli LinkedIn (B1–B5)</a>

<div class="note">
<b>Zmiany vs v2:</b>
<ul>
<li>Neon <span class="gr">ZIELONY #2be38a</span> wszędzie zamiast pomarańczowego (A/B1/B2/B5): „10 cm", linijka, telefon.</li>
<li>Miarki i linie wymiarowe większe + glow, czytelne z telefonu (A, B1, B2).</li>
<li><b>B4</b> — usunięto „(Stylex)" z nagłówka.</li>
<li><b>B5</b> — „PREZENTACJA PROFIM LUNEA"; „<b>Wyślij</b> nam rzut — dobierzemy układ Lunea <b>pod Twoje biuro</b>."; telefon 506 147 435 zielony; „dbmeble.pl · dobór układu za darmo".</li>
</ul>
<b>Źródła:</b> U11 = 640 mm; moduły skalowane co 10 cm (+10…+80 cm) — Lunea Product Factsheet (Profim). Sofy/aranżacje = zdjęcia producenta (bez zmian). Plakietka AI (AI Act) zachowana.
</div>
</div></body></html>"""
open(os.path.join(D,"index.html"),"w",encoding="utf-8").write(html)
print("HTML:", os.path.join(D,"index.html"))
