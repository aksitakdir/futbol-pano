// Her kategori için varsayılan görsel havuzu
// Unsplash ücretsiz görseller — ilerleyen dönemde Midjourney görselleriyle değiştirilecek

const CATEGORY_IMAGES: Record<string, string[]> = {
  radar: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc595a8fe3?w=800&q=80",
  ],
  listeler: [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
  ],
  "taktik-lab": [
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80",
    "https://images.unsplash.com/photo-1504016798967-59a258cca918?w=800&q=80",
  ],
};

export function getCategoryImage(category: string, seed?: string): string {
  const images = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES.radar;
  if (!images.length) return "";
  // Seed varsa (slug gibi) deterministik seç — aynı içerik hep aynı görseli göstersin
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return images[Math.abs(hash) % images.length];
  }
  return images[Math.floor(Math.random() * images.length)];
}
