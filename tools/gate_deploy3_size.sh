#!/usr/bin/env bash
# BRAMKA ROZMIARU deploy3 (gate_deploy3_size; numer ZASADY do nadania przez T7 —
# UWAGA: #151 w ZASADY_INDEX = BRAMKA LIVE-TRESC/directiveLoss, NIE ta bramka).
# Publikowane (HEAD) > 820 MB = STOP push (HARD). >= 760 MB = WARN + wywolanie rotacji do archiwum.
# Powod: GitHub Pages limit 1 GB -> deploy pada "Page build failed" juz przy ~894 MB.
# Prog obnizony 900->820 (T1 12.11, Pages padl 2x: 10.11k i 12.11d). Automat: tools/rotate_deploy3.sh.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
MB=$(git ls-tree -r -l HEAD | awk '{s+=$4} END{printf "%d", s/1048576}')
echo "deploy3 publikowane (HEAD): ${MB} MB"
if [ "$MB" -gt 820 ]; then
  echo "STOP PUSH: ${MB} MB > 820 MB (HARD; Pages padl przy ~894). Uruchom tools/rotate_deploy3.sh (APPLY=1) i powtorz."
  exit 1
fi
if [ "$MB" -ge 760 ]; then
  echo "WARN: ${MB} MB >= 760 MB -> rotacja do archiwum zalecana (uruchom: APPLY=1 tools/rotate_deploy3.sh)."
  if [ "${ROTATE_ACTIVE:-0}" != "1" ]; then
    echo "  podglad (dry-run) co by przeszlo do archiwum:"
    bash "$(dirname "$0")/rotate_deploy3.sh" || true
  fi
fi
echo "OK: ${MB} MB < 820 MB"
exit 0
