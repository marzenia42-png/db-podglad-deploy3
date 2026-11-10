/* header.js — WSPÓLNY nagłówek + megamenu DB (JEDNO źródło dla wszystkich stron).
   ------------------------------------------------------------------------------
   Cel: koniec z osobnymi wariantami nagłówka (m-nav na hubach, header silnika na
   kartach, megamenu inline na home). Ten plik wstrzykuje TEN SAM nagłówek wszędzie.
   Zmiana w JEDNYM miejscu (ten plik) propaguje się na wszystkie strony — jak theme.js.

   Ładowanie: synchronicznie, jako pierwszy skrypt w <body> (BEZ defer) → nagłówek
   jest od pierwszego renderu (brak "doskakiwania"). Nie przesuwa treści na home
   (nakłada się na hero); na pozostałych stronach dokłada padding-top pod treść.

   data-root = prefiks ścieżki do korzenia /new/:
     ""  home ·  "../"  o-nas ·  "../../../"  hub 3-poziomowy ·  "../../../../../"  karta.

   Współpraca z theme.js: markup ma .nav / .nav-center / .nav-cta — theme.js sam
   dokłada przełącznik motywu i hamburger mobilny (szuka tych klas). Wystarczy, że
   strona ładuje też theme.js.

   Idempotentny: drugi raz się nie wstrzyknie. Fallback bez JS: <noscript> w HTML strony.
*/
(function () {
  'use strict';
  if (document.querySelector('nav.nav[data-dbnav]')) return;               // już wstrzyknięty

  var sc = document.currentScript;
  var root = sc && sc.getAttribute('data-root');
  if (root == null) root = (document.body && document.body.getAttribute('data-root')) || '';
  var transparent = sc && sc.getAttribute('data-transparent') === '1';      // home: nakładka na hero
  var crumb = sc && sc.getAttribute('data-crumb');                          // opcjonalny "← wstecz"
  var crumbHref = sc && sc.getAttribute('data-crumb-href');
  try { window.__dbSearchIndex = root + 'search-index.json'; } catch (e) {}  // dla search.js — root-wzgledna sciezka indeksu (dziala pod /new/ i po swapie)

  // === KATEGORIE MEGAMENU — AUTO-GENEROWANE z dane/_mapy/kategorie.json (grupy_megamenu). NIE EDYTUJ RECZNIE.
  // Zmien w kategorie.json + uruchom: node web/_engine/_build_header_cats.cjs (JEDNO ZRODLO, zero dryfu).
  /* CATS:GENERATED-START */
  var CATS = [
    { t: 'Fotele i krzesła', sub: '15 kolekcji · 7 producentów', img: 'images/cat-fotele-db.webp?v=db0814', tag: 'Fotele i krzesła', desc: 'Ergonomia, komfort, prestiż — od pojedynczego fotela po wyposażenie całego open-space.', href: 'kategorie/krzesla-obrotowe/' },
    { t: 'Biurka i stanowiska', sub: '8 kolekcji · 4 producentów', img: 'images/cat-biurka-db.webp?v=db0814', tag: 'Biurka i stanowiska pracy', desc: 'Biurka elektryczne, ławki, stanowiska gabinetowe — dopasowane do tempa pracy.', href: 'kategorie/biurka-pracownicze/' },
    { t: 'Sale konferencyjne', sub: '4 kolekcje · 3 producentów', img: 'images/cat-konferencyjne-db.webp?v=db0814', tag: 'Sale konferencyjne', desc: 'Stoły dla zespołu lub zarządu, krzesła konferencyjne, wyposażenie multimedialne.', href: 'kategorie/krzesla-konferencyjne/' },
    { t: 'Strefa recepcji', sub: '3 kolekcje · 3 producentów', img: 'images/cat-recepcja-db.webp?v=db0814', tag: 'Strefa recepcji', desc: 'Pierwsze wrażenie kosztuje raz. Lady, sofy lobby, stoliki kawowe.', href: 'przestrzenie/recepcja/' },
    { t: 'Akustyka i strefy ciszy', sub: '8 kolekcji · 5 producentów', img: 'images/cat-akustyka-db.webp?v=db0814', tag: 'Akustyka i strefy ciszy', desc: 'Panele, sofy akustyczne, strefy ciszy — open-space, który pozwala się skupić.', href: 'kategorie/akustyka/' },
    { t: 'Budki akustyczne', sub: 'Sale spotkań i skupienia', img: 'images/cat-budki-db.webp?v=db0814', tag: 'Budki akustyczne', desc: 'Kabiny do rozmów, wideokonferencji i pracy w skupieniu — cisza w środku open-space.', href: 'producenci/bejot/akustyka/budki/' },
    { t: 'Przechowywanie', sub: '6 kolekcji · 3 producentów', img: 'images/cat-przechowywanie-db.webp?v=db0814', tag: 'Przechowywanie', desc: 'Szafy, lockery, regały — porządek widoczny i ten, którego nie widać.', href: 'kategorie/przechowywanie/' },
    { t: 'Siedziska miękkie', sub: '8 kolekcji · 7 producentów', img: 'images/cat-siedziska-db.webp?v=db0814', tag: 'Siedziska tapicerowane / Chillout', desc: 'Sofy modułowe, fotele lounge — strefy regeneracji i nieformalnych spotkań.', href: 'kategorie/soft-seating/' },
    { t: 'Wieszaki', sub: 'Wolnostojące i ubraniowe', img: 'images/cat-wieszaki-db.webp?v=db0814', tag: 'Wieszaki ubraniowe', desc: 'Wieszaki stojące i ubraniowe do biura, recepcji i stref wejściowych.', href: 'kategorie/wieszaki/', enabled: false },
    { t: 'Stoły', sub: '', img: '', tag: 'Stoły', desc: '', href: 'kategorie/stoly/', enabled: false },
    { t: 'Aranżacja', sub: '', img: '', tag: 'Aranżacja przestrzeni', desc: '', href: 'kategorie/aranzacja-przestrzeni/', enabled: false }
  ];
  /* CATS:GENERATED-END */

  // === LINKI GŁÓWNE (poza megamenu) ===
  var LINKS = [
    ['O nas',       root + 'o-nas/'],
    ['Producenci',  root + 'producenci/'],
    ['Przestrzenie', root + 'przestrzenie/'],
    ['Realizacje',  root + 'realizacje/'],
    ['Wiedza',      root + 'blog/'],
    ['FAQ',         root + 'faq/'],
    ['Kontakt',     root + 'kontakt/']
  ];

  var GOLD = '#C8A96A';

  // === CSS (samodzielny — jawne wartości, żeby wyglądał 1:1 niezależnie od tokenów strony) ===
  var css = [
    '.nav[data-dbnav]{position:fixed;top:0;left:0;right:0;z-index:200;padding:14px clamp(20px,4vw,56px);display:flex;align-items:center;justify-content:space-between;gap:24px;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;box-sizing:border-box;transition:background .35s ease,border-color .35s ease}',
    '.nav[data-dbnav]{background:rgba(16,16,19,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(200,169,106,.18)}',
    '.nav[data-dbnav].dbnav-over{background:linear-gradient(180deg,rgba(16,16,19,.6) 0%,rgba(16,16,19,.18) 70%,rgba(16,16,19,0) 100%);backdrop-filter:none;-webkit-backdrop-filter:none;border-bottom-color:transparent}',
    '.nav[data-dbnav] .brand{display:flex;align-items:center;flex-shrink:0;line-height:0;text-decoration:none}',
    '.nav[data-dbnav] .brand-logo{height:48px;width:auto;display:block;object-fit:contain}',
    '.nav[data-dbnav] .nav-center{display:none;gap:clamp(14px,1.6vw,26px);font-size:13px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;color:rgba(250,250,248,.82);align-items:center}',
    '@media(min-width:980px){.nav[data-dbnav] .nav-center{display:flex}}',
    '.nav[data-dbnav] .nav-center>a{position:relative;padding:8px 0;transition:color .25s ease;color:inherit;text-decoration:none}',
    '.nav[data-dbnav] .nav-center>a:hover{color:' + GOLD + '}',
    '.nav[data-dbnav] .has-mega{position:relative;padding:8px 0}',
    '.nav[data-dbnav] .nav-trigger{cursor:pointer;text-decoration:none;display:flex;align-items:center;gap:6px;color:rgba(250,250,248,.82);transition:color .25s ease}',
    '.nav[data-dbnav] .has-mega:hover .nav-trigger{color:' + GOLD + '}',
    '.nav[data-dbnav] .nav-trigger::after{content:"";width:6px;height:6px;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(45deg) translate(-2px,-2px);transition:transform .25s ease}',
    '.nav[data-dbnav] .has-mega:hover .nav-trigger::after{transform:rotate(-135deg) translate(2px,2px)}',
    '.nav[data-dbnav] .nav-right{display:flex;align-items:center;gap:16px;flex-shrink:0}',
    '.nav[data-dbnav] .nav-cta{display:none;padding:11px 20px;border:1px solid ' + GOLD + ';color:' + GOLD + ';font-size:12px;letter-spacing:.14em;border-radius:2px;text-decoration:none;white-space:nowrap;transition:background .3s ease,color .3s ease}',
    '@media(min-width:600px){.nav[data-dbnav] .nav-cta{display:inline-flex}}',
    '.nav[data-dbnav] .nav-cta:hover{background:' + GOLD + ';color:#1A1714}',
    // ≤1365px: przełącznik trybu jako IKONA (słońce) zamiast tekstu „Tryb jasny | Tryb ciemny" — telefon zostaje pełny (fix 1280 overflow, BETI 02.10). Steruje elementami theme.js, ale CSS jest w headerze (theme.js nietknięty).
    '@media(max-width:1365px){.nav[data-dbnav] .theme-switch:not(.ts-in-menu){display:none!important}.nav[data-dbnav] .theme-toggle{display:inline-flex!important}}',
    // megamenu
    '.nav[data-dbnav] .mega-menu{position:absolute;top:100%;left:0;transform:translateY(8px);width:min(920px,92vw);background:rgba(16,16,19,.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(200,169,106,.18);border-radius:6px;padding:32px;display:grid;grid-template-columns:1.1fr 1fr;gap:32px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s ease,transform .3s cubic-bezier(.2,.7,.2,1),visibility 0s linear .3s;box-shadow:0 30px 80px -30px rgba(0,0,0,.7);z-index:5}',
    '.nav[data-dbnav] .has-mega:hover .mega-menu,.nav[data-dbnav] .has-mega:focus-within .mega-menu{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0);transition:opacity .3s ease,transform .3s cubic-bezier(.2,.7,.2,1),visibility 0s linear 0s}',
    '.nav[data-dbnav] .mega-cats{display:grid;grid-template-columns:1fr 1fr;gap:6px 22px;margin:0;padding:0;list-style:none}',
    '.nav[data-dbnav] .mega-cat{position:relative;padding:10px 14px 10px 22px;font-size:13px;letter-spacing:.04em;text-transform:none;color:rgba(250,250,248,.85);border-radius:3px;transition:background .25s ease,color .25s ease;cursor:pointer}',
    '.nav[data-dbnav] .mega-cat::before{content:"";position:absolute;left:8px;top:50%;width:6px;height:6px;background:' + GOLD + ';border-radius:50%;transform:translateY(-50%);opacity:.5;transition:opacity .25s ease,transform .25s ease}',
    '.nav[data-dbnav] .mega-cat:hover,.nav[data-dbnav] .mega-cat.is-active{background:rgba(200,169,106,.08);color:' + GOLD + '}',
    '.nav[data-dbnav] .mega-cat:hover::before,.nav[data-dbnav] .mega-cat.is-active::before{opacity:1;transform:translateY(-50%) scale(1.3)}',
    '.nav[data-dbnav] .mega-cat .mc-title{font-family:"Cormorant Garamond","Times New Roman",serif;font-size:17px;font-weight:500;display:block;line-height:1.2;color:inherit}',
    '.nav[data-dbnav] .mega-cat .mc-sub{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(250,250,248,.5);display:block;margin-top:2px}',
    '.nav[data-dbnav] .mega-preview{position:relative;border-radius:4px;overflow:hidden;background:#000;min-height:260px;display:flex;flex-direction:column;justify-content:flex-end}',
    '.nav[data-dbnav] .mp-img{position:absolute;inset:0;background-size:cover;background-position:center;transition:opacity .4s ease,transform .8s cubic-bezier(.2,.7,.2,1);opacity:0;transform:scale(1.04)}',
    '.nav[data-dbnav] .mp-img.is-active{opacity:1;transform:scale(1)}',
    '.nav[data-dbnav] .mega-preview::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(16,16,19,.88) 100%);pointer-events:none}',
    '.nav[data-dbnav] .mp-caption{position:relative;z-index:1;padding:22px;color:#FAFAF8}',
    '.nav[data-dbnav] .mp-tag{font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:' + GOLD + ';display:block;margin-bottom:6px}',
    '.nav[data-dbnav] .mp-desc{font-family:"Cormorant Garamond","Times New Roman",serif;font-size:18px;line-height:1.3;margin:0 0 14px;font-weight:500;color:#FAFAF8}',
    '.nav[data-dbnav] .mp-cta{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:' + GOLD + ';display:inline-flex;align-items:center;gap:8px;text-decoration:none}',
    '.nav[data-dbnav] .mp-cta::after{content:"→";font-size:14px}',
    // breadcrumb pasek (opcjonalny)
    '.dbnav-crumb{position:fixed;top:76px;left:0;right:0;z-index:199;background:rgba(12,10,8,.94);border-bottom:1px solid rgba(200,169,106,.12);padding:8px clamp(20px,4vw,56px);font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-family:"DM Sans",system-ui,sans-serif;box-sizing:border-box}',
    '.dbnav-crumb a{color:rgba(250,250,248,.72);text-decoration:none}',
    '.dbnav-crumb a:hover{color:' + GOLD + '}',
    // light-mode (gdy html[data-theme=light]) — nagłówek zostaje ciemny, ale megamenu jaśniejsze jak na home
    'html[data-theme="light"] .nav[data-dbnav] .mega-menu{background:rgba(250,250,248,.98);border-color:rgba(26,23,20,.10)}',
    'html[data-theme="light"] .nav[data-dbnav] .mega-cat{color:rgba(26,23,20,.82)}',
    'html[data-theme="light"] .nav[data-dbnav] .mega-cat .mc-sub{color:rgba(26,23,20,.5)}',
    'html[data-theme="light"] .nav[data-dbnav] .mp-desc,html[data-theme="light"] .nav[data-dbnav] .mp-caption{color:#FAFAF8}',
    // === LUPKA + overlay wyszukiwarki (search.js) ===
    '.nav[data-dbnav] .nav-search{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;margin:0;background:none;border:none;color:rgba(250,250,248,.82);cursor:pointer;border-radius:50%;transition:color .25s ease,background .25s ease}',
    '.nav[data-dbnav] .nav-search:hover{color:' + GOLD + ';background:rgba(200,169,106,.10)}',
    '.nav[data-dbnav] .nav-search svg{width:20px;height:20px;display:block}',
    '.dbnav-search-ov{position:fixed;inset:0;z-index:300;background:rgba(10,9,8,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:14vh 20px 20px;box-sizing:border-box}',
    '.dbnav-search-ov[hidden]{display:none}',
    '.dbnav-search-box{position:relative;width:min(680px,94vw);background:rgba(20,19,22,.98);border:1px solid rgba(200,169,106,.22);border-radius:8px;box-shadow:0 30px 90px -30px rgba(0,0,0,.8);padding:22px}',
    '.dbnav-search-box input#szukaj-input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.04);border:1px solid rgba(200,169,106,.25);color:#FAFAF8;font-size:18px;font-family:"DM Sans",system-ui,sans-serif;padding:14px 16px;border-radius:5px;outline:none}',
    '.dbnav-search-box input#szukaj-input:focus{border-color:' + GOLD + '}',
    '.dbnav-search-close{position:absolute;top:12px;right:12px;width:34px;height:34px;background:none;border:none;color:rgba(250,250,248,.6);font-size:26px;line-height:1;cursor:pointer;border-radius:50%}',
    '.dbnav-search-close:hover{color:' + GOLD + '}',
    '#szukaj-wyniki{margin-top:14px;max-height:56vh;overflow:auto}',
    '#szukaj-wyniki .sz-empty{color:rgba(250,250,248,.55);font-size:14px;font-family:"DM Sans",system-ui,sans-serif;padding:10px 4px;margin:0}',
    '#szukaj-wyniki .sz-empty a{color:' + GOLD + '}',
    '#szukaj-wyniki .sz-count{color:rgba(250,250,248,.5);font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin:6px 4px 10px}',
    '#szukaj-wyniki .sz-list{list-style:none;margin:0;padding:0}',
    '#szukaj-wyniki .sz-list a{display:flex;align-items:baseline;gap:10px;padding:10px 12px;border-radius:5px;text-decoration:none;color:#FAFAF8;transition:background .2s ease}',
    '#szukaj-wyniki .sz-list a:hover{background:rgba(200,169,106,.10)}',
    '#szukaj-wyniki .sz-t{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:' + GOLD + ';flex-shrink:0;min-width:74px}',
    '#szukaj-wyniki .sz-n{font-family:"Cormorant Garamond",serif;font-size:17px;font-weight:500}',
    '#szukaj-wyniki .sz-m{font-size:12px;color:rgba(250,250,248,.5);margin-left:auto;text-align:right}',
    'html[data-theme="light"] .dbnav-search-box{background:rgba(250,250,248,.99);border-color:rgba(26,23,20,.12)}',
    'html[data-theme="light"] .dbnav-search-box input#szukaj-input{background:rgba(0,0,0,.03);color:#1A1714}',
    'html[data-theme="light"] #szukaj-wyniki .sz-n,html[data-theme="light"] #szukaj-wyniki .sz-list a{color:#1A1714}',
    // na najwezszych telefonach — zwez padding/gap, zeby klaster ikon (lupka + hamburger + motyw) na pewno sie zmiescil
    '@media(max-width:400px){.nav[data-dbnav]{padding-left:16px;padding-right:16px}.nav[data-dbnav] .nav-right{gap:8px}}'
  ].join('');

  var st = document.createElement('style');
  st.setAttribute('data-dbnav-css', '1');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  // === MARKUP ===
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var catsHtml = CATS.filter(function (c) { return c.enabled !== false; }).map(function (c, i) {
    return '<li class="mega-cat' + (i === 0 ? ' is-active' : '') + '"'
      + ' data-img="' + esc(root + c.img) + '"'
      + ' data-tag="' + esc(c.tag) + '"'
      + ' data-desc="' + esc(c.desc) + '"'
      + ' data-href="' + esc(root + c.href) + '">'
      + '<span class="mc-title">' + esc(c.t) + '</span><span class="mc-sub">' + esc(c.sub) + '</span></li>';
  }).join('');

  var linksHtml = LINKS.map(function (l) { return '<a href="' + esc(l[1]) + '">' + esc(l[0]) + '</a>'; }).join('');

  var first = CATS[0];
  var megaHtml = '<div class="has-mega">'
    + '<a class="nav-trigger" href="' + esc(root + 'produkty/') + '" role="button" aria-haspopup="true">Produkty</a>'
    + '<div class="mega-menu" role="menu" aria-label="Kategorie produktów">'
    + '<ul class="mega-cats">' + catsHtml + '</ul>'
    + '<div class="mega-preview" id="dbnavMegaPreview">'
    + '<div class="mp-img is-active" style="background-image:url(\'' + esc(root + first.img) + '\')"></div>'
    + '<div class="mp-caption"><span class="mp-tag" id="dbnavMpTag">' + esc(first.tag) + '</span>'
    + '<p class="mp-desc" id="dbnavMpDesc">' + esc(first.desc) + '</p>'
    + '<a href="' + esc(root + 'produkty/') + '" class="mp-cta">Zobacz wszystkie</a></div>'
    + '</div></div></div>';

  var navHtml = '<a href="' + esc(root || '/') + '" class="brand" aria-label="DB Meble — strona główna">'
    + '<img src="' + esc(root + 'images/logo-db-nav.png') + '?v=0a124bbb" alt="DB Meble" class="brand-logo"></a>'
    + '<div class="nav-center">' + megaHtml + linksHtml + '</div>'
    + '<div class="nav-right">'
    + '<button type="button" class="nav-search" aria-label="Szukaj" aria-haspopup="dialog">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
    + '</button>'
    + '<a href="tel:+48506147435" class="nav-cta" data-event="phone_click" data-event-source="nav">506 147 435</a>'
    + '</div>';

  var nav = document.createElement('nav');
  nav.className = 'nav' + (transparent ? ' dbnav-over' : '');
  nav.id = 'nav';
  nav.setAttribute('data-dbnav', '1');
  nav.innerHTML = navHtml;
  document.body.insertBefore(nav, document.body.firstChild);

  // breadcrumb (jeśli podany data-crumb)
  if (crumb) {
    var bc = document.createElement('div');
    bc.className = 'dbnav-crumb';
    bc.innerHTML = '<a href="' + esc(crumbHref || root) + '">← ' + esc(crumb) + '</a>';
    nav.parentNode.insertBefore(bc, nav.nextSibling);
  }

  // padding pod treść (poza home, gdzie nav nakłada się na hero)
  if (!transparent && document.body) {
    var pad = crumb ? 108 : 74;
    var prev = parseInt((document.body.style.paddingTop || '0'), 10) || 0;
    if (prev < pad) document.body.style.paddingTop = pad + 'px';
  }

  // === ZACHOWANIE MEGAMENU — hover/klik na kategorię = podmiana podglądu ===
  var preview = nav.querySelector('#dbnavMegaPreview');
  var mpTag = nav.querySelector('#dbnavMpTag');
  var mpDesc = nav.querySelector('#dbnavMpDesc');
  var mpCta = nav.querySelector('.mp-cta');
  var cats = nav.querySelectorAll('.mega-cat');

  function activate(cat) {
    cats.forEach(function (c) { c.classList.remove('is-active'); });
    cat.classList.add('is-active');
    var oldImg = preview.querySelector('.mp-img.is-active');
    var newImg = document.createElement('div');
    newImg.className = 'mp-img';
    newImg.style.backgroundImage = "url('" + cat.getAttribute('data-img') + "')";
    preview.insertBefore(newImg, preview.firstChild);
    requestAnimationFrame(function () { newImg.classList.add('is-active'); });
    setTimeout(function () { if (oldImg) oldImg.remove(); }, 500);
    if (mpTag) mpTag.textContent = cat.getAttribute('data-tag');
    if (mpDesc) mpDesc.textContent = cat.getAttribute('data-desc');
    if (mpCta && cat.getAttribute('data-href')) mpCta.setAttribute('href', cat.getAttribute('data-href'));
  }

  cats.forEach(function (cat) {
    cat.addEventListener('mouseenter', function () { activate(cat); });
    cat.addEventListener('click', function () {
      var href = cat.getAttribute('data-href');
      if (href) window.location.href = href;
    });
  });

  // === LUPKA — overlay wyszukiwarki. search.js ładowany LENIWIE przy 1. otwarciu. ===
  var searchBtn = nav.querySelector('.nav-search');
  if (searchBtn) {
    var ov = document.createElement('div');
    ov.className = 'dbnav-search-ov';
    ov.id = 'dbnavSearchOv';
    ov.setAttribute('hidden', '');
    ov.innerHTML = '<div class="dbnav-search-box" role="dialog" aria-modal="true" aria-label="Wyszukiwarka">'
      + '<button type="button" class="dbnav-search-close" aria-label="Zamknij">×</button>'
      + '<input id="szukaj-input" type="search" autocomplete="off" placeholder="Szukaj produktu, kategorii, producenta…">'
      + '<div id="szukaj-wyniki"><p class="sz-empty">Wpisz nazwę produktu, kategorii lub producenta…</p></div>'
      + '</div>';
    document.body.appendChild(ov);

    var searchLoaded = false;
    function openSearch() {
      ov.removeAttribute('hidden');
      var inp = ov.querySelector('#szukaj-input');
      if (!searchLoaded) {
        searchLoaded = true;                         // search.js sam wpina się na #szukaj-input i robi focus
        var s = document.createElement('script');
        s.src = root + 'search.js';
        document.body.appendChild(s);
      } else if (inp) { inp.focus(); }
    }
    function closeSearch() { ov.setAttribute('hidden', ''); }

    searchBtn.addEventListener('click', openSearch);
    ov.querySelector('.dbnav-search-close').addEventListener('click', closeSearch);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeSearch(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !ov.hasAttribute('hidden')) closeSearch();
    });
  }

  // Uwaga: „potrójny nagłówek" na kartach (shared nav + pe-topbar + pe-nav) domyka
  // fix prezentacji w product-engine (usunięcie pe-topbar + ukrycie .pe-nav .brand) — T3.
})();
