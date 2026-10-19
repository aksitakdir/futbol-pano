#!/bin/bash
# Scout Gamer — build + raw-HTML check + commit + push + post-deploy check
# Kullanım: bash scripts/deploy.sh "commit mesajı"
# Mesaj verilmezse otomatik timestamp kullanılır.
#
# İki kapı (2026-10-19):
#   1. Push'tan ÖNCE: production build'i `next start` ile ayağa kaldırıp
#      scripts/seo-check.mjs'i ona karşı çalıştırır. Ham HTML'de link kaybı varsa
#      push yapılmaz. (`next dev` değil: dev, production'ın boş bıraktığı içeriği
#      gösterir ve hatayı gizler.)
#   2. Push'tan SONRA: Vercel'in yeni build'i yayına alana kadar bekler (sayfadaki
#      build id değişince) ve aynı kontrolü canlıya karşı çalıştırır. Vercel'in
#      build'i yereldekinden farklı olabilir (önbellek, ortam); asıl kanıt budur.

set -e

MSG="${1:-chore: deploy $(date '+%Y-%m-%d %H:%M')}"
SITE="https://www.scoutgamer.com"
PORT=3001

build_id() {
  curl -s "$SITE/lists" | grep -o '\\"b\\":\\"[A-Za-z0-9_-]*\\"' | head -1
}

echo ""
echo "▶  Build kontrol ediliyor..."
npm run build

echo ""
echo "▶  Ham HTML kontrolü (next start :$PORT)..."
npx next start -p "$PORT" > /dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 60); do
  curl -s -o /dev/null "http://localhost:$PORT/robots.txt" && break
  sleep 1
done
if ! node scripts/seo-check.mjs "http://localhost:$PORT"; then
  echo "✗  Ham HTML kontrolü geçmedi. Push yapılmadı."
  exit 1
fi
kill $SERVER 2>/dev/null || true
trap - EXIT

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

BEFORE="$(build_id)"
echo ""
echo "▶  GitHub'a push ediliyor..."
git push

echo ""
echo "▶  Vercel deploy'u bekleniyor (en fazla 15 dk)..."
for _ in $(seq 1 60); do
  NOW="$(build_id)"
  if [ -n "$NOW" ] && [ "$NOW" != "$BEFORE" ]; then
    echo "   yeni build yayında."
    echo ""
    echo "▶  Canlıda ham HTML kontrolü..."
    if node scripts/seo-check.mjs "$SITE"; then
      echo "✓  Tamamlandı. Deploy canlıda ve kontrolden geçti."
      exit 0
    fi
    echo "✗  Deploy canlıda ama kontrolden GEÇMEDİ. Vercel'de bir önceki deploy'a geri dönmeyi (Instant Rollback) düşün."
    exit 1
  fi
  sleep 15
done
echo "⚠  15 dakikada yeni build görünmedi. Vercel panelini kontrol et: https://vercel.com/dashboard"
exit 1
