# -*- coding: utf-8 -*-
"""Build Lunea v2.2 ze slajdow v2 (PIL). recolor orange/amber->green; miarki 2x+glow; B4 usun (STYLEX); B5 re-tekst."""
import os, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2\img"
OUT = r"E:\Dario\projekty\db-podglad-deploy3\etap3\_posty\lunea-v2.2\img"
FB  = r"E:\Dario\projekty\linkedin-banery\fonts"
SEG = r"C:\Windows\Fonts"
os.makedirs(OUT, exist_ok=True)
GREEN = (43, 227, 138)          # #2be38a
PILL  = (22, 25, 31)            # tlo pigulki

def seg(size, sb=False): return ImageFont.truetype(os.path.join(SEG, "seguisb.ttf" if sb else "segoeui.ttf"), size)
def mont(w, size): return ImageFont.truetype(os.path.join(FB, f"Montserrat-{w}.ttf"), size)

def hsv(crop):
    a=crop.astype(float)/255; mx=a.max(2); mn=a.min(2); d=mx-mn+1e-9
    r,g,b=a[...,0],a[...,1],a[...,2]; h=np.zeros_like(mx)
    h=np.where(mx==r,((g-b)/d)%6,h); h=np.where(mx==g,(b-r)/d+2,h); h=np.where(mx==b,(r-g)/d+4,h)
    return h*60,(mx-mn),mx

def recolor(img, box, hue_lo=20, hue_hi=58, sat=0.42, val=0.45):
    crop=np.asarray(img.crop(box).convert("RGB")).astype(float)
    H,S,V=hsv(crop); m=(H>=hue_lo)&(H<=hue_hi)&(S>=sat)&(V>=val)
    out=crop.copy(); br=np.clip(V,0,1)[...,None]
    out[m]=(np.array(GREEN,float)[None,None,:]*br)[m]
    img.paste(Image.fromarray(out.astype('uint8')), box[:2]); return int(m.sum())

def copy_cover(img, dst_box, dx, feather=12):
    """kopiuje panel z przesunieciem dx, feather na krawedziach (zakrywa tekst sasiednim pustym panelem)."""
    x0,y0,x1,y1=dst_box; w=x1-x0; h=y1-y0
    src=img.crop((x0+dx,y0,x1+dx,y1)).convert("RGB")
    m=Image.new("L",(w,h),0); ImageDraw.Draw(m).rectangle([feather,feather,w-feather,h-feather],fill=255)
    m=m.filter(ImageFilter.GaussianBlur(feather))
    img.paste(src,(x0,y0),m)

def rpill(draw, center, text, font, fill=GREEN, padx=26, pady=14, bg=PILL):
    w=draw.textlength(text,font=font); asc,desc=font.getmetrics(); h=asc+desc
    cx,cy=center; x0=cx-w/2-padx; y0=cy-h/2-pady; x1=cx+w/2+padx; y1=cy+h/2+pady
    draw.rounded_rectangle([x0,y0,x1,y1], radius=(y1-y0)/2, fill=bg)
    return (x0,y0,x1,y1,w,h)

def glow_layer(size):
    return Image.new("RGBA", size, (0,0,0,0))

def draw_glow_text(base, xy, text, font, fill=GREEN, rad=12, passes=2):
    lay=glow_layer(base.size); d=ImageDraw.Draw(lay)
    d.text(xy, text, font=font, fill=fill+(255,))
    bl=lay.filter(ImageFilter.GaussianBlur(rad))
    for _ in range(passes): base.alpha_composite(bl)
    ImageDraw.Draw(base).text(xy, text, font=font, fill=fill+(255,))

def pill_glow(base, center, text, font, fill=GREEN, padx=26, pady=14):
    d=ImageDraw.Draw(base); box=rpill(d, center, text, font, fill, padx, pady)
    x0,y0,x1,y1,w,h=box; asc,desc=font.getmetrics()
    tx=center[0]-w/2; ty=center[1]-(asc+desc)/2
    draw_glow_text(base,(tx,ty),text,font,fill,rad=10)
    return box

def arrow(base, p0, p1, color=GREEN, width=10, head=26):
    lay=glow_layer(base.size); d=ImageDraw.Draw(lay)
    d.line([p0,p1], fill=color+(255,), width=width)
    ang=math.atan2(p1[1]-p0[1], p1[0]-p0[0])
    for P,a in [(p1,ang),(p0,ang+math.pi)]:
        tip=P; l=(P[0]-head*math.cos(a-0.5),P[1]-head*math.sin(a-0.5)); r=(P[0]-head*math.cos(a+0.5),P[1]-head*math.sin(a+0.5))
        d.polygon([tip,l,r], fill=color+(255,))
    bl=lay.filter(ImageFilter.GaussianBlur(7)); base.alpha_composite(bl); base.alpha_composite(lay)

def fill_bg(img, box, src_x0, src_x1):
    """zakrywa box rekonstruujac jasne tlo per-wiersz z czystej kolumny (usuwa stare biale strzalki)."""
    x0,y0,x1,y1=box; arr=np.asarray(img.convert("RGB"))
    d=ImageDraw.Draw(img)
    for y in range(y0,y1):
        col=tuple(int(v) for v in np.median(arr[y, src_x0:src_x1],0))
        d.line([(x0,y),(x1,y)], fill=col)

def erase_text_on_panel(img, box, dark_pct=35, margin=22):
    """wymazuje jasny tekst na ciemnym panelu: piksele jasniejsze od tla -> lokalne ciemne tlo (bez pudla)."""
    crop=np.asarray(img.crop(box).convert("RGB")).astype(int)
    lum=crop.mean(2)
    thr=np.percentile(lum, dark_pct)
    bg=crop[lum<=thr].reshape(-1,3)
    bgmed=np.median(bg,0) if len(bg) else np.array([24,27,33])
    sat=crop.max(2)-crop.min(2)
    mask=(lum> thr+margin)&(sat<70)          # jasny, maloskolorowy = tekst szary
    out=crop.copy(); out[mask]=bgmed
    img.paste(Image.fromarray(out.astype('uint8')), box[:2])
    return int(mask.sum())

def load(n): return Image.open(os.path.join(SRC,n)).convert("RGB")
def to_rgba(img): return img.convert("RGBA")
def save(img,n): img.convert("RGB").save(os.path.join(OUT,n), quality=95); print("OK",n)

# ========== A (1080x1350) ==========
a=load("A.jpg")
recolor(a,(0,1150,1080,1350)); recolor(a,(180,690,820,900))     # "10 cm" + linijka amber
fill_bg(a,(158,818,316,876), 40,150)                            # usun stare biale strzalki (lewo)
fill_bg(a,(672,818,806,876), 880,1010)                          # usun stare biale strzalki (prawo)
a=to_rgba(a)
arrow(a,(206,853),(792,853),GREEN,12,30)                        # linia wymiarowa zielona (byla biala)
pill_glow(a,(490,853),"MODUŁ U11 · 640 mm",mont("ExtraBold",30))
pill_glow(a,(470,745),"+10 cm",mont("ExtraBold",30))
save(a,"A.png")

# ========== B1 (1080x1080) ==========
b1=load("B1.jpg"); recolor(b1,(150,540,880,740))                 # linijka amber
b1=to_rgba(b1); pill_glow(b1,(498,636),"co 10 cm",mont("ExtraBold",34))
save(b1,"B1.png")

# ========== B2 (1080x1080) — kluczowe: miarki 2x+glow, rozsuniete ==========
b2=load("B2.jpg"); recolor(b2,(0,860,1080,1080))                 # headline "10 cm"
b2=to_rgba(b2)
# zielona linia wymiarowa wzdluz podstawy (grubsza = zakrywa stare biale strzalki)
arrow(b2,(355,560),(805,590),GREEN,14,28)
# 2 czytelne pille blanketujace stare (zakres i tak w headline/podleadzie)
pill_glow(b2,(445,585),"640 mm",mont("ExtraBold",34),padx=46,pady=37)  # blanket klastra +10/+20/640
pill_glow(b2,(630,532),"+80 cm",mont("ExtraBold",32),padx=28,pady=18)  # max zasieg
save(b2,"B2.png")

# ========== B3 (1080x1080) — bez zmian ==========
save(load("B3.jpg"),"B3.png")

# ========== B4 (1080x1080) — usun "(STYLEX)" z eyebrow (y~822-846, x~348-438) ==========
b4=load("B4.jpg")
bx=(342,820,476,851)
print("B4 erase (STYLEX) px:", erase_text_on_panel(b4,bx,dark_pct=50,margin=8))  # wymaz liter "(STYLEX)"
_p=b4.crop(bx).filter(ImageFilter.GaussianBlur(2.2)); b4.paste(_p,bx[:2])        # wygladz duchy antyaliasu
save(b4,"B4.png")

# ========== B5 (1080x1080) — recolor telefon + re-tekst ==========
b5=load("B5.jpg"); recolor(b5,(50,885,680,980))
def sample_bg(img,box): c=np.asarray(img.crop(box).convert("RGB")).reshape(-1,3); return tuple(int(x) for x in np.median(c,0))
bg=sample_bg(b5,(900,785,1010,870))
d=ImageDraw.Draw(b5)
d.rectangle((60,752,1020,782), fill=bg)
x=68
for ch in "DESIGN POST COLOGNE · PREZENTACJA PROFIM LUNEA":
    d.text((x,756),ch,font=seg(17,sb=True),fill=(154,161,173)); x+=d.textlength(ch,font=seg(17,sb=True))+2
d.rectangle((60,856,1020,892), fill=bg)
d.text((68,859),"Wyślij nam rzut — dobierzemy układ Lunea pod Twoje biuro.",font=seg(24),fill=(224,226,230))
save(b5,"B5.png")
print("DONE v2")
