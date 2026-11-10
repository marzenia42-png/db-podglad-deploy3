/* footer.js — WSPÓLNA stopka DB (JEDNO źródło, rodzeństwo header.js). 2026-08-04.
   Dwa tryby przez data-mode:
     data-mode="full"  → home: pełna zawartość (logo, opis, Kontakt, Nawigacja, social)
     data-mode="slim"  → reszta stron: © DB Meble + podpis wykonawcy
   WSPÓLNY PASEK PRAWNY (dane podmiotu + Polityka·Regulamin·Cookies) na dole OBU trybów —
   definiowany RAZ, w jednym miejscu (buildLegalBar). Legal NIE zależy od JS → każda strona
   ma też <noscript> z tymi samymi linkami.
   data-root = prefiks ścieżki do korzenia /new/ (jak header.js). Idempotentny.
   Full-mode korzysta z CSS stopki home (.wrap/.grid/.col/.contact/.social-row/.bottom/.footer-logo/.signature),
   które ZOSTAJĄ w <style> home; tu dowozimy tylko markup + CSS paska prawnego i trybu slim. */
(function () {
  'use strict';
  if (document.querySelector('footer[data-dbfoot]')) return;

  var sc = document.currentScript;
  var root = sc && sc.getAttribute('data-root');
  if (root == null) root = (document.body && document.body.getAttribute('data-root')) || '';
  var mode = (sc && sc.getAttribute('data-mode')) || 'slim';
  var GOLD = '#C8A96A';

  // === WSPÓLNY PASEK PRAWNY — JEDNO źródło (dane podmiotu + linki prawne) ===
  function buildLegalBar() {
    return '<div class="dbf-legalbar">'
      + '<span class="dbf-entity">DB MEBLE Beata Barut · ul. Słowackiego 90A, 32-400 Myślenice · NIP 9451353320 · REGON 120427300</span>'
      + '<span class="dbf-legal">'
      +   '<a href="' + root + 'polityka-prywatnosci.html">Polityka prywatności</a> · '
      +   '<a href="' + root + 'regulamin.html">Regulamin</a> · '
      +   '<a href="' + root + 'cookies.html">Cookies</a>'
      + '</span></div>';
  }

  // === CSS: pasek prawny + tryb slim (samodzielne; tryb full używa CSS stopki home) ===
  var css = [
    'footer[data-dbfoot] .dbf-legalbar{max-width:1240px;margin:0 auto;padding:16px clamp(20px,4vw,48px);border-top:1px solid rgba(200,169,106,.16);display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 22px;align-items:baseline;font:400 12.5px "DM Sans",system-ui,sans-serif;line-height:1.6}',
    'footer[data-dbfoot] .dbf-legalbar .dbf-entity{opacity:.62}',
    'footer[data-dbfoot] .dbf-legalbar .dbf-legal{display:flex;flex-wrap:wrap;gap:6px 14px}',
    'footer[data-dbfoot] .dbf-legalbar a{color:' + GOLD + ';text-decoration:none}',
    'footer[data-dbfoot] .dbf-legalbar a:hover{text-decoration:underline}',
    // slim
    'footer[data-dbfoot][data-mode="slim"]{background:#131316;border-top:1px solid rgba(200,169,106,.16);color:rgba(240,230,211,.7);font-family:"DM Sans",system-ui,sans-serif}',
    'footer[data-dbfoot][data-mode="slim"] .dbf-slim{max-width:1240px;margin:0 auto;padding:26px clamp(20px,4vw,48px) 6px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 22px;font-size:13px}',
    'footer[data-dbfoot][data-mode="slim"] .dbf-slim .dbf-sig{opacity:.6}',
    'footer[data-dbfoot][data-mode="slim"] .dbf-legalbar{border-top-color:rgba(200,169,106,.12)}',
    'html[data-theme="light"] footer[data-dbfoot][data-mode="slim"]{background:#F4F0E8;color:rgba(26,23,20,.7)}',
    'html[data-theme="light"] footer[data-dbfoot] .dbf-legalbar a{color:#7A6238}'
  ].join('');
  var st = document.createElement('style'); st.setAttribute('data-dbfoot-css', '1'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var f = document.createElement('footer');
  f.setAttribute('data-dbfoot', '1');
  f.setAttribute('data-mode', mode);

  if (mode === 'full') {
    // Zawartość stopki home (bez bloku danych podmiotu i bez linków prawnych — te są w pasku prawnym).
    f.innerHTML = '<div class="wrap"><div class="grid">'
      + '<div class="col">'
      +   '<img src="' + root + 'images/logo-db-nav.png?v=0a124bbb" alt="DB Meble" class="footer-logo">'
      +   '<p>Meble biurowe dla firm. Od jednego fotela po całe biuro — doradzamy, dostarczamy, montujemy. ponad 20 lat doświadczenia w branży, ponad 10 tysięcy realizacji dla 1500+ firm, kilkadziesiąt tysięcy m² wyposażonych przestrzeni w Polsce i Europie — Rzym, Londyn, Belfast, Berlin, Wiedeń, Barcelona.</p>'
      +   '<div class="social-row" aria-label="Social media">'
      +     '<a href="https://www.linkedin.com/in/dariusz-barut-67b761364" target="_blank" rel="noopener" class="social-icon" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M4 4h4v4H4z"/><path d="M4 10h4v10H4zM10 10h4v2c.8-1.3 2.2-2.3 4-2.3 3 0 4 2 4 5V20h-4v-5c0-1.4-.6-2.2-2-2.2s-2 .8-2 2.2v5h-4z"/></svg></a>'
      +     '<a href="https://www.facebook.com/dbconceptspace" target="_blank" rel="noopener" class="social-icon" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V5h-3c-2.2 0-4 1.8-4 4v2H7v3h3v8h3v-8h3l1-3h-4V9c0-.6.4-1 1-1z"/></svg></a>'
      +     '<a href="https://www.instagram.com/db_concept_space" target="_blank" rel="noopener" class="social-icon" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>'
      +   '</div>'
      + '</div>'
      + '<div class="col contact"><h4>Kontakt</h4><ul>'
      +   '<li><a href="tel:+48506147435">+48 506 147 435</a></li>'
      +   '<li><a href="mailto:dbmeble@dbmeble.pl">dbmeble@dbmeble.pl</a></li>'
      +   '<li>Pon–Pt 7:00–20:00</li>'
      + '</ul></div>'
      + '<div class="col"><h4>Nawigacja</h4><ul>'
      +   '<li><a href="' + root + '#kategorie">Kategorie</a></li>'
      +   '<li><a href="' + root + 'producenci/">Producenci</a></li>'
      +   '<li><a href="' + root + 'realizacje/">Realizacje</a></li>'
      +   '<li><a href="' + root + '#wiedza">Wiedza</a></li>'
      +   '<li><a href="' + root + 'faq/">FAQ</a></li>'
      +   '<li><a href="' + root + 'kontakt/">Kontakt</a></li>'
      + '</ul></div>'
      + '</div>'
      + '<div class="bottom"><span>© 2026 DB MEBLE Beata Barut</span></div>'
      + '</div>'
      + buildLegalBar();
  } else {
    f.innerHTML = '<div class="dbf-slim"><span>© 2026 DB Meble</span></div>'
      + buildLegalBar();
  }

  document.body.appendChild(f);

  // === KOSZYK ZAPYTAŃ (Moja Oferta) — globalne wpięcie offer.js (JEDNO źródło wpięcia, jak theme.js) ===
  // root = prefiks do korzenia /new/ → offer.js używa go dla akcji POST kontakt.php.
  try {
    window.DBM_OFFER_ROOT = root;
    // config.js (DBM_CONFIG) — offer.js potrzebuje OFFER_PHONE/OFFER_EMAIL także na stronach bez własnego config.js (np. /moja-oferta/).
    if (!window.DBM_CONFIG && !document.querySelector('script[data-dbm-config]')) {
      var cs = document.createElement('script');
      cs.src = root + 'config.js';
      cs.setAttribute('data-dbm-config', '1');
      document.body.appendChild(cs);
    }
    if (!document.querySelector('script[data-dbm-offer]')) {
      var os = document.createElement('script');
      os.src = root + 'offer.js';
      os.setAttribute('data-dbm-offer', '1');
      os.defer = true;
      document.body.appendChild(os);
    }
  } catch (e) {}
})();
