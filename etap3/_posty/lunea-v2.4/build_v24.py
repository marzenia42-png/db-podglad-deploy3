# -*- coding: utf-8 -*-
"""
LUNEA v2.4 — JEDEN SZABLON (pkt 25: tekst = warstwa na CZYSTEJ bazie, zero lat).
Typografia = WZOR B4: Segoe UI Semibold (eyebrow/stopka), Segoe UI Bold (naglowek+akcent),
Segoe UI Regular (opis). Akcent #2be38a (zielony) — zero pomaranczu.
Czyste bazy:
  A/B1/B2/B5 = packshot v2 z REGENEROWANYM gradientem pod panelem (zero wpieczonego panelu/tekstu).
  B3 = pptx image7 (czysta scena wneki), B4 = pptx image32 (czysta scena recepcji).
Format: A 1080x1350; B1-B5 1080x1080.
"""
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

SEG = r"C:\Windows\Fonts"
V2  = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2\img"
PPX = r"C:\tmp\lunea-v24\pptx_media"
POSTY = r"C:\tmp\posty-lunea-2026-10-27\src"
OUT = r"C:\tmp\lunea-v24\out"
os.makedirs(OUT, exist_ok=True)

GREEN=(43,227,138); WHITE=(243,244,246); BODY=(223,225,229); EB=(154,161,173)
FOOT=(206,210,217); SRC=(150,150,156)

def F(name,sz): return ImageFont.truetype(os.path.join(SEG,name),sz)
def sb(sz): return F("seguisb.ttf",sz)      # Semibold
def bd(sz): return F("segoeuib.ttf",sz)     # Bold
def rg(sz): return F("segoeui.ttf",sz)      # Regular

# ---------- pomiar/ rysowanie ----------
def tw(d,t,f): return d.textlength(t,font=f)
def tracked(d,xy,t,f,fill,tr):
    x,y=xy
    for ch in t:
        d.text((x,y),ch,font=f,fill=fill); x+=tw(d,ch,f)+tr
    return x
def tracked_w(d,t,f,tr): return sum(tw(d,ch,f)+tr for ch in t)-tr if t else 0

# ---------- CZYSTA BAZA: packshot z regeneracja gradientu ----------
def clean_packshot(name, regen_from):
    """Zdejmij wpieczony panel/tekst dolny: od regen_from w dol wypelnij czystym
    gradientem studyjnym (mediana kolumn bocznych per wiersz). Zero sladu."""
    img=Image.open(os.path.join(V2,name)).convert("RGB")
    a=np.asarray(img).astype(np.float32); H,W,_=a.shape
    clean_y=regen_from-6
    for y in range(regen_from,H):
        ys=min(y,clean_y)
        side=np.concatenate([a[ys,12:120], a[ys,W-120:W-12]],0)
        med=np.median(side,0)
        a[y,:,:]=med
    # delikatny feather na szwie
    out=Image.fromarray(np.clip(a,0,255).astype('uint8'))
    seam=out.crop((0,regen_from-8,W,regen_from+8)).filter(ImageFilter.GaussianBlur(3))
    out.paste(seam,(0,regen_from-8))
    return out

def recolor_green(img, box, hue_lo=33, hue_hi=52, sat=0.45, val=0.50):
    """amber/pomarancz -> zielen w boxie. Bezpieczne: terakota H8 i tlo S0 poza zakresem."""
    crop=np.asarray(img.crop(box).convert("RGB")).astype(float)
    a=crop/255; mx=a.max(2); mn=a.min(2); dd=mx-mn+1e-9
    r,g,b=a[...,0],a[...,1],a[...,2]; h=np.zeros_like(mx)
    h=np.where(mx==r,((g-b)/dd)%6,h); h=np.where(mx==g,(b-r)/dd+2,h); h=np.where(mx==b,(r-g)/dd+4,h); h*=60
    m=(h>=hue_lo)&(h<=hue_hi)&((mx-mn)>=sat)&(mx>=val)
    out=crop.copy(); br=np.clip(mx,0,1)[...,None]
    out[m]=(np.array(GREEN,float)[None,None,:]*br)[m]
    img.paste(Image.fromarray(out.astype('uint8')),box[:2]); return int(m.sum())

def recolor_white_to_green(img, box, val=0.80, sat_max=0.22):
    """biale linie wymiarowe -> zielen (nisko nasycone, jasne)."""
    crop=np.asarray(img.crop(box).convert("RGB")).astype(float)
    a=crop/255; mx=a.max(2); mn=a.min(2)
    m=(mx>=val)&((mx-mn)<=sat_max)
    out=crop.copy(); out[m]=np.array(GREEN,float)
    img.paste(Image.fromarray(out.astype('uint8')),box[:2]); return int(m.sum())

def cover(im,W,H):
    iw,ih=im.size; s=max(W/iw,H/ih)
    im=im.resize((round(iw*s),round(ih*s)),Image.LANCZOS)
    x=(im.width-W)//2; y=(im.height-H)//2
    return im.crop((x,y,x+W,y+H))

def clean_scene(fname,W,H,focus=0.5):
    im=Image.open(os.path.join(PPX,fname)).convert("RGB")
    iw,ih=im.size; s=max(W/iw,H/ih)
    im=im.resize((round(iw*s),round(ih*s)),Image.LANCZOS)
    x=int((im.width-W)*focus); y=(im.height-H)//2
    x=max(0,min(x,im.width-W)); y=max(0,min(y,im.height-H))
    return im.crop((x,y,x+W,y+H))

def studio_gradient(W,H):
    """jasny studyjny gradient jak v2 (profil pionowy z v2 A, kafelkowany poziomo)."""
    a=np.asarray(Image.open(os.path.join(V2,"A.jpg")).convert("RGB")).astype(float)
    prof=np.median(a[40:980,12:90],1)                 # 940 wierszy x RGB
    ys=np.linspace(0,prof.shape[0]-1,H)
    col=np.stack([np.interp(ys,np.arange(prof.shape[0]),prof[:,c]) for c in range(3)],1)
    canvas=np.repeat(col[:,None,:],W,1)
    # delikatny poziomy vignette (srodek jasniej)
    xr=np.linspace(-1,1,W)[None,:,None]; vig=(1-0.035*xr**2)
    canvas=np.clip(canvas*vig,0,255)
    return Image.fromarray(canvas.astype('uint8'))

def place_on_gradient(render_path,W,H,target_h,cx,cy_top):
    """czysty packshot na bialym -> DARKEN na studyjnym gradiencie (cien zachowany, zero cutoutu)."""
    canvas=studio_gradient(W,H)
    r=Image.open(render_path).convert("RGB")
    s=target_h/r.height; r=r.resize((round(r.width*s),target_h),Image.LANCZOS)
    x=cx-r.width//2; y=cy_top
    x0=max(0,x); y0=max(0,y); x1=min(W,x+r.width); y1=min(H,y+r.height)
    reg=canvas.crop((x0,y0,x1,y1)); rr=r.crop((x0-x,y0-y,x1-x,y1-y))
    canvas.paste(ImageChops.darker(reg,rr),(x0,y0))
    return canvas

def ruler(img,x0,x1,y,step=56,label="co 10 cm"):
    """pozioma miarka zielona: linia + tiki co step + strzalki + pill label."""
    d=ImageDraw.Draw(img,"RGBA")
    d.line([(x0,y),(x1,y)],fill=GREEN+(255,),width=7)
    x=x0
    while x<=x1+1:
        d.line([(x,y-13),(x,y+13)],fill=GREEN+(255,),width=4); x+=step
    for xe,s in [(x0,1),(x1,-1)]:
        d.polygon([(xe,y),(xe+s*16,y-10),(xe+s*16,y+10)],fill=GREEN+(255,))
    if label:
        f=bd(32); w=tw(d,label,f); cx=(x0+x1)//2
        d.rounded_rectangle([cx-w/2-20,y-62,cx+w/2+20,y-14],radius=24,fill=(18,21,27,255))
        d.text((cx-w/2,y-56),label,font=f,fill=GREEN)

# ---------- AI badge ----------
def ai_badge(img):
    d=ImageDraw.Draw(img,"RGBA"); W,_=img.size
    f1=bd(20); f2=rg(19); t2="grafika wspomagana AI"
    pad=14; gap=9; boxw=34
    tw2=d.textlength(t2,font=f2)
    pw=pad+boxw+gap+tw2+pad; ph=42
    x1=W-28; x0=x1-pw; y0=28; y1=y0+ph
    d.rounded_rectangle([x0,y0,x1,y1],radius=ph/2,fill=(28,31,38,235))
    d.rounded_rectangle([x0+pad-4,y0+8,x0+pad+boxw-8,y1-8],radius=7,fill=(70,74,84,255))
    d.text((x0+pad,y0+9),"AI",font=f1,fill=(255,255,255,255))
    d.text((x0+pad+boxw+gap-4,y0+11),t2,font=f2,fill=(196,200,208,255))

# ---------- PANEL + TEKST (jedna funkcja, bottom-anchored) ----------
PANEL_M=40; PANEL_R=30; PAD=42
def draw_panel(img, rows, src_text):
    """rows: lista dict {t, kind, parts?} rysowana od gory; panel dokotwiczony do dolu.
       kind: eyebrow|head|body|spec|phone|cta ; parts dla head/phone = [(txt,color)]."""
    d=ImageDraw.Draw(img,"RGBA"); W,H=img.size
    inner_w=W-2*PANEL_M-2*PAD
    # zmierz wysokosc tresci
    def line_h(r):
        k=r["kind"]
        if k=="eyebrow": return 26+14
        if k=="head":    return int(r["sz"]*1.12)*r["nlines"]+10
        if k=="body":    return int(r["sz"]*1.34)*r["nlines"]+14
        if k=="spec":    return 30+16
        if k=="phone":   return int(r["sz"]*1.05)+12
        if k=="cta":     return 32+6
        return 0
    foot_h=30
    content_h=sum(line_h(r) for r in rows)
    panel_h=PAD+content_h+18+foot_h+PAD-10
    y1=H-PANEL_M; y0=y1-panel_h; x0=PANEL_M; x1=W-PANEL_M
    # panel: ciemny, near-opaque, subtelny gradient (premium glass, zero przeswitu starego tekstu)
    pan=Image.new("RGBA",(x1-x0,y1-y0),(0,0,0,0)); pd=ImageDraw.Draw(pan)
    for i in range(y1-y0):
        t=i/max(1,(y1-y0-1)); c=int(23-6*t);
        pd.line([(0,i),(x1-x0,i)],fill=(c,c+2,c+6,236))
    # zaokraglona maska
    mask=Image.new("L",(x1-x0,y1-y0),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,x1-x0-1,y1-y0-1],radius=PANEL_R,fill=255)
    img.paste(Image.composite(pan,Image.new("RGBA",pan.size,(0,0,0,0)),mask),(x0,y0),mask)
    d=ImageDraw.Draw(img,"RGBA")
    # tresc
    x=x0+PAD; y=y0+PAD-4
    for r in rows:
        k=r["kind"]
        if k=="eyebrow":
            tracked(d,(x,y),r["t"],sb(18),EB,2.0); y+=40
        elif k=="head":
            f=bd(r["sz"])
            for ln in r["parts"]:  # ln = list of (txt,color)
                cx=x
                for txt,col in ln:
                    d.text((cx,y),txt,font=f,fill=col); cx+=tw(d,txt,f)
                y+=int(r["sz"]*1.12)
            y+=10
        elif k=="body":
            f=rg(r["sz"])
            for ln in r["lines"]:
                d.text((x,y),ln,font=f,fill=BODY); y+=int(r["sz"]*1.34)
            y+=14
        elif k=="spec":
            f=sb(23)
            cx=x
            for num,lab in r["items"]:
                d.text((cx,y),num,font=bd(24),fill=GREEN); cx+=tw(d,num,bd(24))+8
                d.text((cx,y+1),lab,font=f,fill=EB); cx+=tw(d,lab,f)+40
            y+=46
        elif k=="phone":
            f=bd(r["sz"]); d.text((x,y),r["t"],font=f,fill=GREEN); y+=int(r["sz"]*1.05)+12
        elif k=="cta":
            f=sb(25); t=r["t"].replace("✓","").strip()
            d.ellipse([x,y-1,x+26,y+25],outline=GREEN,width=3)
            d.line([(x+7,y+12),(x+12,y+18),(x+20,y+5)],fill=GREEN,width=3,joint="curve")
            d.text((x+38,y),t,font=f,fill=GREEN); y+=38
    # stopka + zrodlo (ta sama pozycja: dokotwiczone do dolu panelu)
    fy=y1-PAD-6
    tracked(d,(x0+PAD,fy),"DB CONCEPT SPACE · OD 2004 · DBMEBLE.PL",sb(15),FOOT,1.6)
    if src_text:
        fs=rg(15); swdt=tw(d,src_text,fs)
        d.text((x1-PAD-swdt,fy),src_text,font=fs,fill=SRC)
    return (x0,y0,x1,y1)

# ---------- miarki (zielone, czyste) ----------
def dim_line(img,x0,x1,y,label=None,width=7,head=16):
    d=ImageDraw.Draw(img,"RGBA")
    d.line([(x0,y),(x1,y)],fill=GREEN+(255,),width=width)
    for xe,s in [(x0,1),(x1,-1)]:
        d.line([(xe,y-14),(xe,y+14)],fill=GREEN+(255,),width=width-1)
        d.polygon([(xe,y),(xe+s*head,y-9),(xe+s*head,y+9)],fill=GREEN+(255,))
    if label:
        f=bd(34); wlab=tw(d,label,f); cx=(x0+x1)//2
        d.rounded_rectangle([cx-wlab/2-20,y-58,cx+wlab/2+20,y-8],radius=25,fill=(18,21,27,255))
        d.text((cx-wlab/2,y-52),label,font=f,fill=GREEN)

def glow_label(img,center,label,sz=40):
    d=ImageDraw.Draw(img,"RGBA"); f=bd(sz); w=tw(d,label,f)
    cx,cy=center
    lay=Image.new("RGBA",img.size,(0,0,0,0)); ld=ImageDraw.Draw(lay)
    ld.text((cx-w/2,cy),label,font=f,fill=GREEN+(255,))
    img.alpha_composite(lay.filter(ImageFilter.GaussianBlur(9)))
    ImageDraw.Draw(img,"RGBA").text((cx-w/2,cy),label,font=f,fill=GREEN+(255,))

def dashed_rect(img,box,color=GREEN,width=4,dash=22,gap=13,label=None):
    d=ImageDraw.Draw(img,"RGBA"); x0,y0,x1,y1=box
    pts=[(x0,y0),(x1,y0),(x1,y1),(x0,y1),(x0,y0)]
    for (ax,ay),(bx,by) in zip(pts,pts[1:]):
        L=math.hypot(bx-ax,by-ay); ux,uy=(bx-ax)/L,(by-ay)/L; t=0
        while t<L:
            a=(ax+ux*t,ay+uy*t); b=(ax+ux*min(t+dash,L),ay+uy*min(t+dash,L))
            d.line([a,b],fill=color+(255,),width=width); t+=dash+gap
    if label:
        f=sb(20); w=tw(d,label,f)
        d.rounded_rectangle([x0,y0-34,x0+w+28,y0-2],radius=8,fill=(16,22,18,255))
        tracked(d,(x0+14,y0-30),label,f,GREEN,1.5)

def save(img,n):
    img.convert("RGB").save(os.path.join(OUT,n),quality=94); print("OK",n,img.size)

# ============================================================== SLAJDY
def build_A():
    base=clean_packshot("A.jpg",1008).convert("RGBA")   # panel v2 top ~1132; regen od 1008
    recolor_green(base,(140,700,820,895))               # amber linijka + "+10 cm" -> zielen
    ai_badge(base)
    rows=[
     {"kind":"eyebrow","t":"PROFIM LUNEA · MODUŁOWY SYSTEM SOF"},
     {"kind":"head","sz":62,"nlines":1,"parts":[[("Rośnie co ",WHITE),("10 cm",GREEN)]]},
     {"kind":"body","sz":26,"nlines":2,"lines":["Skalowany od +10 do +80 cm — projektujesz","przestrzeń pod milimetr, nie pod katalog."]},
    ]
    draw_panel(base,rows,"Zdjęcie: Profim Lunea (packshot producenta). Wymiary: Lunea Product Factsheet.")
    save(base,"A.png")

def build_B1():
    base=clean_packshot("B1.jpg",772).convert("RGBA")   # panel v2 top ~880
    recolor_green(base,(140,585,990,715))               # amber linijka -> zielen
    ai_badge(base)
    rows=[
     {"kind":"eyebrow","t":"LUNEA · MODUŁY SKALOWANE CO 10 CM"},
     {"kind":"head","sz":52,"nlines":2,"parts":[[("Brakuje Ci centymetrów,",WHITE)],[("nie pomysłów?",WHITE)]]},
     {"kind":"cta","t":"✓  Dopasujemy układ do Twojego rzutu"},
    ]
    draw_panel(base,rows,"Zdjęcie: Profim Lunea (packshot producenta).")
    save(base,"B1.png")

def build_B2():
    # CZYSTA baza: packshot LUNA U11+80 (bez wpieczonych grafik) na studyjnym gradiencie
    base=place_on_gradient(os.path.join(POSTY,"LUNA U11+80.jpg"),1080,1080,target_h=462,cx=540,cy_top=172).convert("RGBA")
    ai_badge(base)
    # czysta zielona miarka POD sofa (sofa w calosci widoczna, nic nie nachodzi)
    ruler(base,250,830,672,step=58,label="co 10 cm")
    rows=[
     {"kind":"eyebrow","t":"JEDEN MODUŁ · WIELE SZEROKOŚCI"},
     {"kind":"head","sz":56,"nlines":1,"parts":[[("Moduły co ",WHITE),("10 cm",GREEN)]]},
     {"kind":"body","sz":24,"nlines":2,"lines":["Od +10 do +80 cm w krokach po 10 cm.","Symetria i czysty rzut — bez kompromisów."]},
     {"kind":"spec","items":[("640 mm","· MODUŁ U11"),("+80 cm","· MAKS. ZAKRES")]},
    ]
    draw_panel(base,rows,"Wymiary: Lunea Product Factsheet (moduły skalowane co 10 cm).")
    save(base,"B2.png")

def build_B3():
    base=clean_scene("image7.jpeg",1080,1080,focus=0.42).convert("RGBA")
    ai_badge(base)
    dashed_rect(base,(250,300,640,640),label="RZUT · WNĘKA")
    rows=[
     {"kind":"eyebrow","t":"WNĘKA · FILAR · PAS PRZY RECEPCJI"},
     {"kind":"head","sz":52,"nlines":2,"parts":[[("Trudny narożnik?",WHITE)],[("Lunea się zmieści",GREEN)]]},
     {"kind":"body","sz":24,"nlines":1,"lines":["Moduły co 10 cm wchodzą tam, gdzie gotowa sofa nie wejdzie."]},
    ]
    draw_panel(base,rows,"Zdjęcie: Profim Lunea w aranżacji producenta.")
    save(base,"B3.png")

def build_B4():
    base=clean_scene("image32.jpeg",1080,1080,focus=0.30).convert("RGBA")
    ai_badge(base)
    rows=[
     {"kind":"eyebrow","t":"PLATFORMA SPRAWDZONA W USA"},
     {"kind":"head","sz":52,"nlines":2,"parts":[[("Sprawdzona w USA.",WHITE)],[("Teraz w Europie.",GREEN)]]},
     {"kind":"body","sz":24,"nlines":1,"lines":["Lunea dopracowana dla rynku europejskiego — dobieramy ją w Twoim biurze."]},
    ]
    draw_panel(base,rows,"Źródło: Lunea Product Factsheet (adaptacja EU).")
    save(base,"B4.png")

def build_B5():
    base=clean_packshot("B5.jpg",770).convert("RGBA")   # panel v2 top ~958
    ai_badge(base)
    rows=[
     {"kind":"eyebrow","t":"DESIGN POST COLOGNE · PREZENTACJA PROFIM LUNEA"},
     {"kind":"head","sz":52,"nlines":1,"parts":[[("wt 27.10, 15:30",WHITE)]]},
     {"kind":"body","sz":24,"nlines":1,"lines":["Wyślij nam rzut — dobierzemy układ Lunea pod Twoje biuro."]},
     {"kind":"phone","sz":62,"t":"506 147 435"},
     {"kind":"cta","t":"✓  dbmeble.pl · dobór układu za darmo"},
    ]
    draw_panel(base,rows,"")
    save(base,"B5.png")

if __name__=="__main__":
    import sys
    only=sys.argv[1] if len(sys.argv)>1 else "all"
    fns={"A":build_A,"B1":build_B1,"B2":build_B2,"B3":build_B3,"B4":build_B4,"B5":build_B5}
    if only=="all":
        for fn in fns.values(): fn()
    else:
        fns[only]()
    print("DONE v2.4", only)
