/* DB Meble — cookie-consent.js
   Consent Mode v2 (default=denied) + GA4 (G-T68TM6H9F5) + GTM (GTM-THCCTTGB) + Microsoft Clarity (y3mxs3aheq, dopiero PO zgodzie) + generate_lead (form_id: kontakt|wycena) + banner RODO.
   Samodzielny (styl hardcoded kolorami marki — niezależny od zmiennych CSS strony).
   JEDEN kanoniczny baner na CAŁYM serwisie (2026-08-04, T2): home i karty produktów też przez ten plik
   (usunięto inline baner z home i cookie-banner.js z kart). Klucz dbm_consent = granted/denied (jeden słownik).
   Użycie: <script src="{prefix}cookie-consent.js" data-policy="{prefix}polityka-prywatnosci.html"></script>
   Uwaga: NIE ładować razem z inline'owym bannerem/GTM (podwójny GTM). */
(function () {
  "use strict";
  var CS = document.currentScript;
  var POLICY = (CS && CS.getAttribute("data-policy")) || "polityka-prywatnosci.html";
  var COOKIES = POLICY.replace(/[^\/]*$/, "cookies.html");
  if (window.__dbmCookieInit) return; window.__dbmCookieInit = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Microsoft Clarity — laduje sie TYLKO po zgodzie (nagrywa sesje = dane osobowe; brak wsparcia Consent Mode).
  var __clarityLoaded = false;
  function loadClarity() {
    if (__clarityLoaded) return; __clarityLoaded = true;
    (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(window, document, "clarity", "script", "y3mxs3aheq");
  }

  // 1) Consent Mode v2 — default denied (EU) PRZED GTM
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", functionality_storage: "granted", security_storage: "granted",
    wait_for_update: 500
  });
  var prior = null; try { prior = localStorage.getItem("dbm_consent"); } catch (e) {}
  if (prior === "granted") { gtag("consent", "update", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }); loadClarity(); }

  // 2) GA4 + GTM
  var ga = document.createElement("script"); ga.async = true; ga.src = "https://www.googletagmanager.com/gtag/js?id=G-T68TM6H9F5";
  (document.head || document.documentElement).appendChild(ga);
  gtag("js", new Date()); gtag("config", "G-T68TM6H9F5", { anonymize_ip: true });
  (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" }); var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != "dataLayer" ? "&l=" + l : ""; j.async = true; j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl; f.parentNode.insertBefore(j, f); })(window, document, "script", "dataLayer", "GTM-THCCTTGB");

  // 3) Banner UI (RODO) — pokaż gdy brak decyzji lub decyzja > 365 dni
  function save(level) {
    try { localStorage.setItem("dbm_consent", level); localStorage.setItem("dbm_consent_date", new Date().toISOString()); } catch (e) {}
    if (level === "granted") { gtag("consent", "update", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }); loadClarity(); }
    else gtag("consent", "update", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
    var b = document.getElementById("dbmCookieBanner"); if (b) b.classList.remove("is-visible");
  }
  function build() {
    if (document.getElementById("dbmCookieBanner")) return;
    var css = ".dbm-cookie{position:fixed;left:14px;right:14px;bottom:14px;z-index:2147483000;background:#1A1A1E;border:1px solid #C9A24B;border-top-width:2px;border-radius:4px;padding:20px 24px;display:none;align-items:center;justify-content:space-between;gap:24px;box-shadow:0 30px 80px -30px rgba(0,0,0,.7);flex-wrap:wrap;font-family:'DM Sans',system-ui,-apple-system,sans-serif}"
      + ".dbm-cookie.is-visible{display:flex}"
      + ".dbm-cookie p{font-size:13px;line-height:1.55;color:rgba(240,230,211,.82);max-width:62ch;margin:0;flex:1 1 280px}"
      + ".dbm-cookie p strong{color:#F0E6D3;font-weight:600}.dbm-cookie a{color:#C9A24B}"
      + ".dbm-cookie-actions{display:flex;gap:10px;flex-wrap:wrap}"
      + ".dbm-cookie button{appearance:none;cursor:pointer;font-family:inherit;font-size:11px;letter-spacing:.22em;text-transform:uppercase;padding:12px 22px;border-radius:2px;border:1px solid #C9A24B;color:#C9A24B;background:transparent;transition:background .25s,color .25s}"
      + ".dbm-cookie button:hover{background:#C9A24B;color:#1A1A1E}"
      + ".dbm-cookie button.primary{background:#C9A24B;color:#1A1A1E;font-weight:600}"
      + "@media(min-width:780px){.dbm-cookie{left:32px;right:auto;max-width:680px;bottom:32px}}";
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var b = document.createElement("div"); b.className = "dbm-cookie"; b.id = "dbmCookieBanner";
    b.setAttribute("role", "dialog"); b.setAttribute("aria-label", "Zgoda na cookies");
    b.innerHTML = '<p><strong>Cookies.</strong> Używamy cookies do analizy ruchu (Google Analytics 4) i remarketingu (Google Ads). Szczegóły w <a href="' + POLICY + '">polityce prywatności</a> i <a href="' + COOKIES + '">polityce cookies</a>. Wybór mogą Państwo zmienić w każdej chwili.</p>'
      + '<div class="dbm-cookie-actions"><button type="button" id="dbmCookieEss">Tylko niezbędne</button><button type="button" id="dbmCookieAll">Akceptuję wszystkie</button></div>';
    document.body.appendChild(b);
    document.getElementById("dbmCookieAll").addEventListener("click", function () { save("granted"); });
    document.getElementById("dbmCookieEss").addEventListener("click", function () { save("denied"); });
    var show = false;
    try { var c = localStorage.getItem("dbm_consent"), d = localStorage.getItem("dbm_consent_date"); if (!c) show = true; else if (d && (Date.now() - new Date(d).getTime()) / 864e5 > 365) show = true; } catch (e) { show = true; }
    if (show) setTimeout(function () { b.classList.add("is-visible"); }, 800);
  }
  // 4) generate_lead — TYLKO po potwierdzonej wysylce. kontakt.php przy sukcesie robi 303 -> podziekowanie.html;
  //    blad walidacji/wysylki -> ./?error=1 (NIE dochodzi tu). Rozroznienie: form_id kontakt|wycena.
  function leadInit() {
    var MAP = { agentForm: "wycena", contactForm: "kontakt" };
    Object.keys(MAP).forEach(function (fid) {
      var f = document.getElementById(fid);
      if (f) f.addEventListener("submit", function () {
        // submit odpala sie dopiero PO natywnej walidacji HTML5 (required/minlength) = intencja realnej wysylki
        try { sessionStorage.setItem("dbm_lead_pending", JSON.stringify({ id: MAP[fid], t: Date.now() })); } catch (e) {}
      });
    });
    if (/(^|\/)podziekowanie\.html$/.test(location.pathname)) {
      var raw = null; try { raw = sessionStorage.getItem("dbm_lead_pending"); } catch (e) {}
      if (raw) {
        var d = null; try { d = JSON.parse(raw); } catch (e) {}
        if (d && d.id && (Date.now() - (d.t || 0)) < 600000) gtag("event", "generate_lead", { form_id: d.id });
        try { sessionStorage.removeItem("dbm_lead_pending"); } catch (e) {}
      }
    }
  }

  function boot() { build(); leadInit(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
