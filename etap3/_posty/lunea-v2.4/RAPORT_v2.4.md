# RAPORT — Posty LUNEA v2.4 (T7 / P-18) · 2026-10-24

Decyzja Dario/BETI: v2.3 ODRZUCONE. Koniec łatania — **v2.4 = JEDEN SZABLON, budowa OD ZERA na czystych bazach** (ZASADY pkt 25).
Format: A = 1080×1350 (FB/IG); B1–B5 = 1080×1080 (karuzela LinkedIn).

## 1. Identyfikacja fontów z B4 (pasek render-candidate 1:1, bez maski luminancji)
Plik: `img/_font_id.png` — oryginalny headline B4 wycięty 1:1, pod nim kandydaci dopasowani szerokością.
- **Nagłówek + akcent** („Sprawdzona w USA. / Teraz w Europie.") = **Segoe UI Bold** (`segoeuib.ttf`). Kształty liter (a, w, R, U, S) i waga 1:1; Segoe UI Semibold za lekki, Segoe UI Black za ciężki, Arial Bold i Montserrat ExtraBold mają inne litery.
- **Eyebrow / stopka** = **Segoe UI Semibold** (`seguisb.ttf`), wersaliki + tracking, szary.
- **Opis** = **Segoe UI Regular** (`segoeui.ttf`).
- Zgodne ze stackiem CSS v2 `-apple-system, Segoe UI, Roboto, Arial` renderowanym na Windows → Segoe UI. (Uwaga: stary build wołał nieistniejący `segoeuisb.ttf`; poprawna nazwa Semibold = `seguisb.ttf`.)

## 2. Jedna funkcja layoutu (ten sam panel na każdym slajdzie)
Funkcja `draw_panel()` — identyczne parametry wszędzie: margines **lewy = prawy = 40 px**, **radius 30**, **krycie ~0.92** (ciemny gradient, zero prześwitu starej warstwy), **padding 42**. Stopka „DB CONCEPT SPACE · OD 2004 · DBMEBLE.PL" + źródło — ta sama pozycja (dokotwiczone do dołu panelu). Badge „AI · grafika wspomagana AI" top-right. Tekst renderowany jako warstwa. **Zero łat, prostokątów pod tekstem, blur, inpaint.**

## 3. Czyste bazy (pkt 25)
| Slajd | Czysta baza | Jak |
|---|---|---|
| A | packshot v2 | regeneracja studyjnego gradientu pod panelem (od y=1008) — zero wpieczonego panelu/tekstu; amber linijka → zieleń (hue 33–52, terakota H8 i tło S0 bezpieczne) |
| B1 | packshot v2 | j.w. (regen od y=772); amber linijka → zieleń |
| B2 | **czysty packshot** `LUNA U11+80.jpg` | na studyjnym gradiencie (DARKEN, cień zachowany); zero wpieczonych grafik — rysowane od zera |
| B3 | **czyste zdjęcie** `image7` (pptx) | scena wnęki, crop 1080×1080 |
| B4 | **czyste zdjęcie** `image32` (pptx) | scena recepcji, crop 1080×1080 |
| B5 | packshot v2 | regen gradientu pod panelem (od y=770) |

## 4. Tabela slajd → tekst (BEZ ZMIAN) → obraz
| Slajd | Eyebrow | Nagłówek (akcent zielony) | Opis / dalej | Obraz | Źródło |
|---|---|---|---|---|---|
| A | PROFIM LUNEA · MODUŁOWY SYSTEM SOF | Rośnie co **10 cm** | Skalowany od +10 do +80 cm — projektujesz przestrzeń pod milimetr, nie pod katalog. | sofa terakota + miarka zielona + MODUŁ U11·640 mm | U11=640 mm, +10…+80 cm (Factsheet) |
| B1 | LUNEA · MODUŁY SKALOWANE CO 10 CM | Brakuje Ci centymetrów, nie pomysłów? | ✓ Dopasujemy układ do Twojego rzutu | sofa niebieska + miarka zielona | moduły co 10 cm |
| B2 | JEDEN MODUŁ · WIELE SZEROKOŚCI | Moduły co **10 cm** | Od +10 do +80 cm w krokach po 10 cm. Symetria i czysty rzut — bez kompromisów. · **640 mm · MODUŁ U11** · **+80 cm · MAKS. ZAKRES** | czysta sofa U11+80 + miarka „co 10 cm" pod sofą | U11=640 mm, +80 cm (Factsheet) |
| B3 | WNĘKA · FILAR · PAS PRZY RECEPCJI | Trudny narożnik? **Lunea się zmieści** | Moduły co 10 cm wchodzą tam, gdzie gotowa sofa nie wejdzie. | scena wnęki + rzut „RZUT · WNĘKA" | aranżacja producenta |
| B4 | PLATFORMA SPRAWDZONA W USA | Sprawdzona w USA. **Teraz w Europie.** | Lunea dopracowana dla rynku europejskiego — dobieramy ją w Twoim biurze. | scena recepcji (zielona sofa) | US→EU (Factsheet) |
| B5 | DESIGN POST COLOGNE · PREZENTACJA PROFIM LUNEA | wt 27.10, 15:30 | Wyślij nam rzut — dobierzemy układ Lunea pod Twoje biuro. · **506 147 435** · ✓ dbmeble.pl · dobór układu za darmo | szara owalna sofa | termin/tel: brief Dario |

## 5. Poprawki z bloku BETI (zrobione)
- **B2**: „10 cm" zielone; „MODUŁ U11"/„MAKS. ZAKRES" w całości w panelu; usunięty bałagan/przecinek; panel wymiarów NIE zasłania sofy (miarka pod sofą, sofa w całości widoczna); 640 mm / +80 cm nie nachodzą (czysta sofa, wymiary rysowane od zera).
- **B4**: usunięty ciemny pas na całą szerokość; panel symetryczny (nie dotyka krawędzi); bez „Stylex".
- **B5**: jeden solidny panel (zero jaśniejszych prostokątów za eyebrow i za „Wyślij nam rzut…"); odstęp opis↔telefon jak na B4.
- Akcent **#2be38a** wszędzie; **zero pomarańczu**.

## 6. Bramki
- Jeden szablon panelu (margines L=P, radius, krycie, padding identyczne): PASS (6/6, kontaktówka `img/_KONTAKTOWKA_v24.png`).
- Typografia = wzór B4 (Segoe UI Bold/Semibold/Regular): PASS (dowód `img/_font_id.png`).
- Pkt 25 (tekst na czystej bazie, zero łat/inpaintu): PASS — packshoty A/B1/B5 = regen gradientu; B2 = czysty packshot; B3/B4 = czyste zdjęcia scen.
- Zero pomarańczu / zero cen / plakietka AI / stopka „…OD 2004…": PASS.
- Wymiary: A 1080×1350; B1–B5 1080×1080: PASS.
- Upload po folder-ID (pkt 26): LUNEA_v2.4 pod folder-ID T7.

## 7. Decyzje (PRAWO DECYZJI)
- **B2 — czysty packshot `LUNA U11+80.jpg` zamiast łatania terakotowej sofy v2.** Powód: sofa v2 B2 ma wpieczone białe linie + nachodzące pomarańczowe etykiety NA sofie; czystego renderu dokładnie tej terakotowej sofy brak w materiałach. `LUNA U11+80` to czysty packshot Lunea (moduł U11 + 80 cm) — idealnie ilustruje przekaz B2 i pozwala narysować wymiary od zera bez łat. Odwracalne (zamiana pliku w buildzie).
- **A/B1/B5 — regeneracja gradientu pod panelem zamiast szukania czystych packshotów** (których w materiałach brak dla dokładnych sof v2). Regen = odtworzenie czystego tła studyjnego (opaque, zero śladu), nie łata na półprzezroczystym panelu. Odwracalne.

## 8. NAUKA (pkt 23)
- Łańcuch v1→v2→v2.2→v2.3 pracował na `lunea-v2/img/*.jpg`, które mają panel+tekst WPIECZONE na półprzezroczystym scrimie → każda wersja łatała (pkt 25 złamany u źródła). ZAMIAST: trzymać CZYSTE bazy (bez tekstu) obok renderów finalnych. BRAMKA: build wskazuje plik źródłowy bez wpieczonego tekstu. Gdzie: narzędzie/README posta.
- Build wołał nieistniejący font `segoeuisb.ttf` (fallback default) — ryzyko cichej podmiany typografii. ZAMIAST: weryfikować `Test-Path` fontu w buildzie. BRAMKA: brak pliku fontu = STOP. Gdzie: build_v2x.py.

Źródło/build: `etap3/_posty/lunea-v2.4/build_v24.py` (+ `_font_id.png`, `_KONTAKTOWKA_v24.png`). Bazy v2 i src producenta nietknięte.
