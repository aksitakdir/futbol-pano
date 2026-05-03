#!/bin/bash
# Scout Gamer — build + commit + push
# Kullanım: bash scripts/deploy.sh "commit mesajı"
# Mesaj verilmezse otomatik timestamp kullanılır.

set -e

MSG="${1:-chore: deploy $(date '+%Y-%m-%d %H:%M')}"

echo ""
echo "▶  Build kontrol ediliyor..."
npm run build

echo ""
echo "▶  Değişiklikler stage'e alınıyor..."
git add .

# Commit edilecek bir şey yoksa sessizce çık
if git diff --cached --quiet; then
  echo "ℹ  Commit edilecek değişiklik yok. Push atlanıyor."
  exit 0
fi

echo "▶  Commit: $MSG"
git commit -m "$MSG"

echo ""
echo "▶  GitHub'a push ediliyor..."
git push

echo ""
echo "✓  Tamamlandı. Vercel deploy başladı → https://vercel.com/dashboard"
