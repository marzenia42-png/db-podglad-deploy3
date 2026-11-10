# PLAN — Posty Lunea v2.2 (T7 / P-18) · 2026-10-23

Źródło bazowe: `etap3/_posty/lunea-v2/img/*.jpg` (A 1080×1350, B1–B5 1080×1080).
Metoda: kompozyt HTML/CSS na bazie JPG v2 → render headless (Edge) → PNG. Sofy/aranżacje NIETKNIĘTE (zachowane z bazy, zatwierdzone przez BETI 22.10).

## Token kolorów (jeden HEX)
- **NEON ZIELONY = `#2be38a`** (token `--gr` z v2) — zastępuje pomarańcz `--o: #ff7a1a` WSZĘDZIE (A/B1/B2/B5).
- glow zielony: `text-shadow: 0 0 .35em #2be38a, 0 0 .9em rgba(43,227,138,.6)`.
- panel `#171a21`, linia `#262b35`, tekst `#e8e9ec`, muted `#9aa1ad`, złoto `#c9a96e`.
- miarki/linie wymiarowe: **2× większe** + glow zielony, czytelne z telefonu.

## Zmiany per slajd (slajd → tekst → obraz → źródło)

| Slajd | Tekst (finalny) | Obraz / nakładka | Źródło faktu |
|---|---|---|---|
| **A** (1080×1350, FB+IG) | headline „Rośnie co **10 cm**" (10 cm = ZIELONY+glow); eyebrow „PROFIM LUNEA · MODUŁOWY SYSTEM SOF"; podlead bez zmian | linijka + „+10 cm" + pill „MODUŁ U11 · 640 mm" + linia wymiarowa → **zielone, 2× większe, glow**; sofa czerwona bez zmian | U11=640 mm, +10…+80 cm → MANIFEST_LUNEA §2 / factsheet |
| **B1** (1080×1080, hook) | headline „Brakuje Ci centymetrów, nie pomysłów?"; ✓ „Dopasujemy układ do Twojego rzutu" (już zielony) | linijka „co 10 cm" → **zielona, 2× większa, glow**; sofa niebieska bez zmian | moduły co 10 cm → MANIFEST §2 |
| **B2** (1080×1080, mechanizm) | headline „Moduły co **10 cm**" (10 cm = ZIELONY+glow); podlead bez zmian | strzałki + „+10/+20/+80 cm" + „640 mm" → **zielone, 2× większe, glow, rozsunięte (bez nachodzenia)**; sofa terakota bez zmian | +10…+80 cm, U11=640 mm → MANIFEST §2 |
| **B3** (1080×1080, dopasowanie) | bez zmian tekstu (już zielony) | rzut „RZUT · WNĘKA" ujednolicić do `#2be38a` (glow) jeśli różni | aranżacja producenta |
| **B4** (1080×1080, wiarygodność) | eyebrow „PLATFORMA SPRAWDZONA W USA" (**USUNĄĆ „(STYLEX)"**); headline „Sprawdzona w USA. / Teraz w Europie." (zielony) bez zmian; footer bez nazwy Stylex | aranżacja zielona bez zmian | „sprawdzona w USA, teraz w Europie" (platforma US→EU) → MANIFEST, decyzja Dario: nie nazywać OEM |
| **B5** (1080×1080, CTA) | eyebrow „DESIGN POST COLOGNE · PREZENTACJA PROFIM **LUNEA**"; „wt 27.10, 15:30"; body „**Wyślij** nam rzut — dobierzemy układ Lunea **pod Twoje biuro.**"; **tel „506 147 435" = ZIELONY+glow**; ✓ „dbmeble.pl · dobór układu za darmo" (zielony) | sofa szara bez zmian | termin/tel = brief Dario (P-18); event „Design Post Cologne 27.10 15:30" |

## Wyjście
- `img/A.png` (1080×1350) + `img/B1..B5.png` (1080×1080)
- `img/lunea_karuzela_linkedin.pdf` (B1→B5)
- `index.html` (podgląd, noindex)
- → Drive KONTROLA/T7/LUNEA_v2.2

## Zasady (pkt 11/21)
Każda liczba ze źródła (640 mm, +10…+80 cm). Zero cen/rabatów. „10 cm" ze spacją nierozdzielną. Plakietka „AI grafika wspomagana AI" zostaje (AI Act). Stopka „DB CONCEPT SPACE · OD 2004 · DBMEBLE.PL" (nie „20 lat").
