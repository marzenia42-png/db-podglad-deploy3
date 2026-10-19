/* DB NEW — „Moja Oferta" / KOSZYK ZAPYTAŃ (B2B).
   JEDEN mechanizm: window.DBMOffer (add/open/clear). localStorage `dbm_offer_v1`.
   Wpinany GLOBALNIE przez footer.js (window.DBM_OFFER_ROOT). Zero cen.
   Wysyłka = POST do kontakt.php (source=koszyk, items_json) — NIE mailto.
   Teksty UX nowe = placeholdery TEKST_BETI_x (BETI wypełnia). Etykiety pól = słowa PLANu.
   Decyzje BETI 18.10: bez eksportu PDF/Excel; honeypot=website; LEJEK serwerowo.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var CFG = window.DBM_CONFIG || {};
  var KEY = 'dbm_offer_v1';
  var OLD_KEY = 'db_oferta';           // stary koszyk z product-engine (migracja, by klient nie stracił pozycji)
  var GA = 'G-T68TM6H9F5';

  // root do korzenia /new/ (kontakt.php, polityka). Ustawia footer.js; fallback = ''.
  function root() {
    if (typeof window.DBM_OFFER_ROOT === 'string') return window.DBM_OFFER_ROOT;
    try { var b = document.body && document.body.getAttribute('data-root'); if (b != null) return b; } catch (e) {}
    return '';
  }
  function kontaktAction() { return root() + 'kontakt.php'; }
  function politykaHref() { return root() + 'polityka-prywatnosci.html'; }

  // ——— TEKSTY UX (BETI 2026-10-19, wstawione DOSŁOWNIE; forma „Państwo", bez cen) ———
  var T = {
    title:     'Moja Oferta',                 // istniejąca nazwa (zachowana)
    empty:     'Państwa lista jest pusta. Produkty dodają Państwo przyciskiem „+ Dodaj do oferty" na kartach.', // TEKST_BETI_1
    added:     'Dodano do Państwa oferty: {nazwa}',          // TEKST_BETI_2 ({nazwa} = nazwa pozycji)
    dup:       '{nazwa} jest już na liście — zwiększyliśmy ilość do {n} szt.', // TEKST_BETI_3 ({nazwa},{n})
    formSub:   'Przygotujemy ofertę na wybrane meble. Odpowiadamy w ciągu 1 dnia roboczego.', // TEKST_BETI_4
    rodo:      'Wyrażam zgodę na przetwarzanie moich danych osobowych przez DB MEBLE Beata Barut w celu przygotowania oferty i kontaktu w tej sprawie. Szczegóły w Polityce prywatności.', // TEKST_BETI_5 (link = fraza „Polityce prywatności")
    success:   'Dziękujemy. Zapytanie zostało wysłane — skontaktujemy się z Państwem w ciągu 1 dnia roboczego.', // TEKST_BETI_6
    sending:   'Wysyłamy zapytanie…',          // TEKST_BETI_7
    errFill:   'Proszę uzupełnić pola oznaczone gwiazdką i podać poprawny e-mail.', // TEKST_BETI_8 (19.10: e-mail obowiązkowy, telefon opcjonalny)
    errPhone:  'Prosimy podać poprawny numer telefonu albo zostawić pole puste.', // 19.10 — telefon opcjonalny, format tylko gdy wpisany
    errSend:   'Nie udało się wysłać zapytania. Prosimy spróbować ponownie albo skontaktować się bezpośrednio: 506 147 435, dbmeble@dbmeble.pl.', // TEKST_BETI_9
    notePh:    'Np. liczba stanowisk, metraż, termin, kolory', // TEKST_BETI_10 (placeholder głównego pola „Uwagi")
    itemNotePh: 'Np. kolor, wersja, wykończenie',            // BETI 19.10 — placeholder notatki PER POZYCJA
    clear:     'Wyczyść listę',                // TEKST_BETI_11
    // etykiety pól — słowa PLANu (BETI-approved), nie wymyślone:
    lFirma: 'Firma', lOsoba: 'Imię i nazwisko', lEmail: 'E-mail', lPhone: 'Telefon',
    lZakres: 'Metraż / termin', lUwagi: 'Uwagi', send: 'Wyślij zapytanie',
    priceHint: 'Cena na zapytanie', barName: 'Moja Oferta'
  };

  // ——— STAN ———
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function persist(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function save(items) { persist(items); render(); }
  function uid() { return 'o' + Math.random().toString(36).slice(2, 9); }
  function count(items) { items = items || load(); return items.reduce(function (a, x) { return a + (x.qty || 1); }, 0); }

  // migracja starego db_oferta → dbm_offer_v1 (raz; stary czyścimy by nie dublować)
  function migrate() {
    var old;
    try { old = JSON.parse(localStorage.getItem(OLD_KEY) || '[]') || []; } catch (e) { old = []; }
    if (!old.length) return;
    var items = load();
    old.forEach(function (o) {
      var url = o.url || '', wariant = o.wariant || o.kod || '';
      var ex = items.filter(function (i) { return i.url === url && (i.wariant || '') === wariant; })[0];
      if (ex) { ex.qty = (ex.qty || 1) + (o.ilosc || 1); }
      else {
        items.push({ id: uid(), name: o.nazwa || o.produkt || '', prod: o.producent || '', cat: '',
          wariant: wariant, url: url, img: o.thumb || '', qty: o.ilosc || 1, note: o.uwagi || '' });
      }
    });
    persist(items);
    try { localStorage.removeItem(OLD_KEY); window.DB_OFERTA = []; } catch (e) {}
  }

  // ——— DODAWANIE (jedno API; asystent i przyciski kart wołają to samo) ———
  function add(data) {
    data = data || {};
    var url = data.url || (typeof location !== 'undefined' ? location.href : '');
    var wariant = data.wariant || data.cfg || '';
    var name = data.name || data.model || data.produkt || '';
    var prod = data.prod || data.producent || '';
    var items = load();
    var ex = items.filter(function (i) { return i.url === url && (i.wariant || '') === wariant; })[0];
    if (ex) { ex.qty = (ex.qty || 1) + 1; save(items); toast(T.dup.replace('{nazwa}', ex.name || name).replace('{n}', ex.qty)); openPanel(); }
    else {
      items.push({ id: uid(), name: name, prod: prod, cat: data.cat || '', wariant: wariant,
        url: url, img: data.img || '', qty: 1, note: '' });
      save(items); toast(T.added.replace('{nazwa}', name));
      ev('add_to_offer', { producent: prod, model: name, wariant: wariant });
    }
  }
  function upd(id, f, v) { var it = load(); var x = it.filter(function (i) { return i.id === id; })[0]; if (x) { x[f] = v; persist(it); syncCounts(); } }
  function qtyStep(id, d) { var it = load(); var x = it.filter(function (i) { return i.id === id; })[0]; if (x) { x.qty = Math.max(1, (x.qty || 1) + d); save(it); } }
  function rm(id) { save(load().filter(function (i) { return i.id !== id; })); }
  function clear() { save([]); }

  // ——— GA4 / Clarity — TYLKO po zgodzie (Consent Mode v2; localStorage dbm_consent) ———
  function ev(name, params) {
    try {
      if (localStorage.getItem('dbm_consent') !== 'granted') return;
      if (window.gtag) window.gtag('event', name, params || {});
      if (window.clarity) window.clarity('set', name, JSON.stringify(params || {}));
    } catch (e) {}
  }

  // ——— CSS (samodzielny — moduł globalny, jak header.js/footer.js) ———
  function ensureCss() {
    if (document.getElementById('dbmOfferCss')) return;
    var g = '#C8A96A', g2 = '#E0C58E', ink = '#131316', cream = '#FAFAF8', line = 'rgba(200,169,106,.18)';
    var css = [
      '#dbmOfferLauncher{position:fixed;right:22px;bottom:22px;z-index:9000;display:none;align-items:center;gap:9px;background:' + g + ';color:#1A1714;border:0;border-radius:40px;padding:13px 20px;font:600 15px "DM Sans",system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 30px -8px rgba(0,0,0,.5)}',
      '#dbmOfferLauncher.show{display:inline-flex}',
      '#dbmOfferLauncher:hover{background:' + g2 + '}',
      '#dbmOfferLauncher .cnt{background:#1A1714;color:' + g + ';border-radius:20px;min-width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;padding:0 6px}',
      '#dbmOfferBar{position:fixed;left:0;right:0;bottom:0;z-index:9000;display:none;align-items:center;justify-content:space-between;gap:12px;background:' + ink + ';border-top:1px solid ' + line + ';padding:12px 16px calc(12px + env(safe-area-inset-bottom));color:' + cream + '}',
      '#dbmOfferBar.show{display:flex}',
      '@media(min-width:561px){#dbmOfferBar.show{display:none}}',   // pasek dolny = tylko mobile; desktop ma launcher
      '#dbmOfferBar .lbl{font:600 16px "DM Sans",system-ui,sans-serif}',
      '#dbmOfferBar .cnt{color:' + g + '}',
      '#dbmOfferBar button{background:' + g + ';color:#1A1714;border:0;border-radius:8px;padding:0 18px;min-height:44px;font:600 16px "DM Sans",system-ui,sans-serif;cursor:pointer}',
      '#dbmOfferBackdrop{position:fixed;inset:0;z-index:9100;background:rgba(8,8,10,.55);opacity:0;visibility:hidden;transition:opacity .25s}',
      '#dbmOfferBackdrop.open{opacity:1;visibility:visible}',
      '#dbmOfferPanel{position:fixed;top:0;right:0;bottom:0;z-index:9200;width:min(440px,100vw);max-width:100vw;background:' + ink + ';color:' + cream + ';display:flex;flex-direction:column;transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.7,.2,1);font-family:"DM Sans",system-ui,sans-serif;box-shadow:-24px 0 60px -30px rgba(0,0,0,.8)}',
      '#dbmOfferPanel.open{transform:none}',
      'html[data-theme="light"] #dbmOfferPanel,html[data-theme="light"] #dbmOfferBar{background:' + cream + ';color:#1A1714}',
      '.dbm-op-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid ' + line + '}',
      '.dbm-op-head h3{margin:0;font:500 22px "Cormorant Garamond",serif}',
      '.dbm-op-head .x{background:none;border:0;color:inherit;font-size:26px;line-height:1;cursor:pointer;width:40px;height:40px}',
      '.dbm-op-body{flex:1;overflow:auto;padding:10px 20px}',
      '.dbm-op-empty{padding:40px 6px;opacity:.7;font-size:16px;line-height:1.5}',
      '.dbm-op-item{display:grid;grid-template-columns:62px 1fr auto;gap:12px;align-items:start;padding:14px 0;border-bottom:1px solid ' + line + '}',
      '.dbm-op-item img{width:62px;height:62px;object-fit:cover;border-radius:6px;background:#000}',
      '.dbm-op-item .nm{font:500 17px "Cormorant Garamond",serif;line-height:1.2}',
      '.dbm-op-item .pr{font-size:12px;opacity:.62;margin:2px 0 6px}',
      '.dbm-op-item .note{width:100%;background:transparent;border:1px solid ' + line + ';border-radius:6px;color:inherit;font:400 13px inherit;padding:7px 9px;box-sizing:border-box}',
      '.dbm-op-item .note:focus{outline:none;border-color:' + g + '}',
      '.dbm-op-qty{display:flex;align-items:center;gap:6px;margin-top:6px}',
      '.dbm-op-qty button{width:30px;height:30px;border:1px solid ' + line + ';background:transparent;color:inherit;border-radius:6px;font-size:16px;cursor:pointer;line-height:1}',
      '.dbm-op-qty b{min-width:22px;text-align:center;font-size:15px}',
      '.dbm-op-item .rm{background:none;border:0;color:rgba(200,120,120,.9);font-size:12px;text-decoration:underline;cursor:pointer;align-self:start}',
      '.dbm-op-foot{border-top:1px solid ' + line + ';padding:16px 20px calc(16px + env(safe-area-inset-bottom));max-height:62vh;overflow:auto}',
      '.dbm-of-field{margin-bottom:11px}',
      '.dbm-of-field label{display:block;font-size:12px;letter-spacing:.03em;opacity:.8;margin-bottom:4px}',
      '.dbm-of-field input,.dbm-of-field textarea{width:100%;box-sizing:border-box;background:transparent;border:1px solid ' + line + ';border-radius:6px;color:inherit;font:400 16px "DM Sans",system-ui,sans-serif;padding:11px 12px}',
      '.dbm-of-field input:focus,.dbm-of-field textarea:focus{outline:none;border-color:' + g + '}',
      '.dbm-of-row{display:grid;grid-template-columns:1fr 1fr;gap:11px}',
      '.dbm-of-rodo{display:flex;gap:10px;align-items:flex-start;margin:12px 0;font-size:13px;line-height:1.5;opacity:.9}',
      '.dbm-of-rodo input{margin-top:3px;width:18px;height:18px;flex:0 0 auto;accent-color:' + g + '}',
      '.dbm-of-rodo a{color:' + g + '}',
      '.dbm-of-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}',
      '.dbm-op-send{width:100%;background:' + g + ';color:#1A1714;border:0;border-radius:8px;min-height:48px;font:600 16px "DM Sans",system-ui,sans-serif;cursor:pointer;margin-top:4px}',
      '.dbm-op-send:hover{background:' + g2 + '}',
      '.dbm-op-send[disabled]{opacity:.6;cursor:default}',
      '.dbm-op-clr{display:block;margin:10px auto 0;background:none;border:0;color:inherit;opacity:.6;font-size:13px;text-decoration:underline;cursor:pointer}',
      '.dbm-op-hint{font-size:12px;opacity:.6;margin:10px 0 0;text-align:center}',
      '.dbm-op-msg{font-size:14px;line-height:1.5;margin:8px 0 0;padding:10px 12px;border-radius:6px}',
      '.dbm-op-msg.ok{background:rgba(120,180,120,.14);color:#86c186}',
      '.dbm-op-msg.err{background:rgba(200,120,120,.14);color:#e08a8a}',
      '.dbm-op-done{color:#86c186}',
      '#dbmToast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%) translateY(14px);z-index:9300;background:#1A1714;color:' + cream + ';border:1px solid ' + line + ';border-radius:8px;padding:12px 18px;font:500 14px "DM Sans",system-ui,sans-serif;opacity:0;visibility:hidden;transition:opacity .25s,transform .25s;max-width:92vw}',
      '#dbmToast.show{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}',
      '@media(max-width:560px){#dbmOfferLauncher{display:none!important}#dbmOfferPanel{width:100vw}.dbm-of-row{grid-template-columns:1fr}}'
    ].join('');
    var st = document.createElement('style'); st.id = 'dbmOfferCss'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  // ——— UI scaffold ———
  function ensureUI() {
    ensureCss();
    if (document.getElementById('dbmOfferPanel')) return;
    var l = document.createElement('button'); l.id = 'dbmOfferLauncher'; l.type = 'button';
    l.innerHTML = '<span>' + esc(T.barName) + '</span> <span class="cnt">0</span>';
    l.onclick = openPanel; document.body.appendChild(l);

    var bar = document.createElement('div'); bar.id = 'dbmOfferBar';
    bar.innerHTML = '<span class="lbl">' + esc(T.barName) + ' <span class="cnt">(0)</span></span><button type="button">' + esc(T.send) + '</button>';
    bar.querySelector('button').onclick = openPanel;
    bar.querySelector('.lbl').onclick = openPanel;
    document.body.appendChild(bar);

    var b = document.createElement('div'); b.id = 'dbmOfferBackdrop'; b.onclick = closePanel; document.body.appendChild(b);
    var p = document.createElement('aside'); p.id = 'dbmOfferPanel'; p.setAttribute('aria-label', T.title); p.setAttribute('aria-hidden', 'true');
    p.innerHTML = '<div class="dbm-op-head"><h3>' + esc(T.title) + '</h3><button class="x" type="button" aria-label="Zamknij">×</button></div>'
      + '<div class="dbm-op-body" id="dbmOpBody"></div>'
      + '<div class="dbm-op-foot" id="dbmOpFoot"></div>';
    document.body.appendChild(p);
    p.querySelector('.x').onclick = closePanel;
    var t = document.createElement('div'); t.id = 'dbmToast'; document.body.appendChild(t);
  }
  function openPanel() { ensureUI(); render(); var p = document.getElementById('dbmOfferPanel'); p.classList.add('open'); p.setAttribute('aria-hidden', 'false'); document.getElementById('dbmOfferBackdrop').classList.add('open'); ev('open_offer', {}); }
  function closePanel() { var p = document.getElementById('dbmOfferPanel'); if (p) { p.classList.remove('open'); p.setAttribute('aria-hidden', 'true'); document.getElementById('dbmOfferBackdrop').classList.remove('open'); } }
  var _tt; function toast(m) { ensureUI(); var t = document.getElementById('dbmToast'); t.textContent = m; t.classList.add('show'); clearTimeout(_tt); _tt = setTimeout(function () { t.classList.remove('show'); }, 2400); }

  function syncCounts() {
    var n = count();
    var L = document.getElementById('dbmOfferLauncher');
    if (L) { L.querySelector('.cnt').textContent = n; L.classList.toggle('show', n > 0); }
    var bar = document.getElementById('dbmOfferBar');
    if (bar) { bar.querySelector('.cnt').textContent = '(' + n + ')'; bar.classList.toggle('show', n > 0); }
    // podświetl przyciski „Dodaj do oferty" które już są w ofercie
    var items = load();
    document.querySelectorAll('[data-offer-add],.pe-dodaj').forEach(function (btn) {
      var u = btn.getAttribute('data-url') || btn._dbmUrl || '';
      if (u) btn.classList.toggle('added', items.some(function (i) { return i.url === u; }));
    });
  }

  function render() {
    ensureUI();
    var items = load(), n = items.length;
    syncCounts();
    var body = document.getElementById('dbmOpBody'), foot = document.getElementById('dbmOpFoot');
    if (!n) { body.innerHTML = '<div class="dbm-op-empty">' + esc(T.empty) + '</div>'; foot.innerHTML = ''; return; }
    body.innerHTML = items.map(function (i) {
      return '<div class="dbm-op-item" data-id="' + i.id + '">'
        + (i.img ? '<img src="' + esc(i.img) + '" alt="">' : '<div style="width:62px;height:62px;background:#000;border-radius:6px"></div>')
        + '<div><div class="nm">' + esc(i.name) + '</div>'
        + '<div class="pr">' + esc(i.prod) + (i.wariant ? (' · ' + esc(i.wariant)) : '') + '</div>'
        + '<input class="note" type="text" value="' + esc(i.note || '') + '" placeholder="' + esc(T.itemNotePh) + '" data-f="note">'
        + '<div class="dbm-op-qty"><button type="button" data-act="dec" aria-label="mniej">−</button><b>' + (i.qty || 1) + '</b><button type="button" data-act="inc" aria-label="więcej">+</button></div>'
        + '</div>'
        + '<button class="rm" type="button" aria-label="usuń">×</button></div>';
    }).join('');
    body.querySelectorAll('.dbm-op-item').forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.querySelector('.rm').onclick = function () { rm(id); };
      el.querySelector('[data-act="inc"]').onclick = function () { qtyStep(id, 1); };
      el.querySelector('[data-act="dec"]').onclick = function () { qtyStep(id, -1); };
      el.querySelector('.note').oninput = function (e) { upd(id, 'note', e.target.value); };
    });
    // formularz (pola z PLANu; teksty UX = TEKST_BETI_x)
    var ophone = (window.DBM_CONFIG && window.DBM_CONFIG.OFFER_PHONE) || CFG.OFFER_PHONE || ''; // render-time: config bywa ładowany po offer.js
    foot.innerHTML = '<p class="dbm-op-hint" style="text-align:left;margin:0 0 12px">' + esc(T.formSub) + '</p>'
      + '<form id="dbmOfferForm" novalidate>'
      + '<div class="dbm-of-field"><label>' + esc(T.lFirma) + ' *</label><input name="firma" type="text" autocomplete="organization"></div>'
      + '<div class="dbm-of-field"><label>' + esc(T.lOsoba) + ' *</label><input name="osoba" type="text" autocomplete="name"></div>'
      + '<div class="dbm-of-row">'
      + '<div class="dbm-of-field"><label>' + esc(T.lEmail) + ' *</label><input name="email" type="email" autocomplete="email"></div>'
      + '<div class="dbm-of-field"><label>' + esc(T.lPhone) + '</label><input name="phone" type="tel" autocomplete="tel"></div>'
      + '</div>'
      + '<div class="dbm-of-field"><label>' + esc(T.lZakres) + '</label><input name="size" type="text"></div>'
      + '<div class="dbm-of-field"><label>' + esc(T.lUwagi) + '</label><textarea name="message" rows="2" placeholder="' + esc(T.notePh) + '"></textarea></div>'
      + '<label class="dbm-of-rodo"><input type="checkbox" name="rodo"><span>' + esc(T.rodo).replace('Polityce prywatności', '<a href="' + esc(politykaHref()) + '" target="_blank" rel="noopener">Polityce prywatności</a>') + ' *</span></label>'
      + '<div class="dbm-of-field dbm-of-hp" aria-hidden="true"><label>Website</label><input type="text" name="website" tabindex="-1" autocomplete="off"></div>'
      + '<div id="dbmOfferMsg"></div>'
      + '<button class="dbm-op-send" type="submit">' + esc(T.send) + ' (' + n + ')</button>'
      + '<button class="dbm-op-clr" type="button">' + esc(T.clear) + '</button>'
      + '<p class="dbm-op-hint">' + esc(T.priceHint) + (ophone ? ' · ' + esc(ophone) : '') + '</p>'
      + '</form>';
    foot.querySelector('.dbm-op-clr').onclick = function () { if (confirm(T.clear + '?')) clear(); };
    foot.querySelector('#dbmOfferForm').addEventListener('submit', onSubmit);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ——— WYSYŁKA → kontakt.php (source=koszyk, items_json). NIE mailto. ———
  function onSubmit(e) {
    e.preventDefault();
    var form = e.target, f = form.elements;
    var msg = document.getElementById('dbmOfferMsg');
    function show(cls, txt) { msg.className = 'dbm-op-msg ' + cls; msg.textContent = txt; }
    var email = (f.email.value || '').trim(), phone = (f.phone.value || '').trim();
    var emailOk = email && /.+@.+\..+/.test(email);                    // e-mail OBOWIĄZKOWY (decyzja Dario 19.10)
    var phoneOk = !phone || phone.replace(/\D/g, '').length >= 7;       // telefon OPCJONALNY: pusty OK, format tylko gdy wpisany
    if (!f.firma.value.trim() || !f.osoba.value.trim() || !emailOk || !f.rodo.checked) { show('err', T.errFill); return; }
    if (!phoneOk) { show('err', T.errPhone); return; }

    var items = load().map(function (i) {
      return { producent: i.prod, model: i.name, wariant: i.wariant || '', ilosc: i.qty || 1, uwagi: i.note || '', url: i.url };
    });
    var fd = new FormData();
    fd.append('source', 'koszyk');
    fd.append('firma', f.firma.value.trim());
    fd.append('name', f.osoba.value.trim());
    fd.append('email', email);
    fd.append('phone', phone);
    fd.append('size', (f.size.value || '').trim());
    fd.append('message', (f.message.value || '').trim());
    fd.append('rodo', f.rodo.checked ? 'on' : '');
    fd.append('website', f.website.value || '');          // honeypot
    fd.append('items_json', JSON.stringify(items));

    var btn = form.querySelector('.dbm-op-send'); btn.disabled = true; show('', T.sending);
    fetch(kontaktAction(), { method: 'POST', body: fd, redirect: 'follow' })
      .then(function (res) {
        var url = res.url || '';
        var okResp = res.ok && !/error=1/i.test(url);   // podziekowanie.html / 200 = ok; ?error=1 = błąd
        if (okResp) {
          ev('offer_submit', { liczba_pozycji: items.length });
          persist([]); syncCounts();                     // czyścimy koszyk BEZ re-renderu formularza (sukces zostaje widoczny)
          var body = document.getElementById('dbmOpBody'), foot = document.getElementById('dbmOpFoot');
          if (foot) foot.innerHTML = '';
          if (body) body.innerHTML = '<div class="dbm-op-empty dbm-op-done">' + esc(T.success) + '</div>';
        } else { show('err', T.errSend); btn.disabled = false; }
      })
      .catch(function () { show('err', T.errSend); btn.disabled = false; });
  }

  // ——— przyciski „Dodaj do oferty" ———
  // 1) [data-offer-add] (huby/asystent) — czyta atrybuty data-*.
  // 2) .pe-dodaj (karty) — jeśli silnik NIE podpiął DBMOffer (data-dbm-wired), podpinamy sami,
  //    czytając window.PRODUCT_DATA + window.DB_WYBOR + canonical + .pe-main img (wierne na podglądzie z zamrożonym silnikiem).
  function cardPayload() {
    var pd = window.PRODUCT_DATA || {}, w = window.DB_WYBOR || {};
    var canon = (document.querySelector('link[rel="canonical"]') || {}).href || (typeof location !== 'undefined' ? location.href : '');
    var imgEl = document.querySelector('.pe-main img');
    return {
      name: pd.h1 || pd.kolekcja || '', prod: pd.producent || '',
      cat: (pd.kategoria && pd.kategoria.nazwa_kategorii) || '',
      wariant: w.wariant || '', url: canon, img: imgEl ? imgEl.getAttribute('src') : ''
    };
  }
  function bind() {
    document.querySelectorAll('[data-offer-add]').forEach(function (btn) {
      if (btn._dbm) return; btn._dbm = 1; btn._dbmUrl = btn.getAttribute('data-url') || '';
      btn.addEventListener('click', function (e) { e.preventDefault(); add({ name: btn.getAttribute('data-name'), prod: btn.getAttribute('data-prod'), cat: btn.getAttribute('data-cat'), wariant: btn.getAttribute('data-wariant') || '', url: btn.getAttribute('data-url'), img: btn.getAttribute('data-img') }); });
    });
    document.querySelectorAll('.pe-dodaj').forEach(function (btn) {
      if (btn._dbm || btn.getAttribute('data-dbm-wired') === '1') return;   // silnik już podpiął → nie dubluj
      btn._dbm = 1;
      btn.onclick = function (e) { if (e) e.preventDefault(); var p = cardPayload(); btn._dbmUrl = p.url; add(p); };
    });
  }

  function init() {
    migrate(); ensureUI(); bind(); render();
    // asystent AI dodaje przez to samo API (PLAN §5)
    try { if (window.__dbmPending && window.__dbmPending.length) { window.__dbmPending.forEach(add); window.__dbmPending = []; } } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.DBMOffer = { add: add, open: openPanel, clear: clear, count: count };
})();
