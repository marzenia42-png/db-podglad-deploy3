/* product-list.js — filtrowalny katalog (P1 cross-listing + P5 search + P8 liczniki).
   Czyta /products-index.json. FAZA 5.1: filtr AKORDEON (zwinięty domyślnie, klik rozwija — exclusive), mobile-first.
   Sekcje: szukajka (Nazwa, zawsze widoczna) + Producent / Kategoria / Rodzaj krzesła (archetyp). Deep-link ?kategoria=&archetyp=&producent=&q=&k=. */
(function () {
  "use strict";
  var root = document.getElementById("katalog");
  if (!root) return;
  var PROD = (root.getAttribute("data-producent") || "").toLowerCase(); // np. "profim" — pusty = wszyscy
  var IMG = root.getAttribute("data-imgbase") || "/images/";
  var BASE = IMG.replace(/images\/$/, ""); // prefix do /new/ root — linki kart MUSZA zostac wewnatrz /new/
  var IDX = root.getAttribute("data-index") || "/products-index.json";
  // T2 15.10 (BETI fala1): karty w kategorie[] ale 404 na live -> nie renderuj kafla (kategorie[] zostaje w repo). curl live 15.10; usun gdy wdrozone.
  var NONLIVE = { "mdd-clip": 1, "mdd-mono": 1, "mdd-ramo": 1, "profim-lunea": 1 };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  // humanizacja etykiety typu: slug ("szafka-skrytkowa") -> "Szafka skrytkowa". Nazwy juz ludzkie (wielka litera lub spacja) zostaja. Lustro ARCH_LABEL z _build_mirror (SSR), zeby JS == SSR.
  var human = function (s) { s = String(s == null ? "" : s); return /[A-ZŁŚŻŹĆŃÓĄĘ ]/.test(s) ? s : s.split("-").map(function (w, i) { return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w; }).join(" "); };
  var qp = new URLSearchParams(location.search);
  var A = function (n) { return (root.getAttribute(n) || ""); };
  var KATLOCK = A("data-kategoria"); // strona /kategorie/<slug>/: kategoria = scope strony (nie facet). DATA filtrowana na starcie; "Wyczyść" wraca do tej kategorii, nie do całości.
  var RODZAJ = A("data-rodzaj-label") || "Rodzaj"; // etykieta filtra archetypu z definicji kategorii (fallback neutralne "Rodzaj"); NIGDY zahardkodowane "Rodzaj krzesła" na nie-krzeslach.
  var state = { producent: qp.get("producent") || "", kategoria: qp.get("kategoria") || "", segment: qp.get("segment") || "", archetyp: qp.get("archetyp") || A("data-archetyp"), q: (qp.get("q") || "").toLowerCase(), base: qp.get("k") || "", openAcc: "" };
  var DATA = [];

  function uniq(arr) { var s = {}, o = []; arr.forEach(function (x) { if (x && !s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function matches(p, ignore) {
    if (state.base && p.base !== state.base) return false;
    if (state.producent && ignore !== "producent" && (p.producent || "") !== state.producent) return false;
    if (state.kategoria && ignore !== "kategoria" && p.kategorie.indexOf(state.kategoria) < 0) return false;
    if (state.segment && ignore !== "segment" && p.segmenty.indexOf(state.segment) < 0) return false;
    if (state.archetyp && ignore !== "archetyp" && p.archetyp !== state.archetyp) return false;
    if (state.q && ignore !== "q") { var hay = (p.kolekcja + " " + p.archetypLabel + " " + p.kategorieLabel.join(" ") + " " + p.opis).toLowerCase(); if (hay.indexOf(state.q) < 0) return false; }
    return true;
  }
  function chip(dim, val, label) {
    var n = DATA.filter(function (p) {
      var ok = matches(p, dim);
      if (dim === "kategoria") return ok && p.kategorie.indexOf(val) >= 0;
      if (dim === "segment") return ok && p.segmenty.indexOf(val) >= 0;
      if (dim === "archetyp") return ok && p.archetyp === val;
      if (dim === "producent") return ok && (p.producent || "") === val;
      return ok;
    }).length;
    var active = state[dim] === val;
    return '<button class="kl-chip' + (active ? " active" : "") + '" data-dim="' + dim + '" data-val="' + esc(val) + '">' + esc(label) + ' <span class="kl-n">' + n + "</span></button>";
  }
  // liczba aktywnych filtrów w wymiarze (do znacznika na summary)
  function activeMark(dim) { return state[dim] ? ' <span class="kl-acc-dot" aria-hidden="true">●</span>' : ""; }

  function acc(id, label, inner) {
    return '<details class="kl-acc" data-acc="' + id + '"' + (state.openAcc === id ? " open" : "") + '><summary>' + esc(label) + activeMark(id) + '</summary><div class="kl-chips">' + inner + "</div></details>";
  }

  function render() {
    var cats = [], arch = [], prods = [];
    DATA.forEach(function (p) { p.kategorie.forEach(function (k, i) { cats.push([k, p.kategorieLabel[i]]); }); arch.push([p.archetyp, p.archetypLabel]); prods.push([(p.producent || ""), (p.producent || "")]); });
    var ukey = function (a) { var m = {}, o = []; a.forEach(function (x) { if (x[0] && !m[x[0]]) { m[x[0]] = 1; o.push(x); } }); return o; };
    var catChips = ukey(cats).map(function (x) { return chip("kategoria", x[0], x[1]); }).join("");
    var archChips = ukey(arch).map(function (x) { return chip("archetyp", x[0], x[1]); }).join("");
    var prodList = ukey(prods);
    var prodChips = prodList.map(function (x) { var lab = x[1].charAt(0).toUpperCase() + x[1].slice(1); return chip("producent", x[0], lab); }).join("");

    var list = DATA.filter(function (p) { return matches(p); });
    var grid = list.map(function (p) {
      var badges = p.segmentyLabel.map(function (s) { return '<span class="kl-badge">' + esc(s) + "</span>"; }).join("");
      return '<a class="kl-card" href="' + esc(BASE + p.url.replace(/^\//, "")) + '">' +
        '<div class="kl-thumb">' + (p.thumb ? '<img loading="lazy" src="' + IMG + esc(p.thumb) + '" alt="' + esc(p.kolekcja) + '">' : "") + "</div>" +
        '<div class="kl-body"><div class="kl-arch">' + esc(p.archetypLabel) + (badges ? " " + badges : "") + "</div>" +
        '<div class="kl-title">' + esc(p.kolekcja) + "</div>" +
        (p.opis ? '<div class="kl-desc">' + esc(p.opis) + "</div>" : "") +
        '<div class="kl-meta">' + esc(p.producent) + " · " + p.nWar + " war.</div></div></a>";
    }).join("");

    root.innerHTML =
      '<div class="kl-filters">' +
      '<input class="kl-search" type="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Szukaj po nazwie kolekcji…" value="' + esc(state.q) + '" aria-label="Szukaj kolekcji">' +
      '<div class="kl-acc-wrap">' +
      (prodList.length > 1 ? acc("producent", "Producent", '<button class="kl-chip' + (!state.producent ? " active" : "") + '" data-dim="producent" data-val="">Wszyscy</button>' + prodChips) : "") +
      (KATLOCK ? "" : acc("kategoria", "Kategoria", '<button class="kl-chip' + (!state.kategoria ? " active" : "") + '" data-dim="kategoria" data-val="">Wszystkie</button>' + catChips)) +
      acc("archetyp", RODZAJ, '<button class="kl-chip' + (!state.archetyp ? " active" : "") + '" data-dim="archetyp" data-val="">Wszystkie</button>' + archChips) +
      "</div>" +
      ((state.producent || state.kategoria || state.archetyp || state.q) ? '<button class="kl-clear" type="button">✕ Wyczyść filtry</button>' : "") +
      "</div>" +
      '<div class="kl-count">' + list.length + " produkt" + (list.length === 1 ? "" : (list.length % 10 >= 2 && list.length % 10 <= 4 && (list.length < 12 || list.length > 14) ? "y" : "ów")) + "</div>" +
      '<div class="kl-grid">' + (grid || '<div class="kl-empty">Brak produktów dla wybranych filtrów.<br><button class="kl-clear" type="button">✕ Wyczyść filtry</button></div>') + "</div>";

    root.querySelectorAll(".kl-chip").forEach(function (b) { b.onclick = function () { var dim = b.dataset.dim; state[dim] = (state[dim] === b.dataset.val) ? "" : b.dataset.val; sync(); render(); }; });
    root.querySelectorAll(".kl-clear").forEach(function (clr) { clr.onclick = function () { state.producent = state.kategoria = state.segment = state.archetyp = ""; state.q = ""; sync(); render(); }; });
    // akordeon: klik rozwija tylko klikaną sekcję (exclusive), stan przetrwa re-render
    root.querySelectorAll(".kl-acc").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) { state.openAcc = d.dataset.acc; root.querySelectorAll(".kl-acc").forEach(function (o) { if (o !== d) o.open = false; }); }
        else if (state.openAcc === d.dataset.acc) { state.openAcc = ""; }
      });
    });
    var srch = root.querySelector(".kl-search"); if (srch) { srch.oninput = function () { state.q = srch.value.toLowerCase(); clearTimeout(srch._t); srch._t = setTimeout(function () { sync(); var pos = srch.selectionStart; render(); var s2 = root.querySelector(".kl-search"); if (s2) { s2.focus(); try { s2.setSelectionRange(pos, pos); } catch (e) {} } }, 220); }; }
  }
  function sync() {
    var p = new URLSearchParams();
    if (state.producent) p.set("producent", state.producent);
    if (state.kategoria) p.set("kategoria", state.kategoria);
    if (state.segment) p.set("segment", state.segment);
    if (state.archetyp) p.set("archetyp", state.archetyp);
    if (state.q) p.set("q", state.q);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
  }

  fetch(IDX + (IDX.indexOf("?") < 0 ? "?" : "&") + "v=" + Date.now()).then(function (r) { return r.json(); }).then(function (all) {
    DATA = all.filter(function (p) { return !NONLIVE[p.id] && (!PROD || (p.producent || "").toLowerCase() === PROD) && (!KATLOCK || p.kategorie.indexOf(KATLOCK) >= 0); });
    DATA.forEach(function (p) { p.archetypLabel = human(p.archetypLabel); }); // etykieta typu = nazwa ludzka (nie slug) — spojnie z SSR
    render();
  }).catch(function (e) { /* fetch nieudany (file:// / offline) -> ZOSTAW SSR (kategorie+produkty widoczne bez JS, dla Google i podglądu). NIE kasuj #katalog. */ });
})();
