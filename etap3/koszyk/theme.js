/**
 * DB Meble — Theme toggle (jasny/ciemny)
 * localStorage 'dbm_theme' = 'light' | 'dark' (default: dark)
 * Auto-inject toggle button do .nav · idempotent.
 *
 * Pre-paint apply MUSI być w <head> jako inline script:
 *   <script>(function(){try{var t=localStorage.getItem('dbm_theme');
 *     if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();</script>
 */
(function(){
  'use strict';

  var THEME_KEY = 'dbm_theme';

  function getTheme(){
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme){
    if (theme === 'light'){
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function setTheme(theme){
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
    updateControls();
    swapLogos(theme);
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'theme_toggle', theme_label: theme});
      if (typeof gtag === 'function'){
        gtag('event','theme_toggle',{event_category:'ui', event_label: theme, send_to:'G-T68TM6H9F5'});
      }
    } catch(e){}
  }

  function svgSun(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<circle cx="12" cy="12" r="4"/>'
      + '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'
      + '</svg>';
  }
  function svgMoon(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
      + '</svg>';
  }

  // Przełącznik napisowy „Tryb jasny | Tryb ciemny" — aktywny bold + złote podkreślenie, aria-pressed (BLOK L, T8)
  function buildSwitch(inMenu){
    var w = document.createElement('div');
    w.className = 'theme-switch' + (inMenu ? ' ts-in-menu' : '');
    w.setAttribute('role', 'group');
    w.setAttribute('aria-label', 'Motyw kolorystyczny');
    w.innerHTML =
      '<button type="button" class="ts-opt" data-set="light">Tryb jasny</button>'
      + '<span class="ts-sep" aria-hidden="true">|</span>'
      + '<button type="button" class="ts-opt" data-set="dark">Tryb ciemny</button>';
    w.querySelectorAll('.ts-opt').forEach(function(o){
      o.addEventListener('click', function(){ setTheme(o.getAttribute('data-set')); });
    });
    return w;
  }

  function updateControls(){
    var theme = getTheme();
    // Napisy: aktywny = aria-pressed=true (CSS daje bold + złote podkreślenie)
    document.querySelectorAll('.theme-switch .ts-opt').forEach(function(o){
      o.setAttribute('aria-pressed', o.getAttribute('data-set') === theme ? 'true' : 'false');
    });
    // Ikona mobilna: pokazuje docelowy tryb
    document.querySelectorAll('.theme-toggle').forEach(function(b){
      b.innerHTML = theme === 'light' ? svgMoon() : svgSun();
      b.setAttribute('aria-label', theme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny');
      b.setAttribute('title', theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny');
      b.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    });
  }

  // Logo per motyw — PODMIANA PLIKU (grafit na jasnym tle), BEZ filter:invert (BLOK L, T8)
  var LOGO_PAIRS = [
    // NAV: pasek zawsze ciemny (ETAP 1) -> nav-logo ZAWSZE logo-db-nav.png (bialy, przezroczysty).
    // Podmiana na logo-db-nav-jasna.png (wypalone beżowe tło) dawala bezowy prostokat na ciemnym pasku -> usunieta.
    ['logo-db-white.png', 'logo-db-black.png'],      // kategorie (.m-logo, noscript): biały -> czarny
    ['logo-db-hero.png', 'logo-db-black.png']        // hero (jeśli używane): biały -> czarny
  ];
  function swapLogos(theme){
    var toLight = theme === 'light';
    document.querySelectorAll('img.brand-logo,img.footer-logo,img.hero-logo,img.m-logo').forEach(function(img){
      var src = img.getAttribute('src'); if (!src) return;
      var qi = src.indexOf('?'), qs = qi >= 0 ? src.slice(qi) : '', base = qi >= 0 ? src.slice(0, qi) : src;
      var file = base.split('/').pop();
      for (var i = 0; i < LOGO_PAIRS.length; i++){
        var d = LOGO_PAIRS[i][0], l = LOGO_PAIRS[i][1];
        if (toLight && file === d){ img.setAttribute('src', base.slice(0, base.length - d.length) + l + qs); return; }
        if (!toLight && file === l){ img.setAttribute('src', base.slice(0, base.length - l.length) + d + qs); return; }
      }
    });
  }

  function injectButton(){
    var nav = document.querySelector('nav.nav');
    if (!nav) return;

    if (!nav.querySelector('.theme-switch')){
      var navCta = nav.querySelector('.nav-cta');
      var parent = (navCta && navCta.parentNode) ? navCta.parentNode : nav;
      var before = (navCta && navCta.parentNode) ? navCta : null;

      // Napisy (desktop) — CSS chowa je <980px na rzecz ikony
      var sw = buildSwitch(false);
      parent.insertBefore(sw, before);

      // Ikona (pasek mobilny) — CSS pokazuje ją tylko <980px
      var ic = document.createElement('button');
      ic.type = 'button';
      ic.className = 'theme-toggle';
      ic.innerHTML = svgSun();
      ic.addEventListener('click', function(){
        setTheme(getTheme() === 'light' ? 'dark' : 'light');
      });
      parent.insertBefore(ic, before);
    }
    updateControls();
    swapLogos(getTheme());
  }

  // CSS injection (idempotent) — przycisk + light theme tokens
  if (!document.getElementById('dbm-theme-styles')){
    var css = document.createElement('style');
    css.id = 'dbm-theme-styles';
    css.textContent = [
      // === PRZEŁĄCZNIK NAPISOWY „Tryb jasny | Tryb ciemny" (BLOK L, T8) — aktywny bold + złote podkreślenie ===
      '.theme-switch{display:inline-flex;align-items:center;gap:8px;flex-shrink:0}',
      '.ts-opt{appearance:none;background:none;border:0;border-bottom:2px solid transparent;padding:2px 1px;margin:0;cursor:pointer;font-family:inherit;font-size:13px;letter-spacing:.04em;line-height:1.25;white-space:nowrap;color:var(--cream-2,#8A8A92);transition:color .15s ease,border-color .15s ease}',
      '.ts-opt:hover{color:var(--gold,#C8A96A)}',
      '.ts-opt[aria-pressed="true"]{font-weight:700;color:var(--gold,#C8A96A);border-bottom-color:var(--gold,#C8A96A)}',
      '.ts-sep{opacity:.4;user-select:none;font-size:12px;color:var(--cream-2,#8A8A92)}',
      // Ikona motywu — TYLKO pasek mobilny (<980px); desktop używa napisów
      '.theme-toggle{display:none;appearance:none;cursor:pointer;width:40px;height:40px;border-radius:50%;border:1.5px solid var(--gold,#C8A96A);background:var(--gold-soft,rgba(200,169,106,.14));color:var(--gold,#C8A96A);align-items:center;justify-content:center;transition:background .15s ease,color .15s ease,border-color .15s ease;flex-shrink:0}',
      '.theme-toggle:hover{background:var(--gold,#C8A96A);color:var(--ink,#1A1714);border-color:var(--gold,#C8A96A)}',
      '.theme-toggle svg{width:18px;height:18px}',
      // Pasek: <980px napisy schodzą, wchodzi ikona
      '@media (max-width:979px){.nav .theme-switch:not(.ts-in-menu){display:none}.nav .theme-toggle{display:inline-flex}}',
      // Przełącznik napisowy w menu hamburgera — widoczny tylko w otwartym menu mobilnym
      '.nav-center .theme-switch.ts-in-menu{display:none;width:100%;justify-content:center;padding-top:14px;margin-top:8px;border-top:1px solid var(--line,rgba(200,169,106,.18))}',
      '@media (max-width:979px){.nav.dbm-menu-open .nav-center .theme-switch.ts-in-menu{display:inline-flex}}',
      '.nav-center .theme-switch.ts-in-menu .ts-opt{font-size:15px;padding:6px 2px}',
      // === PRZYCISK WHATSAPP (numer edytuj w funkcji injectWhatsApp ponizej) ===
      '.dbm-wa{position:fixed;right:22px;bottom:22px;z-index:60;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px -6px rgba(37,211,102,.55),0 2px 8px rgba(0,0,0,.25);transition:transform .25s cubic-bezier(.2,.7,.2,1),box-shadow .25s ease;text-decoration:none}',
      '.dbm-wa:hover{transform:scale(1.08);box-shadow:0 12px 30px -6px rgba(37,211,102,.75)}',
      '.dbm-wa svg{width:32px;height:32px;fill:#fff}',
      '.back-to-top{bottom:90px!important}',
      // === SEKCJA PLIKI DO POBRANIA (PDF) ===
      '.pliki-section .pliki-list{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}',
      '.pdf-link{display:inline-flex;align-items:center;gap:10px;padding:14px 20px;border:1px solid var(--gold,#C8A96A);border-radius:6px;color:var(--gold,#C8A96A);text-decoration:none;font-size:14px;transition:background .25s ease,color .25s ease}',
      '.pdf-link:hover{background:var(--gold,#C8A96A);color:var(--ink,#1A1714)}',
      '.pdf-link svg{width:20px;height:20px;flex-shrink:0;fill:currentColor}',
      // === GALERIA ZDJĘĆ PRODUKTU ===
      '.dbm-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:8px}',
      '.dbm-gallery img{width:100%;border-radius:6px;background:#fff;aspect-ratio:4/3;object-fit:cover;border:1px solid var(--line,rgba(200,169,106,.18))}',
      '@media (max-width:600px){.dbm-wa{width:50px;height:50px;right:16px;bottom:16px}.dbm-wa svg{width:28px;height:28px}.back-to-top{bottom:76px!important}}',
      // === MENU MOBILNE (hamburger) — .nav-center jest display:none <980px, brak natywnego toggle ===
      '.dbm-burger{display:none;appearance:none;cursor:pointer;width:42px;height:42px;border-radius:8px;border:1px solid var(--gold,#C8A96A);background:rgba(200,169,106,.12);color:var(--gold,#C8A96A);align-items:center;justify-content:center;flex-shrink:0}',
      '.dbm-burger svg{width:22px;height:22px;pointer-events:none}',
      '@media (max-width:979px){.dbm-burger{display:inline-flex}}',
      '@media (max-width:979px){.nav.dbm-menu-open .nav-center{display:flex!important;flex-direction:column;align-items:flex-start;gap:2px;position:absolute;top:100%;left:0;right:0;background:var(--ink,#15110D);border-top:1px solid var(--line,rgba(200,169,106,.18));border-bottom:1px solid var(--line,rgba(200,169,106,.18));padding:14px var(--pad-x,24px);box-shadow:0 18px 40px -12px rgba(0,0,0,.6);max-height:82vh;overflow-y:auto}}',
      '@media (max-width:979px){.nav.dbm-menu-open .nav-center>a,.nav.dbm-menu-open .nav-center>.nav-trigger{padding:13px 2px;width:100%;font-size:15px;letter-spacing:.1em;border-bottom:1px solid var(--line,rgba(200,169,106,.10))}}',
      '@media (max-width:979px){.nav.dbm-menu-open .mega-menu{display:none!important}}',
      // ===== HOTFIX MENU MOBILNE (2026-08-17, T2) — nie kasuje reguł powyżej, tylko dodaje wyższą specyficzność =====
      // (b) KONTRAST NIEZALEŻNY OD :not(.scrolled). Tło i tekst otwartego panelu z TEJ SAMEJ pary tokenów motywu:
      //     tło = var(--ink), tekst = var(--cream). W trybie ciemnym: ciemne tło + jasny tekst; w jasnym: jasne tło + ciemny tekst.
      //     Selektory z [data-dbnav] (0,4-6,x) biją regułę html[data-theme=light] .nav:not(.scrolled) .nav-center>a (0,4,2) — ta zostaje nietknięta dla przezroczystego paska nad hero na desktopie.
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .nav-center{background:var(--ink,#15110D)}}',
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .nav-center>a,.nav[data-dbnav].dbm-menu-open .nav-center .nav-trigger{color:var(--cream,#FAFAF8)}}',
      '@media (max-width:979px){html[data-theme="light"] .nav[data-dbnav].dbm-menu-open .nav-center{background:var(--ink,#FAFAF8)}}',
      '@media (max-width:979px){html[data-theme="light"] .nav[data-dbnav].dbm-menu-open .nav-center>a,html[data-theme="light"] .nav[data-dbnav].dbm-menu-open .nav-center .nav-trigger{color:var(--cream,#1A1714)}}',
      // (c) PEŁNA WYSOKOŚĆ — 100dvh (dynamic viewport height — realna wysokość widocznego ekranu na mobile, bez paska adresu), fallback 100vh dla starszych silników. Panel zakrywa hero i CTA pod spodem.
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .nav-center{min-height:100vh;min-height:100dvh;max-height:none}}',
      // (d) REGUŁA (nie lista): przy otwartym menu chowamy KAŻDY element pływający (position:fixed/sticky) spoza nagłówka — bąble Messenger/WhatsApp, baner cookies, sticky-CTA, kropki boczne, back-to-top i cokolwiek dojdzie później. Klasę nakłada/zdejmuje JS (scan bezpośrednich dzieci <body>). Baner cookies wraca po zamknięciu menu — akceptacja nietknięta.
      '.dbm-float-hidden{display:none!important}',
      // (e) SCROLL-LOCK body przy otwartym menu.
      'html.dbm-nav-open,html.dbm-nav-open body{overflow:hidden!important}',
      // (f) PODLISTA PRODUKTY — mega-menu jako statyczna, czytelna, jednokolumnowa lista (rozwijana klasą .dbm-sub-open z JS). Kategorie generowane z danych przez header.js (CATS), nie na sztywno.
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .has-mega{width:100%}}',
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .nav-trigger{padding:13px 2px;width:100%;justify-content:space-between;font-size:15px;letter-spacing:.1em;border-bottom:1px solid var(--line,rgba(200,169,106,.10))}}',
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .has-mega.dbm-sub-open .mega-menu{display:block!important;position:static;transform:none;width:100%;opacity:1;visibility:visible;pointer-events:auto;background:transparent;border:0;box-shadow:none;padding:2px 0 8px;grid-template-columns:1fr;backdrop-filter:none;-webkit-backdrop-filter:none}}',
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .has-mega.dbm-sub-open .mega-preview{display:none}}',
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .has-mega.dbm-sub-open .mega-cats{grid-template-columns:1fr;gap:0}}',
      '@media (max-width:979px){.nav[data-dbnav].dbm-menu-open .has-mega.dbm-sub-open .mega-cat{padding:11px 4px 11px 20px}}',
      // === LIGHTBOX galerii (nakładka zamiast target=_blank) ===
      '.dbm-lb{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(8,6,5,.93);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease}',
      '.dbm-lb.open{display:flex;opacity:1}',
      '.dbm-lb img{max-width:92vw;max-height:86vh;border-radius:6px;box-shadow:0 20px 60px -10px rgba(0,0,0,.7);background:#fff;object-fit:contain}',
      '.dbm-lb-close{position:absolute;top:18px;right:22px;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.4);color:#fff;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}',
      '.dbm-lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.4);color:#fff;font-size:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;user-select:none;line-height:1}',
      '.dbm-lb-prev{left:18px}',
      '.dbm-lb-next{right:18px}',
      '.dbm-lb-count{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.8);font-size:13px;letter-spacing:.1em}',
      '.dbm-lb-close:hover,.dbm-lb-nav:hover{background:rgba(200,169,106,.9);color:#1A1714;border-color:transparent}',
      '@media (max-width:600px){.dbm-lb-nav{width:42px;height:42px;font-size:22px}.dbm-lb-close{top:12px;right:14px;width:40px;height:40px}}',
      // Light theme tokens (html[data-theme="light"]) — paleta BLOK L (T8 2026-09-06), mapowana na istniejące --ink/--cream/--gold/--line
      //   --ink=tło #FFFFFF · --ink-2=surface/kafle #F7F7F8 · --cream=tekst #1A1A1E · --cream-2=tekst-2 #5A5A62
      //   --line #E3E3E6 · --gold #8C6B2E = jedyna wartość zdająca WCAG AA i na białym (4.6:1), i na ciemnym — kasuje konflikt „złoto tekst vs złoto tło" jednym tokenem
      'html[data-theme="light"]{color-scheme:light;--ink:#FFFFFF;--ink-2:#F7F7F8;--ink-3:#FFFFFF;--cream:#1A1A1E;--cream-2:#5A5A62;--cream-rgb:26,26,30;--gold:#8C6B2E;--gold-2:#8C6B2E;--gold-soft:rgba(140,107,46,.10);--line:#E3E3E6}',
      'html[data-theme="light"] body{background:var(--ink);color:var(--cream)}',
      'html[data-theme="light"] .top-bar{background:rgba(250,250,248,.94);color:rgba(var(--cream-rgb),.65);border-bottom-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .nav:not([data-dbnav]){background:rgba(250,250,248,.86);border-bottom-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .nav.scrolled{background:rgba(250,250,248,.92)}',
      'html[data-theme="light"] .nav-back,html[data-theme="light"] .nav-trigger{color:rgba(var(--cream-rgb),.75)}',
      'html[data-theme="light"] .nav-back:hover{color:var(--gold)}',
      'html[data-theme="light"] .top-bar .active{color:var(--gold)}',
      'html[data-theme="light"] .top-bar a{color:rgba(var(--cream-rgb),.72)}',
      'html[data-theme="light"] .top-bar a:hover{color:var(--gold)}',
      'html[data-theme="light"] .breadcrumbs{color:rgba(var(--cream-rgb),.55)}',
      'html[data-theme="light"] .breadcrumbs a{color:rgba(var(--cream-rgb),.75)}',
      'html[data-theme="light"] .breadcrumbs span.cur{color:var(--gold)}',
      'html[data-theme="light"] .lead,html[data-theme="light"] p.lead{color:rgba(var(--cream-rgb),.78)}',
      'html[data-theme="light"] .page-head,html[data-theme="light"] .collection-hero{background:linear-gradient(180deg,#FFFFFF 0%,#FAFAF8 100%)}',
      'html[data-theme="light"] .faq{background:#F4F0E8}',
      'html[data-theme="light"] .faq-item{background:rgba(255,255,255,.7);border-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .faq-q{color:#1A1714}',
      'html[data-theme="light"] .faq-a-inner{color:rgba(var(--cream-rgb),.78)}',
      'html[data-theme="light"] .tile{background:#FFFFFF;border-color:rgba(var(--cream-rgb),.08);box-shadow:0 1px 3px rgba(0,0,0,.04)}',
      'html[data-theme="light"] .tile-title,html[data-theme="light"] .tile-body{color:#1A1714}',
      'html[data-theme="light"] .tile-desc{color:rgba(var(--cream-rgb),.7)}',
      'html[data-theme="light"] .tile-tag,html[data-theme="light"] .eyebrow{color:var(--gold)}',
      'html[data-theme="light"] .back-to-top{background:rgba(255,255,255,.9);color:var(--gold);border:1px solid rgba(var(--cream-rgb),.2)}',
      'html[data-theme="light"] .a-cta{background:var(--gold);color:#FFFFFF;border-color:var(--gold)}',
      'html[data-theme="light"] .spec-row{border-bottom-color:rgba(var(--cream-rgb),.08)}',
      'html[data-theme="light"] .spec-key{color:rgba(var(--cream-rgb),.55)}',
      'html[data-theme="light"] .spec-val{color:#1A1714}',
      'html[data-theme="light"] .variant{background:#FFFFFF;border-color:rgba(var(--cream-rgb),.08);color:#1A1714}',
      'html[data-theme="light"] .feat{background:rgba(200,169,106,.06);color:rgba(var(--cream-rgb),.85)}',
      'html[data-theme="light"] .designer-block{background:#FFFFFF;border-color:rgba(var(--cream-rgb),.10);color:rgba(var(--cream-rgb),.85)}',
      'html[data-theme="light"] .designer-block .text{color:rgba(var(--cream-rgb),.85)}',
      'html[data-theme="light"] .designer-block .text strong{color:#1A1714}',
      'html[data-theme="light"] .head-chips .chip{border-color:rgba(var(--cream-rgb),.15);color:rgba(var(--cream-rgb),.75)}',
      'html[data-theme="light"] footer{background:#F4F0E8;color:rgba(var(--cream-rgb),.65);border-top-color:rgba(var(--cream-rgb),.08)}',
      'html[data-theme="light"] footer span,html[data-theme="light"] footer p,html[data-theme="light"] footer div,html[data-theme="light"] footer li,html[data-theme="light"] footer strong,html[data-theme="light"] footer .signature,html[data-theme="light"] footer .col,html[data-theme="light"] footer .link,html[data-theme="light"] footer .bottom{color:rgba(var(--cream-rgb),.75)}',
      'html[data-theme="light"] footer a{color:var(--gold)}',
      'html[data-theme="light"] footer a:hover{border-bottom-color:var(--gold)}',
      'html[data-theme="light"] .nav-cta{color:var(--cream);border-color:var(--gold)}',
      'html[data-theme="light"] .nav-cta:hover{background:var(--gold);color:var(--ink)}',
      'html[data-theme="light"] .cta-ghost{color:var(--cream);border-color:rgba(var(--cream-rgb),.35)}',
      'html[data-theme="light"] .cta-ghost:hover{color:var(--gold);border-color:var(--gold)}',
      'html[data-theme="light"] .gradient-text{background:linear-gradient(120deg,var(--gold) 0%,#A9832F 55%,var(--gold) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}',
      'html[data-theme="light"] .italic{color:var(--gold)}',
      'html[data-theme="light"] h1,html[data-theme="light"] h2,html[data-theme="light"] h3,html[data-theme="light"] h4{color:#1A1714}',
      'html[data-theme="light"] .brand-logo-block .logo-img{background:#FFFFFF;border:1px solid rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .lb-name{color:#1A1714}',
      'html[data-theme="light"] .theme-toggle{color:var(--gold);border-color:rgba(var(--cream-rgb),.20)}',
      'html[data-theme="light"] .theme-toggle:hover{background:var(--gold);color:var(--ink);border-color:var(--gold)}',
      // === KARTY/PANELE z HARDCODED ciemnym tłem — w light NIE swapowały (nie używały var(--ink*)) ===
      'html[data-theme="light"] .depth-card{background:rgba(255,255,255,.62);border-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .agent-form{background:rgba(255,255,255,.80);border-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .agent-textarea{background:#FFFFFF;color:#1A1714;border-color:rgba(var(--cream-rgb),.15)}',
      'html[data-theme="light"] .agent-textarea::placeholder,html[data-theme="light"] .cs-form input::placeholder,html[data-theme="light"] .cs-form textarea::placeholder{color:rgba(var(--cream-rgb),.64)}',
      'html[data-theme="light"] .cs-form{background:rgba(255,255,255,.80);border-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .cs-form input,html[data-theme="light"] .cs-form textarea,html[data-theme="light"] .cs-form select{background:#FFFFFF;color:#1A1714;border-color:rgba(var(--cream-rgb),.15)}',
      'html[data-theme="light"] .mega-menu{background:rgba(250,250,248,.98);border-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .mega-menu a{color:rgba(var(--cream-rgb),.80)}',
      'html[data-theme="light"] .mega-menu a:hover{color:var(--gold)}',
      'html[data-theme="light"] .sticky-cta{background:rgba(250,250,248,.96);border-color:rgba(var(--cream-rgb),.10)}',
      'html[data-theme="light"] .side-dots{background:rgba(255,255,255,.60)}',
      'html[data-theme="light"] .dbm-burger{color:var(--gold);border-color:rgba(var(--cream-rgb),.22);background:rgba(122,98,56,.08)}',
      'html[data-theme="light"] .nav.dbm-menu-open .nav-center{background:#FAFAF8;box-shadow:0 18px 40px -12px rgba(0,0,0,.18)}',
      // ===== CZĘŚĆ 2 (nocna): light polish + hover afordancja + RWD mobile =====
      // Light — ciemniejsze drugorzędne czcionki (lepszy kontrast wg identyfikacji DB)
      'html[data-theme="light"] .lead,html[data-theme="light"] p.lead{color:rgba(var(--cream-rgb),.84)}',
      'html[data-theme="light"] .breadcrumbs{color:rgba(var(--cream-rgb),.60)}',
      'html[data-theme="light"] .breadcrumbs a{color:rgba(var(--cream-rgb),.82)}',
      'html[data-theme="light"] .tile-desc{color:rgba(var(--cream-rgb),.80)}',
      'html[data-theme="light"] .faq-a-inner{color:rgba(var(--cream-rgb),.84)}',
      'html[data-theme="light"] .spec-val{color:#1A1714}',
      'html[data-theme="light"] .top-bar,html[data-theme="light"] .top-bar a{color:rgba(var(--cream-rgb),.72)}',
      // Light — ramki wokół kafli kategorii/kolekcji (widoczność na jasnym tle)
      'html[data-theme="light"] .cat-card,html[data-theme="light"] .blog-card,html[data-theme="light"] .depth-card,html[data-theme="light"] .brand-cell,html[data-theme="light"] .variant{border:1px solid rgba(var(--cream-rgb),.14)}',
      // Light — hover kafli wyraźny (istniejące cienie są złote/ciemne, na jasnym mało widać)
      'html[data-theme="light"] .cat-card:hover,html[data-theme="light"] .blog-card:hover,html[data-theme="light"] .depth-card:hover{border-color:rgba(200,169,106,.70);box-shadow:0 18px 40px -16px rgba(var(--cream-rgb),.28)}',
      'html[data-theme="light"] .variant:hover,html[data-theme="light"] .tile:hover{border-color:rgba(200,169,106,.70)}',
      // Galeria — afordancja kliknięcia (otwiera lightbox)
      '.gallery-item{cursor:zoom-in}',
      '.gallery-item img{transition:transform .4s cubic-bezier(.2,.7,.2,1),filter .3s ease}',
      '.gallery-item:hover img{transform:scale(1.04);filter:brightness(1.05)}',
      // Linki/CTA tekstowe — hover w obu trybach
      'a.cta:hover,.mp-cta:hover,.nav-back:hover{color:var(--gold,#C8A96A)}',
      // RWD mobile — top-bar nie rozłazi się (skróć, ukryj separatory; <430px tylko aktywny link)
      '@media (max-width:600px){.top-bar{font-size:10px;letter-spacing:.10em;padding:7px 14px}.top-bar .links{gap:10px}.top-bar .sep{display:none}}',
      '@media (max-width:430px){.top-bar .links a:not(.active){display:none}}',
      // Logo: podmiana pliku per motyw przez JS (swapLogos) — BEZ filter:invert (BLOK L, T8 2026-09-06)
      //   grafit na jasnym: logo-db-nav.png -> logo-db-nav-jasna.png · logo-db-white.png -> logo-db-black.png
      // Przejście koloru 150 ms (BLOK L) — jedyna animacja motywu; reszta bez ruchu
      'html{transition:background-color .15s ease,color .15s ease}',
      'body,nav,header,footer,section,.tile,.faq-item,.variant,.feat,.designer-block,.brand-logo-block .logo-img{transition:background-color .15s ease,color .15s ease,border-color .15s ease}',
      // prefers-reduced-motion — zero przejść/animacji motywu
      '@media (prefers-reduced-motion:reduce){html,body,nav,header,footer,section,.tile,.faq-item,.variant,.feat,.designer-block,.brand-logo-block .logo-img,.ts-opt,.theme-toggle{transition:none!important}}'
    ].join('');
    document.head.appendChild(css);
  }

  // === WHATSAPP — pływający przycisk na każdej stronie ===
  // Aby zmienić numer: podmień 48506147435 (48 = Polska, bez spacji i +).
  function injectWhatsApp(){
    if (document.querySelector('.dbm-wa')) return;
    if (!document.body) return;
    var a = document.createElement('a');
    a.className = 'dbm-wa';
    a.href = 'https://wa.me/48506147435?text=' + encodeURIComponent('Dzień dobry, piszę ze strony dbmeble.pl — chciałbym zapytać o ofertę.');
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Napisz na WhatsApp 506 147 435');
    a.setAttribute('title', 'Napisz na WhatsApp');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15h-.003a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>';
    a.addEventListener('click', function(){
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({event:'whatsapp_click'});
        if (typeof gtag === 'function'){ gtag('event','whatsapp_click',{event_category:'lead', send_to:'G-T68TM6H9F5'}); }
      } catch(e){}
    });
    document.body.appendChild(a);
  }

  // Failsafe: gdyby IntersectionObserver nie zadziałał (błąd JS / stary cache / wolne ładowanie),
  // odsłoń treść .reveal po 1.5s — sekcje NIGDY nie zostają niewidoczne ("czarne/puste sekcje").
  function revealFailsafe(){
    setTimeout(function(){
      try { document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); }); } catch(e){}
    }, 1500);
  }

  // === MENU MOBILNE — hamburger otwierający .nav-center (<980px) ===
  function svgBurger(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  }
  function svgClose(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  }
  function initMobileNav(){
    var nav = document.querySelector('nav.nav');
    if (!nav) return;
    var center = nav.querySelector('.nav-center');
    if (!center) return;                          // podstrony bez .nav-center — pomiń
    if (nav.querySelector('.dbm-burger')) return; // idempotent
    var docEl = document.documentElement;
    var burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'dbm-burger';
    burger.setAttribute('aria-label', 'Menu');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML = svgBurger();
    var right = nav.querySelector('.nav-right');
    if (right) { right.insertBefore(burger, right.firstChild); } else { nav.appendChild(burger); }
    // Przełącznik napisowy „Tryb jasny | Tryb ciemny" w menu hamburgera (BLOK L, T8) — CSS pokazuje go tylko w otwartym menu <980px
    if (!center.querySelector('.theme-switch')){ center.appendChild(buildSwitch(true)); updateControls(); }
    // Podlista PRODUKTY (mega-menu) — rozwijana dotykiem w menu mobilnym; kategorie generuje header.js z danych.
    var mega = center.querySelector('.has-mega');
    var trigger = mega && mega.querySelector('.nav-trigger');
    function collapseSub(){ if (mega){ mega.classList.remove('dbm-sub-open'); if (trigger) trigger.setAttribute('aria-expanded','false'); } }
    // (d) Reguła: chowaj wszystkie elementy pływające (fixed/sticky) będące bezpośrednim dzieckiem <body>, poza nagłówkiem i jego nakładkami. Zdejmowane po zamknięciu → baner cookies wraca, akceptacja działa.
    var floatHidden = [];
    function hideFloating(hide){
      if (hide){
        floatHidden = [];
        var kids = document.body ? document.body.children : [];
        for (var i = 0; i < kids.length; i++){
          var el = kids[i];
          if (el === nav) continue;                                                                     // nagłówek zostaje
          if (el.classList && (el.classList.contains('dbnav-search-ov') || el.classList.contains('dbm-lb'))) continue;  // nakładki nagłówka/lightbox mają własną logikę
          var pos = getComputedStyle(el).position;
          if (pos === 'fixed' || pos === 'sticky'){ el.classList.add('dbm-float-hidden'); floatHidden.push(el); }
        }
      } else {
        floatHidden.forEach(function(el){ el.classList.remove('dbm-float-hidden'); });
        floatHidden = [];
      }
    }
    function setOpen(open){
      nav.classList.toggle('dbm-menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.innerHTML = open ? svgClose() : svgBurger();
      docEl.classList.toggle('dbm-nav-open', open);   // (e) scroll-lock body — przez CSS
      hideFloating(open);                              // (d) chowanie/pokazywanie elementów pływających — reguła, nie lista
      if (!open) collapseSub();
    }
    function close(){ setOpen(false); }
    function toggle(){ setOpen(!nav.classList.contains('dbm-menu-open')); }
    burger.addEventListener('click', function(e){ e.stopPropagation(); toggle(); });
    if (trigger){
      trigger.setAttribute('role','button');
      trigger.setAttribute('aria-expanded','false');
      trigger.addEventListener('click', function(e){
        if (!nav.classList.contains('dbm-menu-open')) return;   // desktop: rządzi hover, nie ruszamy
        e.preventDefault(); e.stopPropagation();
        var subOpen = mega.classList.toggle('dbm-sub-open');
        trigger.setAttribute('aria-expanded', subOpen ? 'true' : 'false');
      });
    }
    center.addEventListener('click', function(e){ if (e.target.closest('a')) close(); });   // klik w link → zamknij
    document.addEventListener('click', function(e){ if (nav.classList.contains('dbm-menu-open') && !nav.contains(e.target)) close(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  }

  // === LIGHTBOX — galeria otwiera się w nakładce (nie nowej karcie) ===
  function initLightbox(){
    var items = Array.prototype.slice.call(document.querySelectorAll('a.gallery-item[href]'));
    if (!items.length) return;
    var urls = items.map(function(a){ return a.getAttribute('href'); });
    var lb = document.getElementById('dbm-lb');
    if (!lb){
      lb = document.createElement('div');
      lb.id = 'dbm-lb';
      lb.className = 'dbm-lb';
      lb.setAttribute('role','dialog');
      lb.setAttribute('aria-modal','true');
      lb.innerHTML =
        '<button class="dbm-lb-close" type="button" aria-label="Zamknij">×</button>' +
        '<button class="dbm-lb-nav dbm-lb-prev" type="button" aria-label="Poprzednie zdjęcie">‹</button>' +
        '<img alt="Zdjęcie produktu">' +
        '<button class="dbm-lb-nav dbm-lb-next" type="button" aria-label="Następne zdjęcie">›</button>' +
        '<div class="dbm-lb-count"></div>';
      document.body.appendChild(lb);
    }
    var img = lb.querySelector('img');
    var count = lb.querySelector('.dbm-lb-count');
    var prevBtn = lb.querySelector('.dbm-lb-prev');
    var nextBtn = lb.querySelector('.dbm-lb-next');
    var single = urls.length < 2;
    prevBtn.style.display = single ? 'none' : '';
    nextBtn.style.display = single ? 'none' : '';
    count.style.display = single ? 'none' : '';
    var idx = 0;
    function show(i){ idx = (i + urls.length) % urls.length; img.src = urls[idx]; count.textContent = (idx+1) + ' / ' + urls.length; }
    function open(i){ show(i); lb.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
    function close(){ lb.classList.remove('open'); document.documentElement.style.overflow = ''; }
    items.forEach(function(a, i){
      a.removeAttribute('target');
      a.addEventListener('click', function(e){ e.preventDefault(); open(i); });
    });
    lb.querySelector('.dbm-lb-close').addEventListener('click', close);
    prevBtn.addEventListener('click', function(e){ e.stopPropagation(); show(idx-1); });
    nextBtn.addEventListener('click', function(e){ e.stopPropagation(); show(idx+1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && !single) show(idx-1);
      else if (e.key === 'ArrowRight' && !single) show(idx+1);
    });
  }

  function safe(fn){ try { fn(); } catch(e){} }
  function initAll(){
    safe(injectButton); safe(initMobileNav); safe(injectWhatsApp); safe(initLightbox); safe(revealFailsafe);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
