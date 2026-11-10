# -*- coding: utf-8 -*-
"""LUNEA v2.3 — tylko B2/B4/B5. A/B1/B3 kopiowane z v2.2 bez zmian.
Zasada pkt 25: zero latania na polprzezroczystym scrimie; tekst = osobna warstwa na CZYSTEJ bazie
(B2: nieprzezroczysta wstazka; B4: nieprzezroczyste pasmo eyebrow + stopki; B5: solidny panel)."""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

V2  = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2\img"
V22 = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2.2\img"
OUT = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2.3\img"
FB  = r"E:\Dario\projekty\linkedin-banery\fonts"
SEG = r"C:\Windows\Fonts"
os.makedirs(OUT, exist_ok=True)
GREEN=(43,227,138); GREY=(151,153,156)

def seg(sz,sb=False): return ImageFont.truetype(os.path.join(SEG,"seguisb.ttf" if sb else "segoeui.ttf"),sz)
def mont(w,sz): return ImageFont.truetype(os.path.join(FB,f"Montserrat-{w}.ttf"),sz)
def load(src,n): return Image.open(os.path.join(src,n)).convert("RGB")
def save(img,n): img.convert("RGB").save(os.path.join(OUT,n),quality=95); print("OK",n)

def draw_tracked(d,xy,txt,font,fill,tr):
    x,y=xy
    for ch in txt:
        d.text((x,y),ch,font=font,fill=fill); x+=font.getlength(ch)+tr
    return x

def tracked_w(txt,font,tr):
    return sum(font.getlength(ch)+tr for ch in txt)-tr

def glow_text(base,xy,txt,font,fill=GREEN,rad=10,passes=2):
    lay=Image.new("RGBA",base.size,(0,0,0,0)); d=ImageDraw.Draw(lay)
    d.text(xy,txt,font=font,fill=fill+(255,))
    bl=lay.filter(ImageFilter.GaussianBlur(rad))
    for _ in range(passes): base.alpha_composite(bl)
    ImageDraw.Draw(base).text(xy,txt,font=font,fill=fill+(255,))

# ================= B2 (1080x1080) — wstazka spec nieprzezroczysta =================
def build_B2():
    im=load(V2,"B2.jpg").convert("RGBA")
    # 1) cien pod wstazka
    sh=Image.new("RGBA",im.size,(0,0,0,0)); ds=ImageDraw.Draw(sh)
    ds.rounded_rectangle([296,520,824,668],radius=30,fill=(0,0,0,150))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    # 2) wstazka OPAQUE (pelne krycie = zero sladu po baked clutter)
    d=ImageDraw.Draw(im)
    d.rounded_rectangle([300,524,820,664],radius=26,fill=(16,19,26,255),outline=(44,49,60,255),width=2)
    # 3) zielona linia wymiarowa z koncowkami + strzalki
    ly=628; lx0,lx1=342,778
    d.line([(lx0,ly),(lx1,ly)],fill=GREEN,width=6)
    for tx in (lx0,lx1):
        d.line([(tx,ly-13),(tx,ly+13)],fill=GREEN,width=6)
    for px,ang in [(lx1,0.0),(lx0,math.pi)]:
        h=16; a=ang
        d.polygon([(px,ly),(px-h*math.cos(a-0.5),ly-h*math.sin(a-0.5)),(px-h*math.cos(a+0.5),ly-h*math.sin(a+0.5))],fill=GREEN)
    # 4) dwie etykiety NAD linia, wyraznie rozsuniete (zero nachodzenia)
    f=mont("ExtraBold",42)
    for cx,txt in [(452,"640 mm"),(690,"+80 cm")]:
        w=f.getlength(txt); asc,desc=f.getmetrics()
        glow_text(im,(cx-w/2, 560),txt,f,GREEN,rad=9)
    # 5) male szare podpisy pod liczbami (zrodlo: factsheet U11 / zakres)
    sf=seg(20,sb=True)
    for cx,txt in [(452,"MODUŁ U11"),(690,"MAKS. ZAKRES")]:
        w=tracked_w(txt,sf,1.2); draw_tracked(d,(cx-w/2, 648),txt,sf,(150,156,166),1.2)
    save(im,"B2.png")

# ================= B4 (1080x1080) — pasmo eyebrow + stopka, bez latania =================
def build_B4():
    im=load(V2,"B4.jpg").convert("RGBA")
    d=ImageDraw.Draw(im)
    # --- EYEBROW: nieprzezroczyste pasmo gradientowe (feather dol w istniejacy scrim) + tekst od nowa ---
    bx0,bx1=0,1080; by0,by1=794,856
    band=Image.new("RGBA",(bx1-bx0,by1-by0),(0,0,0,0)); bd=ImageDraw.Draw(band)
    H=by1-by0
    for i in range(H):
        t=i/(H-1)
        # gradient dopasowany do ciemnego scrimu eyebrow (~30 neutral, lekko ciemniej ku dolowi)
        r=int(33+(22-33)*t); g=int(33+(22-33)*t); b=int(36+(26-36)*t)
        # alfa: pelne krycie w srodku pasma, feather na gorze i dole by zlac sie ze scrimem
        if t<0.24: a=int(255*(t/0.24))
        elif t>0.80: a=int(255*(1-(t-0.80)/0.20))
        else: a=255
        bd.line([(0,i),(bx1-bx0,i)],fill=(r,g,b,a))
    im.alpha_composite(band,(bx0,by0))
    # eyebrow tekst (Segoe UI Semibold, tracking dobrany do oryginalu, kolor szary jak baked)
    ef=seg(18,sb=True); etxt="PLATFORMA SPRAWDZONA W USA"
    # tracking: oryginal pelny napis mial w=358 dla SB? dobierz tr by gestosc ~ oryginalu
    full="PLATFORMA SPRAWDZONA W USA (STYLEX)"
    tr=1.0
    for cand in [x/10 for x in range(0,40)]:
        if abs(tracked_w(full,ef,cand)-358)<abs(tracked_w(full,ef,tr)-358): tr=cand
    d=ImageDraw.Draw(im)
    draw_tracked(d,(69,829),etxt,ef,GREY,tr)
    # --- STOPKA prawa: nieprzezroczyste pasmo (scrim tu ciemny/jednolity) + nowy tekst bez Stylex ---
    fy0,fy1=1044,1072
    fband=Image.new("RGBA",(1080,fy1-fy0),(0,0,0,0)); fpx=fband.load()
    r,g,b=90,84,76   # = zmierzony scrim stopki (jednolity), zero przyciemnienia
    x_feat0,x_feat1=440,560   # feather lewej krawedzi (brak pionowego szwu)
    for x in range(430,1080):
        if x<x_feat1: a=int(255*max(0,(x-x_feat0))/(x_feat1-x_feat0))
        else: a=255
        for i in range(fy1-fy0): fpx[x,i]=(r,g,b,a)
    im.alpha_composite(fband,(0,fy0))
    d=ImageDraw.Draw(im)
    ff=seg(16); ftxt="Źródło: Lunea Product Factsheet (adaptacja EU)."
    fw=d.textlength(ftxt,font=ff); d.text((1038-fw,1050),ftxt,font=ff,fill=(150,145,138))
    save(im,"B4.png")

# ================= B5 (1080x1080) — regen eyebrow Segoe SB (panel solidny) =================
def build_B5():
    import numpy as np
    im=load(V2,"B5.jpg")
    # recolor telefon pomarancz->zielen (jak v2.2)
    box=(50,885,680,980)
    crop=np.asarray(im.crop(box).convert("RGB")).astype(float)
    a=crop/255; mx=a.max(2); mn=a.min(2); dd=mx-mn+1e-9
    r,g,b=a[...,0],a[...,1],a[...,2]; h=np.zeros_like(mx)
    h=np.where(mx==r,((g-b)/dd)%6,h); h=np.where(mx==g,(b-r)/dd+2,h); h=np.where(mx==b,(r-g)/dd+4,h); h*=60
    m=(h>=20)&(h<=58)&((mx-mn)>=0.42)&(mx>=0.45)
    out=crop.copy(); br=np.clip(mx,0,1)[...,None]
    out[m]=(np.array(GREEN,float)[None,None,:]*br)[m]
    im.paste(Image.fromarray(out.astype('uint8')),box[:2])
    d=ImageDraw.Draw(im)
    def sample_bg(bx):
        c=np.asarray(im.crop(bx).convert("RGB")).reshape(-1,3); return tuple(int(x) for x in np.median(c,0))
    bg=sample_bg((900,785,1010,870))
    # eyebrow: Segoe UI Semibold 18 tr1.5 (POTWIERDZONY = font A/B1), szary jak A/B1
    d.rectangle((60,750,1020,784),fill=bg)
    ef=seg(18,sb=True); draw_tracked(d,(68,755),"DESIGN POST COLOGNE · PREZENTACJA PROFIM LUNEA",ef,(154,161,173),1.5)
    # body (jak v2.2)
    d.rectangle((60,856,1020,892),fill=bg)
    d.text((68,859),"Wyślij nam rzut — dobierzemy układ Lunea pod Twoje biuro.",font=seg(24),fill=(224,226,230))
    save(im,"B5.png")

# ===== A/B1/B3 kopiowane z v2.2 bez zmian =====
def copy_unchanged():
    for n in ["A.png","B1.png","B3.png"]:
        Image.open(os.path.join(V22,n)).convert("RGB").save(os.path.join(OUT,n),quality=95); print("COPY",n)

if __name__=="__main__":
    import sys
    only=sys.argv[1] if len(sys.argv)>1 else "all"
    if only in ("all","B2"): build_B2()
    if only in ("all","B4"): build_B4()
    if only in ("all","B5"): build_B5()
    if only=="all": copy_unchanged()
    print("DONE v2.3", only)
