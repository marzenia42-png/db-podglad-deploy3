/* DB Concept Space — asystent AI (widget produkcyjny). Etap A.
 * Osadzenie (post-swap, root): <script src="/db-agent-widget.js?v=1.2.0" defer></script>
 * Endpoint: Supabase Edge Function dbmeble-agent (chat + lead). Klucz API po stronie serwera.
 * Bezpieczeństwo: treść renderowana przez textContent (XSS-safe). AI Act art. 50 przy 1. interakcji.
 *   Formularz leada: honeypot (pole-pułapka) + min. czas wypełnienia 3 s -> cichy odrzut (log, bez wysyłki).
 * Pozycja: FAB STAŁY (position:fixed z CSS, right:24px). Bez przeciągania, bez auto-ukrywania — zawsze widoczny. Panel kotwiczony do FAB.
 *   z-index PONAD treścią, ale POD lightboxem galerii (.pe-lb z-index:1000) -> otwarte zdjęcie zasłania widget.
 *   Mobile <=480px: FAB = koło 56px z "AI"; panel = pełnoekranowy (strona widoczna dopiero po zamknięciu).
 * Wersja: 1.5.0 (2026-10-24) — FAB przeprojektowany na WIDOCZNY "hero" czatu: desktop = złota PIGUŁKA (#C9A96E, ciemny tekst, dymek + "Zapytaj AI" + kropka online), mobile = koło 56px (dymek + "AI"). STAŁA pozycja right:24px (usunięto drag/restorePos/savePos/applyPos/clamp + sessionStorage pozycji ORAZ auto-ukrycie przy scrollu). Otwieranie = zwykły klik + Enter/Spacja. Dodane: dymek zaproszenia po ~8 s (raz na sesję, sessionStorage 'dbwInvite'). NIE ruszane: banner AI Act art.50, logika rozmowy, lead-pipeline, formularz, honeypot/timing, panel pełnoekranowy mobile + visualViewport, chowanie przy lightboxie .pe-lb. Baza 1.3.0: orb-avatar, złota obwódka gradient, streaming, kropki myślenia, glassmorphism, chipy znikają po 1. wiadomości, prefers-reduced-motion.
 */
(function () {
  'use strict';
  if (window.__dbAgentLoaded) return; window.__dbAgentLoaded = true;

  // Endpoint konfigurowalny: window.DB_AGENT_ENDPOINT albo <script ... data-endpoint="...">;
  // domyslnie projekt DB (gdfhg). ZAKAZ twardego SOLA (txqj = inny klient) — izolacja projektow.
  var ENDPOINT = (function () {
    var s = document.currentScript, a = s && s.getAttribute('data-endpoint');
    return (typeof window.DB_AGENT_ENDPOINT === 'string' && window.DB_AGENT_ENDPOINT) || a ||
      'https://gdfhgcfafxxghsqjvyof.supabase.co/functions/v1/dbmeble-agent';
  })();
  var TEL = '506 147 435';
  var MIN_FILL_MS = 3000;   // submit szybszy niż 3 s od pokazania formularza = bot
  var INVITE_KEY = 'dbwInvite';   // v1.5.0: dymek zaproszenia raz na sesję
  var INVITE_DELAY = 8000;        // ~8 s po załadowaniu

  var CSS = [
    // v1.5.0: FAB = złota PIGUŁKA "hero" czatu (kolor CTA "Umów konsultację"). Desktop: dymek + "Zapytaj AI" (bold) + kropka online. STAŁA pozycja right:24px, bottom:150px (nad Messenger ~86px i WhatsApp ~22px). z-index 902 = najwyżej w stosie social.
    '.dbw-fab{position:fixed;right:24px;bottom:150px;z-index:902;display:inline-flex;flex-direction:row;align-items:center;justify-content:center;gap:8px;height:56px;padding:0 20px 0 16px;background:#C9A96E;color:#1A1714;border:none;border-radius:999px;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.26),0 2px 6px rgba(0,0,0,.18);user-select:none;-webkit-user-select:none;transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .24s}',
    '.dbw-fab:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.32),0 3px 8px rgba(0,0,0,.2)}',
    '.dbw-fab:focus-visible{outline:3px solid #1A1714;outline-offset:2px}',
    '.dbw-fab svg{width:22px;height:22px;pointer-events:none;flex:none}',
    '.dbw-fab .dbw-dot{width:9px;height:9px;border-radius:50%;background:#2e8b4f;box-shadow:0 0 0 2.5px #C9A96E;pointer-events:none;flex:none;margin-left:-2px}',
    '.dbw-fab .dbw-txt{pointer-events:none;font:700 15px/1 -apple-system,Segoe UI,Roboto,Arial,sans-serif;letter-spacing:.01em;color:#1A1714;white-space:nowrap}',
    '.dbw-fab .dbw-lbl{display:none;pointer-events:none;font:800 10px/1 -apple-system,Segoe UI,Roboto,Arial,sans-serif;letter-spacing:.1em;color:#1A1714}',
    // v1.5.0: JEDNO krótkie pulsowanie przy pierwszym pokazaniu zaproszenia (nie w pętli).
    '.dbw-fab.dbw-pulse{animation:dbwPulse 1.1s ease-out 1}',
    '@keyframes dbwPulse{0%{box-shadow:0 8px 26px rgba(0,0,0,.26),0 0 0 0 rgba(201,169,110,.6)}70%{box-shadow:0 8px 26px rgba(0,0,0,.26),0 0 0 14px rgba(201,169,110,0)}100%{box-shadow:0 8px 26px rgba(0,0,0,.26),0 0 0 0 rgba(201,169,110,0)}}',
    // v1.5.0: dymek zaproszenia — nieprzezroczysta karta, czytelny na ciemnym hero i w trybie jasnym.
    '.dbw-invite{position:fixed;right:24px;bottom:214px;z-index:902;max-width:230px;background:#1A1714;color:#F0E6D3;border:1px solid #C9A96E;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.4);padding:11px 30px 11px 14px;font:500 13.5px/1.4 -apple-system,Segoe UI,Roboto,Arial,sans-serif;display:none}',
    '.dbw-invite.dbw-show{display:block}',
    '.dbw-invite::after{content:"";position:absolute;right:34px;bottom:-7px;width:12px;height:12px;background:#1A1714;border-right:1px solid #C9A96E;border-bottom:1px solid #C9A96E;transform:rotate(45deg)}',
    '.dbw-invite .dbw-ix{position:absolute;top:4px;right:6px;background:none;border:none;color:#a89a82;font-size:17px;line-height:1;cursor:pointer;padding:2px 4px}.dbw-invite .dbw-ix:hover{color:#F0E6D3}',
    // WOW v1.3.0: lekki glassmorphism (przydymione szkło) + złota obwódka gradient z animacją flow (::before z maską)
    '.dbw-panel{position:fixed;right:20px;bottom:20px;z-index:901;width:380px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 40px);background:rgba(28,24,20,.74);-webkit-backdrop-filter:blur(16px) saturate(1.15);backdrop-filter:blur(16px) saturate(1.15);border:1px solid transparent;border-radius:18px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.5);font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}',
    '.dbw-panel::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(125deg,#C9A96E,#f0d9a6,#9c7a3c,#C9A96E);background-size:300% 300%;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:dbwBorder 7s linear infinite;pointer-events:none;z-index:3}',
    '@keyframes dbwBorder{0%{background-position:0% 50%}100%{background-position:300% 50%}}',
    '.dbw-panel.dbw-open{display:flex}',
    '.dbw-head{background:#1A1714;padding:15px 16px;display:flex;align-items:center;gap:11px;border-bottom:1px solid #3a332c;flex:none}',
    // WOW v1.3.0: avatar = złoty ORB. Oddech (puls) w spoczynku; .dbw-gen = falowanie podczas generowania odpowiedzi.
    '.dbw-av{width:38px;height:38px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#f5e0ab 0%,#C9A96E 44%,#9c7a3c 100%);display:flex;align-items:center;justify-content:center;color:#3a2c12;font:700 12px/1 sans-serif;flex:none;position:relative;box-shadow:0 0 0 1px rgba(201,169,110,.5),0 0 14px 2px rgba(201,169,110,.4),inset 0 2px 6px rgba(255,255,255,.35);animation:dbwBreathe 3.6s ease-in-out infinite;will-change:transform}',
    '.dbw-av.dbw-gen{animation:dbwWave 1.05s ease-in-out infinite}',
    '@keyframes dbwBreathe{0%,100%{transform:scale(1);box-shadow:0 0 0 1px rgba(201,169,110,.5),0 0 12px 1px rgba(201,169,110,.32),inset 0 2px 6px rgba(255,255,255,.35)}50%{transform:scale(1.06);box-shadow:0 0 0 1px rgba(201,169,110,.62),0 0 22px 5px rgba(201,169,110,.55),inset 0 2px 6px rgba(255,255,255,.42)}}',
    '@keyframes dbwWave{0%,100%{transform:scale(1) translateY(0)}25%{transform:scale(1.1) translateY(-1.5px)}50%{transform:scale(.96) translateY(0)}75%{transform:scale(1.07) translateY(1.5px)}}',
    '.dbw-head .dbw-t{color:#F0E6D3;font-weight:600;font-size:14.5px}.dbw-head .dbw-s{color:#a89a82;font-size:11.5px;margin-top:2px}',
    '.dbw-x{margin-left:auto;background:none;border:none;color:#a89a82;font-size:22px;cursor:pointer;line-height:1;padding:4px 6px}.dbw-x:hover{color:#F0E6D3}',
    '.dbw-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:15px;display:flex;flex-direction:column;gap:11px;min-height:0}',
    '.dbw-body::-webkit-scrollbar{width:8px}.dbw-body::-webkit-scrollbar-thumb{background:#3a332c;border-radius:8px}',
    '.dbw-m{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}',
    '.dbw-m.dbw-bot{background:#2c2723;color:#F0E6D3;border-bottom-left-radius:4px;align-self:flex-start}',
    '.dbw-m.dbw-user{background:#C9A96E;color:#1A1714;border-bottom-right-radius:4px;align-self:flex-end;font-weight:500}',
    '.dbw-m.dbw-sys{align-self:center;background:transparent;color:#a89a82;font-size:11.5px;text-align:center;border:1px dashed #3a332c;border-radius:10px;padding:7px 11px;max-width:95%}',
    '.dbw-lead{margin-top:8px;display:flex;flex-direction:column;gap:8px}',
    '.dbw-lead input,.dbw-lead textarea{background:#1a1613;border:1px solid #3a332c;color:#F0E6D3;padding:9px 11px;border-radius:9px;font:13.5px sans-serif}',
    '.dbw-lead input:focus,.dbw-lead textarea:focus{outline:none;border-color:#C9A96E}',
    '.dbw-lead button{background:#C9A96E;color:#1A1714;border:none;padding:10px;border-radius:9px;font-weight:700;cursor:pointer;font-size:14px}',
    '.dbw-hp{position:absolute!important;left:-9999px!important;top:auto!important;width:1px!important;height:1px!important;opacity:0!important;overflow:hidden!important;pointer-events:none}',
    '.dbw-foot{padding:11px;border-top:1px solid #3a332c;background:#1A1714;flex:none}',
    '.dbw-in{display:flex;gap:8px;align-items:flex-end}',
    '.dbw-in textarea{flex:1;background:#211d19;border:1px solid #3a332c;color:#F0E6D3;border-radius:12px;padding:10px 12px;font:14px sans-serif;resize:none;max-height:90px;line-height:1.4}',
    '.dbw-in textarea:focus{outline:none;border-color:#C9A96E}',
    '.dbw-send{background:#C9A96E;border:none;width:40px;height:40px;border-radius:12px;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center}.dbw-send svg{width:18px;height:18px}',
    '.dbw-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px;max-height:140px;overflow:hidden;transition:opacity .45s ease,max-height .45s ease,margin-bottom .45s ease}',
    '.dbw-chips.dbw-chips-hide{opacity:0;max-height:0;margin-bottom:0;pointer-events:none}',
    '.dbw-chip{background:rgba(201,169,110,.1);border:1px solid rgba(201,169,110,.3);color:#F0E6D3;font-size:12px;padding:6px 10px;border-radius:999px;cursor:pointer}',
    '.dbw-legal{text-align:center;color:#8a7d68;font-size:10.5px;margin-top:8px}',
    // WOW v1.3.0: dostępność — przy prefers-reduced-motion wyłącz wszystkie animacje (streaming idzie natychmiast, patrz JS)
    '@media(prefers-reduced-motion:reduce){.dbw-av,.dbw-av.dbw-gen,.dbw-panel::before,.dbw-typ span{animation:none!important}.dbw-m.dbw-streaming::after{display:none}}',
    // WOW v1.3.0: 3 złote kropki myślenia z poświatą (shimmer) zamiast szarych
    '.dbw-typ{display:flex;gap:5px;padding:11px 13px;align-items:center}.dbw-typ span{width:8px;height:8px;background:#C9A96E;border-radius:50%;box-shadow:0 0 6px 1px rgba(201,169,110,.55);animation:dbwShim 1.2s infinite}',
    '.dbw-typ span:nth-child(2){animation-delay:.18s}.dbw-typ span:nth-child(3){animation-delay:.36s}@keyframes dbwShim{0%,60%,100%{opacity:.3;box-shadow:0 0 4px 0 rgba(201,169,110,.3);transform:scale(.9)}30%{opacity:1;box-shadow:0 0 11px 3px rgba(201,169,110,.75);transform:scale(1.16)}}',
    // streaming: subtelny kursor podczas pisania odpowiedzi słowo-po-słowie
    '.dbw-m.dbw-streaming::after{content:"▍";color:#C9A96E;margin-left:1px;animation:dbwCaret 1s steps(2,jump-none) infinite}@keyframes dbwCaret{0%,100%{opacity:0}50%{opacity:1}}',
    // MOBILE <=480: FAB = koło 56px (złote, dymek + "AI") — nie zasłania CTA; panel = PELNOEKRANOWY (prompt Dario 24.10).
    '@media(max-width:480px){',
    '.dbw-fab{padding:0;width:56px;height:56px;right:24px;flex-direction:column;gap:1px;border-radius:50%}',
    '.dbw-fab svg{width:22px;height:22px}',
    '.dbw-fab .dbw-txt{display:none}',          // ukryj "Zapytaj AI" na mobile
    '.dbw-fab .dbw-lbl{display:block}',          // pokaż małe "AI"
    '.dbw-fab .dbw-dot{position:absolute;top:8px;right:8px;margin-left:0;box-shadow:0 0 0 2.5px #C9A96E}',
    '.dbw-invite{right:16px;bottom:214px;max-width:220px}',
    '.dbw-invite::after{right:26px}',
    '.dbw-panel{left:0;right:0;top:0;bottom:0;width:100vw;height:100vh;height:100dvh;max-width:none;max-height:none;border-radius:0}',
    '.dbw-x{font-size:27px;padding:6px 10px}',
    '.dbw-head{padding:13px 14px}',
    '}'
  ].join('');

  var messages = [];       // historia rozmowy do API
  var greeted = false, leadShown = false, busy = false, wizMentioned = false;
  var body, inp, chips, fab, panel, av, invite;

  function el(cls) { var d = document.createElement('div'); if (cls) d.className = cls; return d; }
  function scroll() { body.scrollTop = body.scrollHeight; }
  function addBot(text) { var m = el('dbw-m dbw-bot'); m.textContent = text; body.appendChild(m); scroll(); return m; }
  function addUser(text) { var m = el('dbw-m dbw-user'); m.textContent = text; body.appendChild(m); scroll(); }
  function addSys(text) { var m = el('dbw-m dbw-sys'); m.textContent = text; body.appendChild(m); scroll(); }
  function typing() { var m = el('dbw-m dbw-bot'); m.innerHTML = '<div class="dbw-typ"><span></span><span></span><span></span></div>'; body.appendChild(m); scroll(); return m; }
  // WOW v1.3.0: streaming odpowiedzi słowo-po-słowie (textContent = XSS-safe). prefers-reduced-motion -> natychmiast.
  function streamBot(text) {
    var m = el('dbw-m dbw-bot'); body.appendChild(m);
    var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches; } catch (_) {}
    if (reduce || !text) { m.textContent = text || ''; scroll(); return m; }
    m.classList.add('dbw-streaming');
    var parts = text.split(/(\s+)/), i = 0;               // zachowuje spacje/newline jako osobne tokeny
    (function step() {
      if (i >= parts.length) { m.classList.remove('dbw-streaming'); scroll(); return; }
      m.textContent += parts[i++]; scroll();
      setTimeout(step, 26);
    })();
    return m;
  }
  function isMobile() { return window.matchMedia('(max-width:480px)').matches; }

  function api(payload) {
    return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }

  function send(text) {
    if (busy || !text.trim()) return; busy = true;
    if (chips) chips.classList.add('dbw-chips-hide');        // WOW: chipy znikają po 1. wiadomości klienta
    addUser(text);
    messages.push({ role: 'user', content: text.slice(0, 1000) });
    if (messages.length > 24) messages = messages.slice(-24);
    if (av) av.classList.add('dbw-gen');                     // WOW: orb faluje podczas generowania
    var t = typing();
    api({ messages: messages }).then(function (j) {
      t.remove();
      if (av) av.classList.remove('dbw-gen');
      var reply = j.response || 'Przepraszam, chwilowo nie mogę odpowiedzieć. Zadzwoń: ' + TEL + '.';
      streamBot(reply);                                       // WOW: streaming słowo-po-słowie
      if (j.response) messages.push({ role: 'assistant', content: j.response });
      if (/wizualizacj/i.test(text + ' ' + reply)) wizMentioned = true;
      busy = false;
    }).catch(function () {
      t.remove(); if (av) av.classList.remove('dbw-gen'); addBot('Coś nie zadziałało po naszej stronie. Zadzwoń: ' + TEL + '.'); busy = false;
    });
  }

  function showLead() {
    if (leadShown) return; leadShown = true;
    var openedAt = Date.now();               // znacznik czasu do min-czasu wypełnienia
    var wrap = el('dbw-m dbw-bot');
    wrap.appendChild(document.createTextNode('Zostaw kontakt — przygotujemy bezpłatną wycenę:'));
    var f = document.createElement('form'); f.className = 'dbw-lead'; f.setAttribute('autocomplete', 'off');
    // honeypot — pole ukryte dla ludzi, boty je wypełniają
    var hp = document.createElement('input'); hp.className = 'dbw-hp'; hp.type = 'text';
    hp.name = 'company'; hp.tabIndex = -1; hp.setAttribute('autocomplete', 'off'); hp.setAttribute('aria-hidden', 'true');
    var n = document.createElement('input'); n.placeholder = 'Imię i nazwisko / firma'; n.required = true; n.maxLength = 120;
    var c = document.createElement('input'); c.placeholder = 'Telefon lub e-mail'; c.required = true; c.maxLength = 120;
    var tp = document.createElement('textarea'); tp.placeholder = 'Czego dotyczy? (opcjonalnie)'; tp.rows = 2; tp.maxLength = 200;
    var b = document.createElement('button'); b.type = 'submit'; b.textContent = 'Wyślij zapytanie';
    f.appendChild(hp); f.appendChild(n); f.appendChild(c); f.appendChild(tp); f.appendChild(b);
    wrap.appendChild(f); body.appendChild(wrap); scroll();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var dt = Date.now() - openedAt;
      // anty-spam client-side: honeypot wypełniony LUB submit < 3 s -> cichy odrzut (log, bez wysyłki, komunikat sukcesu)
      if (hp.value || dt < MIN_FILL_MS) {
        try { console.debug('[dbw] lead odrzucony (anty-spam): hp=' + (hp.value ? '1' : '0') + ' dt=' + dt + 'ms'); } catch (_) {}
        wrap.textContent = '✅ Dziękujemy! Zapytanie przyjęte — doradca DB Concept Space odezwie się wkrótce. W pilnej sprawie: ' + TEL + '.';
        scroll(); return;
      }
      b.disabled = true; b.textContent = 'Wysyłam…';
      var summary = messages.slice(-8).map(function (m) { return (m.role === 'user' ? 'Klient: ' : 'Agent: ') + m.content; }).join('\n');
      api({ mode: 'lead', lead: { name: n.value, contact: c.value, topic: tp.value, summary: summary, wizualizacja: wizMentioned ? 'tak' : '', hp: hp.value, dt: dt } }).then(function (j) {
        wrap.textContent = j && j.ok
          ? '✅ Dziękujemy! Zapytanie przyjęte — doradca DB Concept Space odezwie się wkrótce. W pilnej sprawie: ' + TEL + '.'
          : '⚠️ Nie udało się wysłać. Zadzwoń proszę: ' + TEL + ' lub napisz dbmeble@dbmeble.pl.';
        scroll();
      });
    });
  }

  function greet() {
    if (greeted) return; greeted = true;
    addSys('Rozmawiasz z asystentem AI (nie z człowiekiem). — AI Act art. 50');
    addBot('Dzień dobry! Jestem asystentem AI marki DB Concept Space. Pomogę dobrać meble biurowe do Twojej przestrzeni. Od czego zaczynamy?');
    ['Fotel do całodziennej pracy', 'Coś na hałas w open-space', 'Meble do gabinetu', 'Chcę wycenę'].forEach(function (x) {
      var ch = el('dbw-chip'); ch.textContent = x; ch.onclick = function () { if (busy) return; inp.value = x; doSend(); }; chips.appendChild(ch);
    });
  }

  function doSend() { var v = inp.value; inp.value = ''; inp.style.height = 'auto'; if (v.trim().toLowerCase().indexOf('wycen') >= 0 || v.trim().toLowerCase().indexOf('kontakt') >= 0) { send(v); showLead(); } else { send(v); } }

  // ---- zaproszenie (v1.5.0) ----
  // Po ~8 s jeden dymek obok FAB: "Pomogę dobrać meble do biura" z × do zamknięcia. Raz na sesję.
  function closeInvite() { if (invite) invite.classList.remove('dbw-show'); if (fab) fab.classList.remove('dbw-pulse'); }
  function showInvite() {
    if (!invite || !fab) return;
    if (panel.classList.contains('dbw-open')) return;   // czat już otwarty -> bez zaproszenia
    var seen = false; try { seen = sessionStorage.getItem(INVITE_KEY) === '1'; } catch (_) {}
    if (seen) return;
    try { sessionStorage.setItem(INVITE_KEY, '1'); } catch (_) {}
    invite.classList.add('dbw-show');
    fab.classList.add('dbw-pulse');   // JEDNO pulsowanie (animacja ...1 iteracja)
    setTimeout(function () { if (fab) fab.classList.remove('dbw-pulse'); }, 1200);
  }
  function initInvite() {
    var seen = false; try { seen = sessionStorage.getItem(INVITE_KEY) === '1'; } catch (_) {}
    if (seen) return;
    setTimeout(showInvite, INVITE_DELAY);
  }

  function positionPanel() {
    if (isMobile()) {   // bottom-sheet z CSS — wyczyść ew. inline z desktopu
      ['left', 'top', 'right', 'bottom', 'width', 'height'].forEach(function (k) { panel.style[k] = ''; });
      return;
    }
    var fr = fab.getBoundingClientRect(), M = 16;
    var pw = Math.min(380, window.innerWidth - 24);
    var ph = Math.min(600, window.innerHeight - 40);
    var left = (fr.left + fr.width / 2 < window.innerWidth / 2) ? fr.left : (fr.right - pw);
    var top = fr.top - ph - 10;                 // domyślnie nad dymkiem
    if (top < M) top = fr.bottom + 10;          // brak miejsca nad -> pod dymkiem
    if (top + ph > window.innerHeight - M) top = window.innerHeight - ph - M;
    if (top < M) top = M;
    left = Math.max(M, Math.min(left, window.innerWidth - pw - M));
    panel.style.right = 'auto'; panel.style.bottom = 'auto';
    panel.style.left = left + 'px'; panel.style.top = top + 'px';
    panel.style.width = pw + 'px'; panel.style.height = ph + 'px';
  }

  // Mobile: klawiatura ekranowa zmniejsza visualViewport — dopasuj wysokosc panelu, by pole
  // wpisywania (stopka) zostalo widoczne nad klawiatura (prompt Dario 24.10: klawiatura nie zaslania pola).
  function syncViewport() {
    var vv = window.visualViewport;
    if (!vv || !isMobile() || !panel.classList.contains('dbw-open')) return;
    panel.style.height = vv.height + 'px';
    panel.style.top = (vv.offsetTop || 0) + 'px';
    panel.style.bottom = 'auto';
    if (body) body.scrollTop = body.scrollHeight;
  }
  function clearViewport() { panel.style.height = ''; panel.style.top = ''; panel.style.bottom = ''; }
  function initViewport() {
    if (!window.visualViewport) return;
    window.visualViewport.addEventListener('resize', syncViewport);
    window.visualViewport.addEventListener('scroll', syncViewport);
  }

  function open() { closeInvite(); positionPanel(); panel.classList.add('dbw-open'); fab.style.display = 'none'; greet(); inp.focus(); syncViewport(); }
  function close() { panel.classList.remove('dbw-open'); clearViewport(); fab.style.display = 'inline-flex'; }

  // Pkt 5: gdy otwarty lightbox galerii (.pe-lb.open) — CHOWAJ widget całkowicie (nie tylko z-index, zero prześwitu).
  function initLightboxWatch() {
    if (!('MutationObserver' in window)) return;
    function apply(openLb) { fab.style.visibility = openLb ? 'hidden' : ''; panel.style.visibility = openLb ? 'hidden' : ''; if (invite) invite.style.visibility = openLb ? 'hidden' : ''; }
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var t = muts[i].target;
        if (t && t.classList && (t.classList.contains('pe-lb') || t.classList.contains('lightbox'))) {
          apply(/(^|\s)(open|is-open|active)(\s|$)/.test(t.className || '')); return;
        }
      }
    });
    try { mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] }); } catch (_) {}
  }

  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    // v1.5.0: FAB = pigułka "Zapytaj AI" (desktop) / koło "AI" (mobile). Ikona dymka (ciemny stroke) + zielona kropka online.
    fab = el('dbw-fab'); fab.id = 'dbw-fab';
    fab.setAttribute('role', 'button'); fab.setAttribute('tabindex', '0');
    fab.setAttribute('aria-label', 'Zapytaj AI — czat z asystentem AI'); fab.setAttribute('title', 'Zapytaj AI — czat z asystentem AI');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#1A1714" stroke-width="1.9"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    var txt = document.createElement('span'); txt.className = 'dbw-txt'; txt.textContent = 'Zapytaj AI'; fab.appendChild(txt);
    var dot = document.createElement('span'); dot.className = 'dbw-dot'; fab.appendChild(dot);
    var lbl = document.createElement('span'); lbl.className = 'dbw-lbl'; lbl.textContent = 'AI'; fab.appendChild(lbl);
    // otwieranie: zwykły klik + klawiatura (Enter / Spacja)
    fab.addEventListener('click', open);
    fab.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); open(); } });

    // v1.5.0: dymek zaproszenia (nieprzezroczysta karta obok FAB)
    invite = el('dbw-invite'); invite.id = 'dbw-invite';
    invite.appendChild(document.createTextNode('Pomogę dobrać meble do biura'));
    var ix = document.createElement('button'); ix.className = 'dbw-ix'; ix.type = 'button'; ix.textContent = '×';
    ix.setAttribute('aria-label', 'Zamknij'); ix.addEventListener('click', function (e) { e.stopPropagation(); closeInvite(); });
    invite.appendChild(ix);
    invite.addEventListener('click', function (e) { if (e.target === ix) return; open(); });

    panel = el('dbw-panel'); panel.id = 'dbw-panel';
    var head = el('dbw-head');
    av = el('dbw-av'); av.textContent = 'DB'; head.appendChild(av);
    var ht = el(); var t1 = el('dbw-t'); t1.textContent = 'Doradca DB Concept Space'; var t2 = el('dbw-s'); t2.textContent = 'Asystent AI · odpowiada od razu'; ht.appendChild(t1); ht.appendChild(t2); head.appendChild(ht);
    var x = document.createElement('button'); x.className = 'dbw-x'; x.textContent = '×'; x.setAttribute('aria-label', 'Zwiń'); x.onclick = close; head.appendChild(x);

    body = el('dbw-body'); body.id = 'dbw-body';

    var foot = el('dbw-foot');
    chips = el('dbw-chips');
    var inrow = el('dbw-in');
    inp = document.createElement('textarea'); inp.rows = 1; inp.placeholder = 'Napisz wiadomość…'; inp.maxLength = 1000;
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
    inp.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 90) + 'px'; });
    var sb = document.createElement('button'); sb.className = 'dbw-send'; sb.onclick = doSend;
    sb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#1A1714" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    inrow.appendChild(inp); inrow.appendChild(sb);
    var legal = el('dbw-legal'); legal.textContent = 'Rozmawiasz z asystentem AI. Kontakt z człowiekiem: ' + TEL;
    foot.appendChild(chips); foot.appendChild(inrow); foot.appendChild(legal);

    panel.appendChild(head); panel.appendChild(body); panel.appendChild(foot);
    document.body.appendChild(fab); document.body.appendChild(invite); document.body.appendChild(panel);

    initLightboxWatch(); initViewport(); initInvite();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
