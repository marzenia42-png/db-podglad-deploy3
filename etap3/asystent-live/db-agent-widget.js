/* DB Concept Space — asystent AI (widget produkcyjny).
 * Osadzenie (T2, po swapie): <script src="/db-agent-widget.js" defer></script>
 * Endpoint: Supabase Edge Function dbmeble-agent (chat + koncepcja + lead). Klucz API po stronie serwera.
 * Bezpieczeństwo: treść renderowana przez textContent/createElement (XSS-safe). Obrazy tylko z dbmeble.pl.
 *   AI Act art. 50 przy 1. interakcji.
 * Wersja: 1.2.0 (2026-10-01) — AGENT PRZESTRZENI (MVP Free): brief → upload rzutu (RODO) → koncepcja (strefy+produkty READY+moodboard) → lead.
 */
(function () {
  'use strict';
  if (window.__dbAgentLoaded) return; window.__dbAgentLoaded = true;

  var ENDPOINT = 'https://gdfhgcfafxxghsqjvyof.supabase.co/functions/v1/dbmeble-agent';
  var IMG_BASE = 'https://dbmeble.pl';
  var POLICY_URL = '/polityka-prywatnosci/';
  var TEL = '506 147 435';
  var MAX_FILE = 15 * 1024 * 1024;   // 15 MB

  var CSS = [
    '.dbw-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:9px;background:#1A1714;color:#F0E6D3;border:1px solid #C9A96E;padding:11px 17px 11px 13px;border-radius:999px;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.25);font:500 15px/1 -apple-system,Segoe UI,Roboto,Arial,sans-serif}',
    '.dbw-fab:hover{transform:translateY(-2px)}.dbw-fab svg{width:21px;height:21px}',
    '.dbw-fab .dbw-dot{width:8px;height:8px;border-radius:50%;background:#5fbf7a;box-shadow:0 0 0 3px rgba(95,191,122,.25)}',
    '.dbw-panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:380px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 40px);background:#211d19;border:1px solid #3a332c;border-radius:18px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.45);font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif}',
    '.dbw-panel.dbw-open{display:flex}',
    '.dbw-head{background:#1A1714;padding:15px 16px;display:flex;align-items:center;gap:11px;border-bottom:1px solid #3a332c}',
    '.dbw-av{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#C9A96E,#a98643);display:flex;align-items:center;justify-content:center;color:#1A1714;font:700 14px/1 sans-serif;flex:none}',
    '.dbw-head .dbw-t{color:#F0E6D3;font-weight:600;font-size:14.5px}.dbw-head .dbw-s{color:#a89a82;font-size:11.5px;margin-top:2px}',
    '.dbw-x{margin-left:auto;background:none;border:none;color:#a89a82;font-size:22px;cursor:pointer;line-height:1;padding:4px}.dbw-x:hover{color:#F0E6D3}',
    '.dbw-body{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:11px}',
    '.dbw-body::-webkit-scrollbar{width:8px}.dbw-body::-webkit-scrollbar-thumb{background:#3a332c;border-radius:8px}',
    '.dbw-m{max-width:85%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}',
    '.dbw-m.dbw-bot{background:#2c2723;color:#F0E6D3;border-bottom-left-radius:4px;align-self:flex-start}',
    '.dbw-m.dbw-user{background:#C9A96E;color:#1A1714;border-bottom-right-radius:4px;align-self:flex-end;font-weight:500}',
    '.dbw-m.dbw-sys{align-self:center;background:transparent;color:#a89a82;font-size:11.5px;text-align:center;border:1px dashed #3a332c;border-radius:10px;padding:7px 11px;max-width:95%}',
    '.dbw-lead{margin-top:8px;display:flex;flex-direction:column;gap:8px}',
    '.dbw-lead input,.dbw-lead textarea{background:#1a1613;border:1px solid #3a332c;color:#F0E6D3;padding:9px 11px;border-radius:9px;font:13.5px sans-serif}',
    '.dbw-lead input:focus,.dbw-lead textarea:focus{outline:none;border-color:#C9A96E}',
    '.dbw-lead button{background:#C9A96E;color:#1A1714;border:none;padding:10px;border-radius:9px;font-weight:700;cursor:pointer;font-size:14px}',
    '.dbw-foot{padding:11px;border-top:1px solid #3a332c;background:#1A1714}',
    '.dbw-in{display:flex;gap:8px;align-items:flex-end}',
    '.dbw-in textarea{flex:1;background:#211d19;border:1px solid #3a332c;color:#F0E6D3;border-radius:12px;padding:10px 12px;font:14px sans-serif;resize:none;max-height:90px;line-height:1.4}',
    '.dbw-in textarea:focus{outline:none;border-color:#C9A96E}',
    '.dbw-send{background:#C9A96E;border:none;width:40px;height:40px;border-radius:12px;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center}.dbw-send svg{width:18px;height:18px}',
    '.dbw-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}',
    '.dbw-chip{background:rgba(201,169,110,.1);border:1px solid rgba(201,169,110,.3);color:#F0E6D3;font-size:12px;padding:6px 10px;border-radius:999px;cursor:pointer}',
    '.dbw-legal{text-align:center;color:#8a7d68;font-size:10.5px;margin-top:8px}',
    '.dbw-typ{display:flex;gap:4px;padding:11px 13px}.dbw-typ span{width:7px;height:7px;background:#a89a82;border-radius:50%;animation:dbwb 1.2s infinite}',
    '.dbw-typ span:nth-child(2){animation-delay:.2s}.dbw-typ span:nth-child(3){animation-delay:.4s}@keyframes dbwb{0%,60%,100%{opacity:.25}30%{opacity:1}}',
    /* --- AGENT PRZESTRZENI: upload rzutu + zgoda RODO --- */
    '.dbw-upl{margin-top:8px;display:flex;flex-direction:column;gap:9px;border:1px dashed #3a332c;border-radius:12px;padding:12px}',
    '.dbw-upl .dbw-drop{border:1px dashed #C9A96E;border-radius:10px;padding:14px;text-align:center;color:#d8c9ad;font-size:13px;cursor:pointer}',
    '.dbw-upl .dbw-fname{font-size:12px;color:#a89a82}',
    '.dbw-consent{display:flex;gap:8px;align-items:flex-start;font-size:11.5px;color:#a89a82;line-height:1.45}',
    '.dbw-consent input{margin-top:2px;flex:none}.dbw-consent a{color:#C9A96E}',
    '.dbw-upl button{background:#C9A96E;color:#1A1714;border:none;padding:10px;border-radius:9px;font-weight:700;cursor:pointer;font-size:14px}',
    '.dbw-upl button:disabled{opacity:.5;cursor:not-allowed}',
    /* --- EKRAN KONCEPCJI --- */
    '.dbw-konc{background:#2c2723;border:1px solid #3a332c;border-radius:14px;padding:13px;align-self:stretch;max-width:100%}',
    '.dbw-konc h4{color:#C9A96E;font-size:13px;margin:0 0 7px;font-weight:700}',
    '.dbw-konc .dbw-wstep{color:#F0E6D3;font-size:13.5px;line-height:1.5;margin-bottom:10px}',
    '.dbw-strefa{border-top:1px solid #3a332c;padding-top:9px;margin-top:9px}',
    '.dbw-strefa .dbw-sn{color:#F0E6D3;font-weight:600;font-size:13.5px}',
    '.dbw-strefa .dbw-so{color:rgba(240,230,211,.9);font-size:12.5px;line-height:1.5;margin:3px 0 7px}',
    '.dbw-prod{display:block;background:#1a1613;border:1px solid #3a332c;border-radius:9px;padding:8px 10px;margin:5px 0;text-decoration:none}',
    '.dbw-prod:hover{border-color:#C9A96E}',
    '.dbw-prod .dbw-pn{color:#F0E6D3;font-size:13px;font-weight:600}.dbw-prod .dbw-pp{color:#a89a82;font-size:11.5px}',
    '.dbw-prod .dbw-pr{color:rgba(240,230,211,.85);font-size:12px;margin-top:2px}',
    '.dbw-mood{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}',
    '.dbw-mood a{display:block;aspect-ratio:1/1;border-radius:8px;overflow:hidden;background:#1a1613}',
    '.dbw-mood img{width:100%;height:100%;object-fit:cover;display:block}',
    '.dbw-note{color:#8a7d68;font-size:11px;line-height:1.45;margin-top:10px;font-style:italic}',
    '.dbw-upsell{color:#d8c9ad;font-size:12.5px;line-height:1.5;margin-top:9px;border-top:1px solid #3a332c;padding-top:9px}',
    '.dbw-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}',
    '@media(max-width:480px){.dbw-panel{right:0;bottom:0;width:100vw;height:100vh;max-height:100vh;border-radius:0}}'
  ].join('');

  var messages = [];       // historia rozmowy do API
  var greeted = false, leadShown = false, busy = false, wizMentioned = false;
  var flow = 'chat';       // 'chat' = doradca produktowy | 'koncepcja' = agent przestrzeni
  var rzut = null;         // {data(base64), media_type, name, kind} — rzut do wizji
  var lastConcept = null;  // tekst koncepcji (do leada)
  var lastRzutUrl = '';    // signed URL rzutu z backendu (do leada)
  var body, inp, chips;

  function el(cls) { var d = document.createElement('div'); if (cls) d.className = cls; return d; }
  function scroll() { body.scrollTop = body.scrollHeight; }
  function addBot(text) { var m = el('dbw-m dbw-bot'); m.textContent = text; body.appendChild(m); scroll(); return m; }
  function addUser(text) { var m = el('dbw-m dbw-user'); m.textContent = text; body.appendChild(m); scroll(); }
  function addSys(text) { var m = el('dbw-m dbw-sys'); m.textContent = text; body.appendChild(m); scroll(); }
  function typing() { var m = el('dbw-m dbw-bot'); m.innerHTML = '<div class="dbw-typ"><span></span><span></span><span></span></div>'; body.appendChild(m); scroll(); return m; }

  function api(payload) {
    return fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }

  function send(text) {
    if (busy || !text.trim()) return;
    if (flow === 'koncepcja') { sendKoncepcja(text); return; }
    busy = true;
    addUser(text);
    messages.push({ role: 'user', content: text.slice(0, 1000) });
    if (messages.length > 24) messages = messages.slice(-24);
    var t = typing();
    api({ mode: 'chat', messages: messages }).then(function (j) {
      t.remove();
      var reply = j.response || 'Przepraszamy, chwilowo nie możemy odpowiedzieć. Prosimy zadzwonić: ' + TEL + '.';
      addBot(reply);
      if (j.response) messages.push({ role: 'assistant', content: j.response });
      if (/wizualizacj/i.test(text + ' ' + reply)) wizMentioned = true;
      busy = false;
    }).catch(function () {
      t.remove(); addBot('Coś nie zadziałało po naszej stronie. Prosimy zadzwonić: ' + TEL + '.'); busy = false;
    });
  }

  // --- AGENT PRZESTRZENI: brief → (upload) → koncepcja ---
  function sendKoncepcja(text) {
    busy = true;
    addUser(text);
    messages.push({ role: 'user', content: text.slice(0, 1500) });
    if (messages.length > 24) messages = messages.slice(-24);
    var payload = { mode: 'koncepcja', messages: messages };
    if (rzut) { payload.rzut = rzut; payload.consent = true; }   // zgoda zebrana przy uploadzie
    var t = typing();
    api(payload).then(function (j) {
      t.remove();
      if (j.mode === 'koncepcja' && j.concept) {
        messages.push({ role: 'assistant', content: 'Przygotowałem koncepcję aranżacji.' });
        renderConcept(j.concept);
        lastConcept = conceptToText(j.concept);
        lastRzutUrl = j.rzutUrl || '';
        wizMentioned = true;
        showLead();                       // od razu zbieramy kontakt
      } else {
        // faza brief (pytanie) albo komunikat empty/limit
        var reply = j.response || 'Opowiedz mi o przestrzeni — wymiary, ile osób, jakie strefy?';
        addBot(reply);
        if (j.response) messages.push({ role: 'assistant', content: j.response });
        // gdy brief jeszcze niekompletny — zachęć do rzutu, jeśli nie wgrany
        if (j.mode === 'brief' && !rzut) maybeOfferUpload();
      }
      busy = false;
    }).catch(function () {
      t.remove(); addBot('Coś nie zadziałało po naszej stronie. Prosimy zadzwonić: ' + TEL + '.'); busy = false;
    });
  }

  var uploadOffered = false;
  function maybeOfferUpload() {
    if (uploadOffered) return; uploadOffered = true;
    var m = addBot('Jeśli dysponują Państwo rzutem pomieszczenia (zdjęcie, PDF lub plik CAD) — prosimy go załączyć; koncepcja będzie trafniejsza.');
    var b = document.createElement('button'); b.className = 'dbw-chip'; b.textContent = 'Dołączam rzut';
    b.style.marginTop = '8px'; b.onclick = showUpload; m.appendChild(document.createElement('br')); m.appendChild(b);
    scroll();
  }

  function showUpload() {
    var wrap = el('dbw-m dbw-bot');
    wrap.appendChild(document.createTextNode('Rzut pomieszczenia:'));
    var box = el('dbw-upl');
    var drop = el('dbw-drop'); drop.textContent = 'Proszę wybrać plik (JPG, PNG, PDF, DWG/DXF — do 15 MB)';
    var fi = document.createElement('input'); fi.type = 'file';
    fi.accept = 'image/png,image/jpeg,image/webp,application/pdf,.dwg,.dxf';
    fi.style.display = 'none';
    var fname = el('dbw-fname');
    drop.onclick = function () { fi.click(); };
    var cons = el('dbw-consent');
    var cb = document.createElement('input'); cb.type = 'checkbox';
    var lab = document.createElement('label');
    lab.appendChild(document.createTextNode('Zgadzam się na przetwarzanie przesłanego rzutu i danych kontaktowych przez DB Concept Space w celu przygotowania koncepcji i wyceny ('));
    var a = document.createElement('a'); a.href = POLICY_URL; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'polityka prywatności';
    lab.appendChild(a); lab.appendChild(document.createTextNode(').'));
    cons.appendChild(cb); cons.appendChild(lab);
    var btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Dołączam rzut'; btn.disabled = true;
    var picked = null;
    function refresh() { btn.disabled = !(picked && cb.checked); }
    cb.addEventListener('change', refresh);
    fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0]; if (!f) return;
      if (f.size > MAX_FILE) { fname.textContent = 'Plik za duży (max 15 MB).'; picked = null; refresh(); return; }
      picked = f; fname.textContent = f.name + ' (' + Math.round(f.size / 1024) + ' KB)'; refresh();
    });
    btn.onclick = function () {
      if (!picked || !cb.checked) return;
      btn.disabled = true; btn.textContent = 'Wczytuję…';
      var r = new FileReader();
      r.onload = function () {
        var b64 = String(r.result).split(',')[1] || '';
        var isCad = /\.(dwg|dxf)$/i.test(picked.name);
        rzut = { data: b64, media_type: picked.type || (isCad ? 'image/vnd.dwg' : 'application/octet-stream'), name: picked.name, kind: isCad ? 'dwg' : '' };
        box.textContent = isCad
          ? 'Rzut CAD dołączony — przekażemy go doradcy. Prosimy dopisać w rozmowie wymiary i kształt pomieszczenia.'
          : 'Rzut dołączony. Prosimy napisać „gotowe” lub dopytać — przygotujemy koncepcję.';
        scroll();
      };
      r.readAsDataURL(picked);
    };
    box.appendChild(drop); box.appendChild(fi); box.appendChild(fname); box.appendChild(cons); box.appendChild(btn);
    wrap.appendChild(box); body.appendChild(wrap); scroll();
  }

  // Render koncepcji — XSS-safe (textContent/createElement). Obrazy tylko z IMG_BASE.
  function renderConcept(c) {
    var box = el('dbw-konc');
    var h = document.createElement('h4'); h.textContent = 'Koncepcja orientacyjna'; box.appendChild(h);
    if (c.wstep) { var w = el('dbw-wstep'); w.textContent = c.wstep; box.appendChild(w); }
    (c.strefy || []).forEach(function (s) {
      var sd = el('dbw-strefa');
      var sn = el('dbw-sn'); sn.textContent = s.nazwa; sd.appendChild(sn);
      if (s.opis) { var so = el('dbw-so'); so.textContent = s.opis; sd.appendChild(so); }
      (s.produkty || []).forEach(function (p) {
        var a = document.createElement('a'); a.className = 'dbw-prod';
        a.href = safeUrl(p.url); if (a.href) { a.target = '_blank'; a.rel = 'noopener'; }
        var pn = el('dbw-pn'); pn.textContent = p.nazwa + (p.prod ? ' · ' + p.prod : ''); a.appendChild(pn);
        if (p.powod) { var pr = el('dbw-pr'); pr.textContent = p.powod; a.appendChild(pr); }
        sd.appendChild(a);
      });
      box.appendChild(sd);
    });
    if (c.moodboard && c.moodboard.length) {
      var hm = document.createElement('h4'); hm.textContent = 'Moodboard'; hm.style.marginTop = '11px'; box.appendChild(hm);
      var grid = el('dbw-mood');
      c.moodboard.forEach(function (m) {
        var src = safeImg(m.img); if (!src) return;
        var a = document.createElement('a'); a.href = safeUrl(m.url) || src; a.target = '_blank'; a.rel = 'noopener';
        var im = document.createElement('img'); im.src = src; im.loading = 'lazy';
        im.alt = ((m.kol || '') + ' ' + (m.prod || '')).trim() || 'produkt DB';
        a.appendChild(im); grid.appendChild(a);
      });
      box.appendChild(grid);
    }
    if (c.upsell) { var up = el('dbw-upsell'); up.textContent = c.upsell; box.appendChild(up); }
    var note = el('dbw-note'); note.textContent = c.dopisek || ''; box.appendChild(note);
    body.appendChild(box); scroll();
  }

  function conceptToText(c) {
    var out = [];
    if (c.wstep) out.push(c.wstep);
    (c.strefy || []).forEach(function (s) {
      out.push('\n[' + s.nazwa + '] ' + (s.opis || ''));
      (s.produkty || []).forEach(function (p) { out.push('  • ' + p.nazwa + (p.prod ? ' (' + p.prod + ')' : '') + (p.url ? ' — ' + IMG_BASE + p.url : '')); });
    });
    return out.join('\n').slice(0, 2800);
  }

  // Dopuszczamy TYLKO ścieżki względne dbmeble.pl lub nasz host (anti-open-redirect / XSS).
  function safeUrl(u) {
    u = String(u || '');
    if (/^\/[^/]/.test(u)) return IMG_BASE + u;
    if (u.indexOf(IMG_BASE + '/') === 0) return u;
    return '';
  }
  function safeImg(u) {
    u = String(u || '');
    if (u.indexOf(IMG_BASE + '/') === 0) return u;
    if (/^\/images\//.test(u)) return IMG_BASE + u;
    return '';
  }

  function showLead() {
    if (leadShown) return; leadShown = true;
    var shownAt = Date.now();
    var wrap = el('dbw-m dbw-bot');
    wrap.appendChild(document.createTextNode('Prosimy zostawić kontakt — doradca wróci z wyceną (bezpłatnie):'));
    var f = document.createElement('form'); f.className = 'dbw-lead';
    var n = document.createElement('input'); n.placeholder = 'Imię i nazwisko / firma'; n.required = true; n.maxLength = 120;
    var c = document.createElement('input'); c.placeholder = 'Telefon lub e-mail'; c.required = true; c.maxLength = 120;
    var tp = document.createElement('textarea'); tp.placeholder = 'Czego dotyczy? (opcjonalnie)'; tp.rows = 2; tp.maxLength = 200;
    var hp = document.createElement('input'); hp.className = 'dbw-hp'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true'); hp.name = 'company_url';   // honeypot (bot wypełni → cichy odrzut)
    var b = document.createElement('button'); b.type = 'submit'; b.textContent = 'Wyślij zapytanie';
    f.appendChild(n); f.appendChild(c); f.appendChild(tp); f.appendChild(hp); f.appendChild(b);
    wrap.appendChild(f); body.appendChild(wrap); scroll();
    f.addEventListener('submit', function (e) {
      e.preventDefault(); b.disabled = true; b.textContent = 'Wysyłam…';
      var summary = messages.slice(-8).map(function (m) { return (m.role === 'user' ? 'Klient: ' : 'Agent: ') + m.content; }).join('\n');
      var lead = { name: n.value, contact: c.value, topic: tp.value, summary: summary,
        wizualizacja: wizMentioned ? 'tak' : '', hp: hp.value, dt: Date.now() - shownAt };
      if (lastConcept) lead.koncepcja = lastConcept;
      if (lastRzutUrl) lead.rzutUrl = lastRzutUrl;
      api({ mode: 'lead', lead: lead }).then(function (j) {
        wrap.textContent = j && j.ok
          ? 'Dziękujemy! Zapytanie przyjęte — doradca DB Concept Space odezwie się w ciągu jednego dnia roboczego. W pilnej sprawie: ' + TEL + '.'
          : 'Nie udało się wysłać. Prosimy zadzwonić: ' + TEL + ' lub napisać na dbmeble@dbmeble.pl.';
        scroll();
      });
    });
  }

  function startKoncepcja() {
    if (busy) return;
    flow = 'koncepcja'; uploadOffered = false;
    addBot('Świetnie — przygotujemy koncepcję aranżacji Państwa przestrzeni. Prosimy podać: jakie są wymiary pomieszczenia (albo przesłać rzut), ile osób będzie z niego korzystać i jakie strefy mają się zmieścić.');
    var b = document.createElement('button'); b.className = 'dbw-chip'; b.textContent = 'Dołączam rzut';
    b.onclick = showUpload; chips.appendChild(b);
  }

  function greet() {
    if (greeted) return; greeted = true;
    // Podstawa prawna: AI Act art. 50 (obowiązek ujawnienia, że to AI) — treść dla klienta BEZ cytowania podstawy.
    addSys('Rozmowa z asystentem AI (nie z człowiekiem).');
    addBot('Dzień dobry! To asystent AI marki DB Concept Space. Pomożemy dobrać meble biurowe albo przygotujemy koncepcję aranżacji całej przestrzeni. W czym możemy pomóc?');
    var kch = el('dbw-chip'); kch.textContent = 'Zaprojektuj przestrzeń';
    kch.onclick = function () { startKoncepcja(); }; chips.appendChild(kch);
    ['Fotel do całodziennej pracy', 'Coś na hałas w open-space', 'Meble do gabinetu', 'Chcę wycenę'].forEach(function (x) {
      var ch = el('dbw-chip'); ch.textContent = x; ch.onclick = function () { if (busy) return; inp.value = x; doSend(); }; chips.appendChild(ch);
    });
  }

  function doSend() {
    var v = inp.value; inp.value = ''; inp.style.height = 'auto';
    if (flow === 'koncepcja') { send(v); return; }   // koncepcja: lead pojawia się po wygenerowaniu koncepcji
    var low = v.trim().toLowerCase();
    if (low.indexOf('wycen') >= 0 || low.indexOf('kontakt') >= 0) { send(v); showLead(); } else { send(v); }
  }

  function open() { document.getElementById('dbw-panel').classList.add('dbw-open'); document.getElementById('dbw-fab').style.display = 'none'; greet(); inp.focus(); }
  function close() { document.getElementById('dbw-panel').classList.remove('dbw-open'); document.getElementById('dbw-fab').style.display = 'flex'; }

  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

    var fab = el('dbw-fab'); fab.id = 'dbw-fab';
    fab.innerHTML = '<span class="dbw-dot"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    fab.appendChild(document.createTextNode('Doradca AI'));
    fab.onclick = open;

    var panel = el('dbw-panel'); panel.id = 'dbw-panel';
    var head = el('dbw-head');
    var av = el('dbw-av'); av.textContent = 'DB'; head.appendChild(av);
    var ht = el(); var t1 = el('dbw-t'); t1.textContent = 'Doradca DB Concept Space'; var t2 = el('dbw-s'); t2.textContent = 'Asystent AI · odpowiada od razu'; ht.appendChild(t1); ht.appendChild(t2); head.appendChild(ht);
    var x = document.createElement('button'); x.className = 'dbw-x'; x.textContent = '×'; x.onclick = close; head.appendChild(x);

    body = el('dbw-body'); body.id = 'dbw-body';

    var foot = el('dbw-foot');
    chips = el('dbw-chips');
    var inrow = el('dbw-in');
    inp = document.createElement('textarea'); inp.rows = 1; inp.placeholder = 'Wiadomość…'; inp.maxLength = 1000;
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
    inp.addEventListener('input', function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 90) + 'px'; });
    var sb = document.createElement('button'); sb.className = 'dbw-send'; sb.onclick = doSend;
    sb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#1A1714" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    inrow.appendChild(inp); inrow.appendChild(sb);
    var legal = el('dbw-legal'); legal.textContent = 'Rozmawiasz z asystentem AI. Kontakt z człowiekiem: ' + TEL;
    foot.appendChild(chips); foot.appendChild(inrow); foot.appendChild(legal);

    panel.appendChild(head); panel.appendChild(body); panel.appendChild(foot);
    document.body.appendChild(fab); document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
