/* DB NEW — konfiguracja globalna / feature flagi.
   Ceny i program lojalnościowy SĄ PRZYGOTOWANE ARCHITEKTONICZNIE, ale WYŁĄCZONE.
   Dario włącza ręcznie zmieniając flagę na true. */
window.DBM_CONFIG = {
  // ——— CENY (domyślnie OFF — nie pokazujemy cen publicznie) ———
  SHOW_PRICES: false,          // true → karty produktu pokazują netto/brutto
  SHOW_VAT_BREAKDOWN: true,    // true → osobno netto i brutto; false → tylko brutto
  VAT_RATE: 0.23,              // do wyliczenia brutto z netto gdy brak brutto
  CURRENCY: 'PLN',

  // ——— RABATY / LOJALNOŚĆ (OFF) ———
  LOYALTY_ENABLED: false,      // true → zalogowany klient widzi cenę po rabacie
  NEWSLETTER_DISCOUNT_PCT: 5,  // rabat za zapis do newslettera (kod w „Mojej Ofercie")
  PRICE_ON_REQUEST_FALLBACK: true, // brak ceny w bazie → „Cena na zapytanie”

  // ——— ŹRÓDŁO CEN ———
  PRICES_URL: '/prices.json',  // mapa slug → {cena_netto, cena_brutto, rabat_procent, cena_na_zapytanie}

  // ——— MOJA OFERTA (B2B) ———
  OFFER_ENABLED: true,
  OFFER_EMAIL: 'dbmeble@dbmeble.pl',
  OFFER_PHONE: '506 147 435',
  OFFER_MAX_COMPARE: 4,

  // ——— DANE FIRMY (źródło prawdy kontaktu: stopka / asystent AI; dopisane T4 18.10, do przeglądu T2) ———
  COMPANY_LEGAL: 'DB MEBLE Beata Barut',          // nazwa prawna (faktura, regulamin)
  COMPANY_BRAND: 'DB Concept Space',              // marka handlowa (KANON §4)
  COMPANY_ADDRESS: 'ul. Słowackiego 90A, 32-400 Myślenice',
  CONTACT_PHONE_BEATA: '504 120 777',             // Beata
  CONTACT_PHONE_DARIUSZ: '506 147 435',           // Dariusz (= OFFER_PHONE)
  CONTACT_EMAIL: 'dbmeble@dbmeble.pl',
  CONTACT_WHATSAPP: '48506147435'                 // format E.164 bez '+'
};
