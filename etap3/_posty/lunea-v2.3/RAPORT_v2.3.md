# RAPORT — Posty LUNEA v2.3 (T7 / P-18) · 2026-10-24

Zakres: TYLKO **B2, B4, B5**. A / B1 / B3 bez zmian (kopia z v2.2, zatwierdzone).
Format: A = 1080×1350; B1–B5 = 1080×1080. Metoda: kompozyt PIL na bazie JPG v2.
Zasada **pkt 25** (nowa, 24.10): zero łatania/inpaintu na półprzezroczystym scrimie — tekst = osobna warstwa na NIEPRZEZROCZYSTEJ bazie. Bramka: zrzut 100% = zero śladu.

## Identyfikacja fontu eyebrow (wymóg B5)
- Rodzina: **Segoe UI** — pipeline deploy3 renderuje z CSS font-stack `-apple-system, Segoe UI, Roboto, Arial`; na Windows headless pierwszy dostępny = **Segoe UI**. Eyebrow A/B1/B4 (zapieczone) i B5 (rysowany) = ta sama rodzina.
- Waga: **Semibold** (seguisb.ttf). Pomiar eyebrow A „PROFIM LUNEA · MODUŁOWY SYSTEM SOF": szer. ~341 px, capH ~13 px ⇒ Segoe UI Semibold ~17–18 px, tracking ~1–2 px.
- Wniosek: v2.2 B5 użyła Segoe UI Semibold 17/tr2 — **zgodne** z A/B1. v2.3 ustawia **Segoe UI Semibold 18 / tracking 1,5** dla pełnej parytetowości rozmiaru.

## Tabela: slajd → tekst (finalny) → obraz (OBRAZ = TREŚĆ TEKSTU)
| Slajd | Eyebrow | Headline | Dalej | Obraz | Źródło liczb |
|---|---|---|---|---|---|
| A (1350) | PROFIM LUNEA · MODUŁOWY SYSTEM SOF | Rośnie co **10 cm** | miarki zielone: +10 cm · MODUŁ U11 · 640 mm | sofa terakota + miarki | U11=640 mm, +10…+80 cm (Factsheet) |
| B1 | LUNEA · MODUŁY SKALOWANE CO 10 CM | Brakuje Ci centymetrów, nie pomysłów? | ✓ Dopasujemy układ do Twojego rzutu; miarka „co 10 cm" | sofa niebieska + miarka | moduły co 10 cm |
| **B2** | JEDEN MODUŁ · WIELE SZEROKOŚCI | Moduły co **10 cm** | wstążka spec: **640 mm** (MODUŁ U11) + **+80 cm** (MAKS. ZAKRES) + zielona linia wymiarowa | sofa terakota + wstążka | U11=640 mm, +80 cm (Factsheet) |
| B3 | WNĘKA · FILAR · PÓŁ PRZY RECEPCJI | Trudny narożnik? Lunea się zmieści | zielony rzut „RZUT · WNĘKA" | wnętrze + obrys wnęki | aranżacja producenta |
| **B4** | PLATFORMA SPRAWDZONA W USA *(bez „(Stylex)")* | Sprawdzona w USA. / Teraz w Europie. | stopka-R: „Źródło: Lunea Product Factsheet (adaptacja EU)." *(bez „platforma Stylex")* | aranżacja zielona sofa | US→EU (Factsheet) |
| **B5** | DESIGN POST COLOGNE · PREZENTACJA PROFIM LUNEA *(Segoe UI Semibold = font A/B1)* | wt 27.10, 15:30 | Wyślij nam rzut — dobierzemy układ Lunea pod Twoje biuro. · tel **506 147 435** (zielony) · ✓ dbmeble.pl · dobór układu za darmo | sofa szara | termin/tel: brief Dario |

## Przegląd 100% (co widać po renderze)
- **B2** — stare nachodzące pille (640 mm×+80 cm), ciemna łata i białe strzałki (długa ukośna linia do okrągłego końca) ZAKRYTE nieprzezroczystą wstążką (pełne krycie). „640 mm" i „+80 cm" wyraźnie rozsunięte, czytelne, zielony glow; zielona linia wymiarowa z końcówkami i strzałkami; podpisy „MODUŁ U11" / „MAKS. ZAKRES". **Zero śladów** starych elementów.
- **B4** — eyebrow „PLATFORMA SPRAWDZONA W USA": „(Stylex)" usunięte, brak smugi po łacie (świeże nieprzezroczyste pasmo, feather w scrim). Headline/lead nietknięte. Stopka prawa „…(adaptacja EU)." — „platforma Stylex" usunięte, bez pionowego szwu (kolor pasma = zmierzony scrim 90,84,76).
- **B5** — eyebrow Segoe UI Semibold 18/tr1,5 szary, spójny z A/B1; telefon „506 147 435" zielony+glow; body czyste; panel solidny (fill bez szwu).
- **A / B1 / B3** — bez zmian (kopia 1:1 z v2.2).

## Bramki
- Zero śladów (pkt 25): PASS — zweryfikowane zbliżeniami 100% (B2 wstążka, B4 eyebrow+stopka, B5 panel).
- Font B5 = Segoe UI Semibold (= eyebrow A/B1): PASS.
- Zero cen / rabatów: PASS. Plakietka AI (AI Act): zachowana. Stopka „DB CONCEPT SPACE · OD 2004 · DBMEBLE.PL": zachowana.
- Wymiary: A 1080×1350; B1–B5 1080×1080 (weryfikacja w raporcie sesji).
- Upload po folder-ID (pkt 26): LUNEA_v2.3 = `1sAFSxEnAcufhS_CqCFbhnBhcmYdUhOmg` (w T7 `1kSz_nu5Q0u5-4Bqdw-1BFW_9BCw-oL6u`), jeden jednoznaczny folder.

Źródło/build: `etap3/_posty/lunea-v2.3/` (build_v23.py, assemble_v23.py). Baza v2 nietknięta.
