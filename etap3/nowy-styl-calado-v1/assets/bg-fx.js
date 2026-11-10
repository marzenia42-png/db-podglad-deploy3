/* bg-fx.js (03.07 preview) — świetliki tła dla WARIANTU B (?bg=b). Wariant A = sam gradient CSS (ten skrypt nic nie robi).
   Wydajność: init po onload (nie blokuje LCP), RAF, pauza gdy tab nieaktywny, prefers-reduced-motion -> off. z-index:-1 (pod treścią). */
(function () {
  "use strict";
  try {
    var bg = new URLSearchParams(location.search).get("bg");
    if (bg !== "b") return;                                   // tylko wariant B
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch (e) { return; }

  function init() {
    if (window.__dbmFireflies) return; window.__dbmFireflies = 1;
    var c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none";
    document.body.appendChild(c);
    var ctx = c.getContext("2d"), pts = [], W = 0, H = 0, raf = 0, running = true, dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      W = c.width = Math.floor(innerWidth * dpr); H = c.height = Math.floor(innerHeight * dpr);
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    }
    resize(); addEventListener("resize", resize);
    var N = Math.min(100, Math.max(60, Math.round(innerWidth / 16)));  // 60-100 punktów (x2)
    for (var i = 0; i < N; i++) pts.push({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 4.8 + 2.1) * dpr,                            // rozmiar x2 (gwiazdy)
      vx: (Math.random() - 0.5) * 0.234 * dpr, vy: (Math.random() - 0.5) * 0.234 * dpr,  // dryf +30%
      o: Math.random() * 0.3 + 0.7, ph: Math.random() * 6.28                  // opacity 0.7-1.0 (pełna)
    });
    function draw(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i];
        q.x += q.vx; q.y += q.vy;
        if (q.x < 0) q.x = W; else if (q.x > W) q.x = 0;
        if (q.y < 0) q.y = H; else if (q.y > H) q.y = 0;
        var tw = q.o * (0.6 + 0.4 * Math.sin(t / 1400 + q.ph));            // wolne migotanie
        ctx.beginPath();
        ctx.fillStyle = "rgba(212,184,124," + tw.toFixed(3) + ")";        // złoto rozjaśnione (gwiazda)
        ctx.shadowColor = "rgba(200,169,106,.9)"; ctx.shadowBlur = 14 * dpr;   // glow mocny
        ctx.arc(q.x, q.y, q.r, 0, 6.2832); ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", function () {          // pauza gdy tab nieaktywny
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; raf = requestAnimationFrame(draw); }
    });
  }
  if (document.readyState === "complete") init();
  else addEventListener("load", init);                                   // po onload = nie blokuje LCP
})();
