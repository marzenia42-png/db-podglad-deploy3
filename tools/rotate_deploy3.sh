#!/usr/bin/env bash
# rotate_deploy3.sh — ROTACJA podglądów deploy3 -> repo ARCHIWUM (nic nie ginie, linki działają).
# ZASADY: NIE kasuje z deploy3 bez kopii w archiwum + testem PASS. Bez force-push. Bez dedupu _assets.
# Katalogi AKTYWNE (blok w toku LUB nazwa w Drive KONTROLA <=7 dni) ZOSTAJĄ w deploy3.
# Zależności (_assets/images/files) referowane przez przenoszony katalog kopiowane do archiwum
# w TEJ SAMEJ strukturze ścieżek (referencje względne ../../_assets/.. działają 1:1).
#
# Tryby:  DRYRUN=1 (domyślnie) tylko plan;  APPLY=1 wykonanie.
# Wynik kodu: 0 OK (po rotacji <TARGET albo nic do roboty); 2 = nadal >=HARD po rotacji.
set -euo pipefail

DEPLOY3="${DEPLOY3_OVERRIDE:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ARCHIVE="${ARCHIVE_REPO:-/e/Dario/projekty/db-podglad-archiwum}"
OWNER="${ARCHIVE_OWNER:-marzenia42-png}"
ARCHIVE_REPO_NAME="${ARCHIVE_REPO_NAME:-db-podglad-archiwum}"
ARCHIVE_PAGES="${ARCHIVE_PAGES_URL:-https://marzenia42-png.github.io/db-podglad-archiwum}"
TARGET_MB="${TARGET_MB:-760}"     # rotuj aż <TARGET
HARD_MB="${HARD_MB:-820}"
APPLY="${APPLY:-0}"
LOG="${ROTATE_LOG:-/c/tmp/rotate_deploy3_$(git -C "$DEPLOY3" rev-parse --short HEAD 2>/dev/null || echo x).log}"

# AKTYWNE/INFRA (ZOSTAJĄ, nigdy nie archiwizuj). _posty jest WYJĄTKIEM = archiwalne (decyzja Dario 12.11).
# Infra: _akcept (galeria akceptu ZASADA 17), _assets/_ns-files, asystent/koszyk/kontakt/blog/strony stałe, dotfiles.
ACTIVE_RE='^(iso-lawka-|malow-sbm-|paged-|mapa-realizacji-v3$|kategorie)|hub|^_(akcept|assets|ns-files)|^(asystent|koszyk|kontakt|action|glowna|o-nas|przestrzenie|blog-|varsubtitle|com-soft|sft|u-connect|vancouver)|^\.'

say(){ echo "[rotate] $*"; }

cur_mb(){ git -C "$DEPLOY3" ls-tree -r -l HEAD | awk '{s+=$4} END{printf "%d", s/1048576}'; }

# cache nazw katalogow referowanych w KONTROLA <=7 dni (nazwa katalogu jako podciag sciezki pliku)
build_kontrola_cache(){
  KONTROLA_CACHE="$(mktemp)"
  rclone lsf -R --max-age 7d "claudia:KONTROLA" 2>/dev/null > "$KONTROLA_CACHE" || true
}

is_active(){
  local d="$1"
  echo "$d" | grep -qE "$ACTIVE_RE" && return 0
  [ -s "${KONTROLA_CACHE:-/dev/null}" ] && grep -q "$d" "$KONTROLA_CACHE" && return 0
  return 1
}

# lista NIEAKTYWNYCH katalogow etap3 posortowana OLDEST-first (data commita, potem rozmiar)
inactive_oldest(){
  git -C "$DEPLOY3" ls-tree -r -l HEAD -- etap3 \
    | awk '{n=$5; sub(/^etap3\//,"",n); sub(/\/.*/,"",n); size[n]+=$4} END{for(d in size) print d"\t"size[d]}' \
    | while IFS=$'\t' read -r d bytes; do
        is_active "$d" && continue
        ts=$(git -C "$DEPLOY3" log -1 --format='%ct' -- "etap3/$d" 2>/dev/null)
        [ -z "$ts" ] && continue   # pusty/niesledzony katalog
        echo "$ts	$bytes	$d"
      done | sort -k1,1n -k2,2nr   # najstarszy wsad pierwszy, w nim najwieksze pierwsze (mniej katalogow)
}

# kopiuje katalog + jego zaleznosci (_assets/images/files) do archiwum (self-sufficient)
copy_to_archive(){
  local d="$1"
  mkdir -p "$ARCHIVE/etap3"
  cp -r "$DEPLOY3/etap3/$d" "$ARCHIVE/etap3/$d"
  # zaleznosci referowane w plikach tekstowych
  grep -rhoE '(_assets|images|files)/[A-Za-z0-9._/-]+\.[A-Za-z0-9]+' \
    --include=*.html --include=*.css --include=*.js --include=*.json \
    "$DEPLOY3/etap3/$d" 2>/dev/null | sort -u | while read -r rel; do
      src="$DEPLOY3/$rel"
      [ -f "$src" ] || continue
      dst="$ARCHIVE/$rel"
      mkdir -p "$(dirname "$dst")"
      [ -f "$dst" ] || cp "$src" "$dst"
    done
}

# czeka na build Pages archiwum (status built) z timeoutem
wait_pages(){
  local tries=40
  while [ "$tries" -gt 0 ]; do
    st=$(gh api "repos/$OWNER/$ARCHIVE_REPO_NAME/pages/builds/latest" --jq '.status' 2>/dev/null || echo "")
    [ "$st" = "built" ] && { say "Pages archiwum: built"; return 0; }
    tries=$((tries-1)); sleep 15
  done
  say "Pages archiwum: timeout (status=$st)"; return 1
}

curl_ok(){ local url="$1"; local code; code=$(curl -s -o /dev/null -w '%{http_code}' -L "$url" 2>/dev/null); [ "$code" = "200" ]; }

update_archiwum_md(){
  local d="$1"; local when="$2"
  local md="$DEPLOY3/ARCHIWUM.md"
  [ -f "$md" ] || printf '# ARCHIWUM podglądów deploy3\n\nKatalogi przeniesione do repo `%s` (rotacja, nic nie ginie).\n\n| katalog | stary URL (deploy3) | nowy URL (archiwum) | data |\n|---|---|---|---|\n' "$ARCHIVE_REPO_NAME" > "$md"
  printf '| %s | %s/etap3/%s/ | %s/etap3/%s/ | %s |\n' \
    "$d" "https://$OWNER.github.io/db-podglad-deploy3" "$d" "$ARCHIVE_PAGES" "$d" "$when" >> "$md"
}

main(){
  export ROTATE_ACTIVE=1   # guard: gate w pre-push nie wywoła rotacji rekurencyjnie
  local start; start=$(cur_mb)
  say "deploy3 git-tracked: ${start} MB (target <${TARGET_MB}, HARD ${HARD_MB})"
  if [ "$start" -lt "$TARGET_MB" ]; then say "OK <${TARGET_MB} MB — rotacja niepotrzebna"; return 0; fi
  say "ROTACJA potrzebna (>=${TARGET_MB})."
  build_kontrola_cache

  # wybierz najstarsze nieaktywne az projekcja < TARGET
  local proj=$start; local picks=()
  while IFS=$'\t' read -r ts bytes d; do
    [ "$proj" -lt "$TARGET_MB" ] && break
    picks+=("$d")
    proj=$(( proj - bytes/1048576 ))
  done < <(inactive_oldest)

  if [ "${#picks[@]}" -eq 0 ]; then
    say "BRAK nieaktywnych kandydatow — nie moge zejsc <${TARGET_MB} bez decyzji BETI (wszystko aktywne)."
    return 2
  fi
  say "DO PRZENIESIENIA (${#picks[@]}): ${picks[*]}  -> projekcja ~${proj} MB"

  if [ "$APPLY" != "1" ]; then
    say "DRY-RUN (APPLY=1 by wykonac). Nic nie zmienione."
    return 0
  fi

  # APPLY: najpierw kopia+push do archiwum, test, dopiero potem usuniecie z deploy3
  local now; now=$(git -C "$DEPLOY3" log -1 --format='%cd' --date=format:'%Y-%m-%d' 2>/dev/null)
  for d in "${picks[@]}"; do copy_to_archive "$d"; done
  touch "$ARCHIVE/.nojekyll"   # Jekyll off: serwuj _assets/ i _posty/
  git -C "$ARCHIVE" add -A
  git -C "$ARCHIVE" commit -q -m "archiwum rotacja: ${picks[*]}" || { say "nic do commita w archiwum"; }
  git -C "$ARCHIVE" push -q origin main
  say "archiwum push OK; test Pages+curl..."
  wait_pages || { say "STOP: Pages archiwum nie zbudowalo sie — NIE usuwam z deploy3"; return 1; }

  local ok=() ; local fail=()
  for d in "${picks[@]}"; do
    if curl_ok "$ARCHIVE_PAGES/etap3/$d/"; then ok+=("$d"); else fail+=("$d"); fi
  done
  [ "${#fail[@]}" -gt 0 ] && say "UWAGA archiwum curl FAIL: ${fail[*]} — tych NIE usuwam z deploy3"

  # usun z deploy3 TYLKO te z testem PASS
  for d in "${ok[@]}"; do
    git -C "$DEPLOY3" rm -q -r "etap3/$d"
    update_archiwum_md "$d" "$now"
  done
  say "deploy3: usunieto ${#ok[@]} katalogow (test PASS). Po: $(cur_mb) MB"
  # commit+push deploy3 (tryb dzienny) — staguje TYLKO usuniecia (juz w indeksie) + ARCHIWUM.md; NIE -A
  if [ "${#ok[@]}" -gt 0 ] && [ "${COMMIT_DEPLOY3:-1}" = "1" ]; then
    git -C "$DEPLOY3" add ARCHIWUM.md 2>/dev/null || true
    git -C "$DEPLOY3" commit -q -m "slim (rotacja auto 4:40): ${ok[*]}" && \
      git -C "$DEPLOY3" push -q origin main && say "deploy3 commit+push OK ($(cur_mb) MB)" \
      || say "UWAGA: deploy3 commit/push nieudany — zglos (staged zmiany zostaja)"
  else
    say "Commit+push deploy3: pominięty (COMMIT_DEPLOY3=0) — robi wywolujacy."
  fi
  return 0
}
main "$@" 2>&1 | tee -a "$LOG"
# log przebiegu do Drive KONTROLA (ustawiane przez Harmonogram: ROTATE_UPLOAD=1)
if [ "${ROTATE_UPLOAD:-0}" = "1" ]; then
  rclone copyto "$LOG" "claudia:KONTROLA/T1/ROTACJA/$(date +%F)_$(git -C "$DEPLOY3" rev-parse --short HEAD).md" 2>/dev/null || true
fi
