/* ===== DB NEW · Asystent DEMO (T2) =====
   Skryptowe demo rozmowy — BEZ API, BEZ kluczy, BEZ backendu.
   Teksty rozmowy 1:1 z bloku BETI. Nazwy modeli = realne karty etap3.
   WhatsApp: numer wzięty z tel:+48506147435 obecnego w kodzie karty-bazy
   (na bazie NIE ma osobnego przycisku WhatsApp). */
(function(){
  'use strict';
  var TEL='+48506147435', WA='https://wa.me/48506147435';
  var MODELS=[
    {name:'Krzesło obrotowe Xenon Profim', img:'../xenon/assets/profim-xenon-10-1.webp',          href:'../xenon/'},
    {name:'Stoły Revo Profim',             img:'../revo-stoly-konf/assets/profim-revo-t150-1.webp', href:'../revo-stoly-konf/'},
    {name:'Paralel MDD — fotel konferencyjny', img:'../mdd-paralel/assets/mdd-paralel-pr1p19.webp', href:'../mdd-paralel/'}
  ];
  var choice={osoby:'', zakres:'', kontakt:''}, built=false;

  function el(t,c,h){var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e;}

  var root=document.getElementById('db-asystent');
  if(!root){root=el('div'); root.id='db-asystent'; document.body.appendChild(root);}
  root.setAttribute('data-state','closed');

  /* --- launcher --- */
  var launcher=el('button','dba-launcher','<span class="dba-dot"></span><span class="dba-label">Zapytaj asystenta</span>');
  launcher.setAttribute('aria-label','Otwórz asystenta DB Meble');
  var bubble=el('div','dba-bubble','Pomogę dobrać meble do biura. <b>Zapytać?</b>');
  var minbar=el('button','dba-minbar','<span class="dba-dot"></span><span>Asystent DB Meble · 1 nowa wiadomość</span>');
  minbar.setAttribute('aria-label','Rozwiń asystenta DB Meble');

  /* --- panel czatu --- */
  var panel=el('div','dba-panel'); panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Asystent DB Meble'); panel.setAttribute('aria-modal','false');
  var head=el('div','dba-head',
    '<div class="dba-ava" aria-hidden="true">DB</div>'+
    '<div class="dba-htxt"><div class="dba-ttl">Asystent DB Meble</div>'+
    '<div class="dba-sub">Dobiera z naszego katalogu</div></div>'+
    '<button class="dba-min" type="button" aria-label="Minimalizuj">–</button>'+
    '<button class="dba-close" type="button" aria-label="Zamknij">×</button>');
  var body=el('div','dba-body');
  var foot=el('div','dba-foot','Rozmowę przekazujemy doradcy DB Meble · Polityka prywatności');
  panel.appendChild(head); panel.appendChild(body); panel.appendChild(foot);

  /* --- pasek mobilny --- */
  var mbar=el('nav','dba-mobilebar');
  mbar.setAttribute('aria-label','Kontakt DB Meble');
  var mCall=el('a',null,'<span class="dba-ic" aria-hidden="true">☎</span>Zadzwoń'); mCall.href='tel:'+TEL; mCall.setAttribute('aria-label','Zadzwoń '+TEL);
  var mAsk=el('button',null,'<span class="dba-ic" aria-hidden="true">💬</span>Asystent'); mAsk.type='button'; mAsk.setAttribute('aria-label','Otwórz asystenta');
  var mWa=el('a',null,'<span class="dba-ic" aria-hidden="true">✆</span>WhatsApp'); mWa.href=WA; mWa.target='_blank'; mWa.rel='noopener'; mWa.setAttribute('aria-label','Napisz na WhatsApp');
  mbar.appendChild(mCall); mbar.appendChild(mAsk); mbar.appendChild(mWa);

  root.appendChild(launcher); root.appendChild(bubble); root.appendChild(minbar); root.appendChild(panel); root.appendChild(mbar);

  /* --- pomocnicze --- */
  function scrollBot(){body.scrollTop=body.scrollHeight;}
  function addBot(text){var m=el('div','dba-msg bot',text); body.appendChild(m); scrollBot(); return m;}
  function addUser(text){var m=el('div','dba-msg user'); m.textContent=text; body.appendChild(m); scrollBot(); return m;}

  function chips(opts,cb){
    var wrap=el('div','dba-chips');
    opts.forEach(function(o){
      var b=el('button','dba-chip'); b.type='button'; b.textContent=o;
      b.addEventListener('click',function(){ wrap.remove(); addUser(o); cb(o); });
      wrap.appendChild(b);
    });
    body.appendChild(wrap); scrollBot();
  }

  /* --- kroki rozmowy (teksty 1:1) --- */
  function step1(){
    addBot('Dzień dobry. Pomogę dobrać meble do biura. Ile osób będzie w nim pracować?');
    chips(['1–10','11–50','51–100','100+'],function(v){ choice.osoby=v; setTimeout(step2,260); });
  }
  function step2(){
    addBot('Co urządzamy?');
    chips(['Stanowiska pracy','Sala konferencyjna','Strefa cicha','Recepcja'],function(v){ choice.zakres=v; setTimeout(step3,260); });
  }
  function step3(){
    addBot('Na start proponuję te trzy modele z naszej oferty:');
    var cards=el('div','dba-cards');
    MODELS.forEach(function(m){
      var a=el('a','dba-card'); a.href=m.href;
      var im=el('img'); im.src=m.img; im.alt=m.name; im.loading='lazy';
      var nm=el('div','dba-cname'); nm.textContent=m.name;
      var lk=el('span','dba-clink'); lk.textContent='Zobacz →';
      a.appendChild(im); a.appendChild(nm); a.appendChild(lk);
      cards.appendChild(a);
    });
    body.appendChild(cards); scrollBot();
    setTimeout(step4,420);
  }
  function step4(){
    addBot('Przygotujemy ofertę w 3 budżetach. Gdzie ją wysłać?');
    var f=el('div','dba-field');
    var inp=el('input'); inp.type='text'; inp.placeholder='E-mail lub telefon…'; inp.setAttribute('aria-label','E-mail lub telefon');
    var snd=el('button','dba-send'); snd.type='button'; snd.textContent='Wyślij'; snd.setAttribute('aria-label','Zatwierdź kontakt');
    function go(){ var v=inp.value.trim(); if(!v)return; choice.kontakt=v; f.remove(); addUser(v); setTimeout(step5,260); }
    snd.addEventListener('click',go);
    inp.addEventListener('keydown',function(e){ if(e.key==='Enter')go(); });
    f.appendChild(inp); f.appendChild(snd); body.appendChild(f); scrollBot(); inp.focus();
  }
  function step5(){
    addBot('Przygotowałem szkic wiadomości do doradcy:');
    var names=MODELS.map(function(m){return m.name;}).join(', ');
    var tresc='Dzień dobry, proszę o ofertę na meble do biura dla '+choice.osoby+' osób. '+
              'Zakres: '+choice.zakres+'. Interesują mnie modele: '+names+'. '+
              'Proszę o kontakt: '+choice.kontakt+'.';
    var mail=el('div','dba-mail');
    var r1=el('div','dba-mail-row'); r1.innerHTML='<span class="dba-mail-k">Temat</span>'; r1.appendChild(document.createTextNode('Zapytanie o meble do biura'));
    var r2=el('div','dba-mail-row'); r2.innerHTML='<span class="dba-mail-k">Treść</span>'; r2.appendChild(document.createTextNode(tresc));
    mail.appendChild(r1); mail.appendChild(r2); body.appendChild(mail);
    var act=el('div','dba-mail-actions');
    var send=el('button','dba-primary'); send.type='button'; send.textContent='Wyślij do DB Meble';
    var edit=el('button','dba-ghost'); edit.type='button'; edit.textContent='Popraw';
    send.addEventListener('click',function(){ act.remove(); addBot('Dziękujemy. Doradca DB Meble odpowie w ciągu jednego dnia roboczego.'); });
    edit.addEventListener('click',function(){ act.remove(); mail.remove(); setTimeout(step4,120); });
    act.appendChild(send); act.appendChild(edit); body.appendChild(act); scrollBot();
  }

  /* --- sterowanie stanem --- */
  function open(){
    root.setAttribute('data-state','open');
    bubble.classList.remove('show');
    if(!built){ built=true; step1(); }
    scrollBot();
    var fb=panel.querySelector('button'); if(fb)fb.focus();
  }
  function minimize(){ root.setAttribute('data-state','min'); }
  function close(){ root.setAttribute('data-state','closed'); launcher.focus&&launcher.focus(); }

  launcher.addEventListener('click',open);
  minbar.addEventListener('click',open);
  mAsk.addEventListener('click',open);
  bubble.querySelector('b').addEventListener('click',open);
  head.querySelector('.dba-min').addEventListener('click',minimize);
  head.querySelector('.dba-close').addEventListener('click',close);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && root.getAttribute('data-state')==='open') close(); });

  /* --- animacje wejścia (prefers-reduced-motion respektowane w CSS) --- */
  setTimeout(function(){ launcher.classList.add('in'); }, 2000);
  setTimeout(function(){ if(root.getAttribute('data-state')==='closed') bubble.classList.add('show'); }, 8000);

  /* --- launcher: scroll w dół = kółko, w górę = pigułka --- */
  var lastY=window.pageYOffset;
  window.addEventListener('scroll',function(){
    var y=window.pageYOffset;
    if(y>lastY+6 && y>120) launcher.classList.add('mini');
    else if(y<lastY-6) launcher.classList.remove('mini');
    lastY=y;
  },{passive:true});

  /* --- Przycisk B: "Zapytaj asystenta o ten model" pod "Wyślij zapytanie" --- */
  function injectAskBtn(){
    if(document.getElementById('dba-ask-model')) return;
    var cta=document.querySelector('.pe-wycena') ||
      Array.prototype.find.call(document.querySelectorAll('a,button'),function(n){return /Wyślij zapytanie/.test(n.textContent||'');});
    if(!cta) return;
    var b=el('button','pe-btn ghost','Zapytaj asystenta o ten model');
    b.id='dba-ask-model'; b.type='button'; b.setAttribute('aria-label','Zapytaj asystenta o ten model');
    b.addEventListener('click',open);
    cta.parentNode.insertBefore(b, cta.nextSibling);
  }
  injectAskBtn();
  [150,600,2600].forEach(function(t){ setTimeout(injectAskBtn,t); });
})();
