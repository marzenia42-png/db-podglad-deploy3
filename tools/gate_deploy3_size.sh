#!/usr/bin/env bash
# BRAMKA ROZMIARU deploy3 (ZASADY_INDEX #151). Publikowane (HEAD) > 900 MB = STOP push.
# Powod: GitHub Pages limit 1 GB -> deploy pada "Page build failed" i NIC nowego sie nie serwuje.
# Uzycie: po commicie, przed push (recznie lub jako .git/hooks/pre-push).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
MB=$(git ls-tree -r -l HEAD | awk '{s+=$4} END{printf "%d", s/1048576}')
echo "deploy3 publikowane (HEAD): ${MB} MB"
if [ "$MB" -gt 900 ]; then
  echo "STOP PUSH: ${MB} MB > 900 MB (limit GitHub Pages 1 GB). Odchudz repo (stare wersje / base64->/_assets)."
  exit 1
fi
echo "OK: ${MB} MB < 900 MB"
exit 0
