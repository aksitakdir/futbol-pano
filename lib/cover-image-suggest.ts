/**
 * Topic-aware cover image suggestion.
 *
 * Maps football keywords/topics to curated high-quality Unsplash photos.
 * Matching is keyword-based against the article title and slug.
 */

type TopicImages = { keywords: string[]; images: string[] };

const TOPIC_POOL: TopicImages[] = [
  // ── Tactics / formations / strategy ──
  {
    keywords: ["tactic", "formation", "system", "pressing", "press", "gegenpress", "build-up", "transition", "positional", "rotation"],
    images: [
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80",
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1200&q=80",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80",
    ],
  },
  // ── Strikers / forwards / goals ──
  {
    keywords: ["striker", "forward", "goal", "scoring", "false-9", "false 9", "number 9", "centre-forward", "target man", "poacher"],
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=80",
    ],
  },
  // ── Midfield / box-to-box / playmaker ──
  {
    keywords: ["midfield", "box-to-box", "engine", "playmaker", "regista", "mezzala", "pivot", "deep-lying", "number 8", "number 10"],
    images: [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1504016798967-59a258cca918?w=1200&q=80",
    ],
  },
  // ── Defence / centre-back / defending ──
  {
    keywords: ["defender", "defence", "defense", "centre-back", "center-back", "cb", "ball-playing", "sweeper", "libero", "backline"],
    images: [
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&q=80",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80",
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1200&q=80",
    ],
  },
  // ── Wingers / wide players ──
  {
    keywords: ["winger", "inverted", "wide", "flank", "wing", "dribbl", "crossing"],
    images: [
      "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=1200&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80",
    ],
  },
  // ── Full-backs / wing-backs ──
  {
    keywords: ["fullback", "full-back", "wing-back", "wingback", "overlap", "underlap", "inverted fullback"],
    images: [
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80",
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
    ],
  },
  // ── Transfer / market / signings ──
  {
    keywords: ["transfer", "signing", "deal", "market", "fee", "contract", "loan", "deadline", "free agent"],
    images: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80",
    ],
  },
  // ── World Cup / international ──
  {
    keywords: ["world cup", "wc-2026", "international", "national team", "tournament", "squad", "roster", "group stage", "knockout"],
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80",
      "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200&q=80",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=80",
    ],
  },
  // ── Stadium / pitch / atmosphere ──
  {
    keywords: ["stadium", "pitch", "arena", "atmosphere", "fans", "crowd", "matchday"],
    images: [
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80",
      "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200&q=80",
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&q=80",
    ],
  },
  // ── Youth / academy / emerging talent ──
  {
    keywords: ["young", "youth", "academy", "talent", "wonderkid", "breakout", "prospect", "u21", "emerging", "next generation"],
    images: [
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80",
      "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=1200&q=80",
      "https://images.unsplash.com/photo-1504016798967-59a258cca918?w=1200&q=80",
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80",
    ],
  },
  // ── Goalkeeper ──
  {
    keywords: ["goalkeeper", "keeper", "gk", "shot-stopper", "sweeper keeper", "distribution"],
    images: [
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80",
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
    ],
  },
  // ── Manager / coaching / leadership ──
  {
    keywords: ["manager", "coach", "mourinho", "guardiola", "klopp", "ancelotti", "arteta", "leadership", "philosophy"],
    images: [
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80",
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=1200&q=80",
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
    ],
  },
  // ── Lists / rankings / comparison ──
  {
    keywords: ["list", "rank", "top", "best", "comparison", "versus", "debate"],
    images: [
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&q=80",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1200&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
    ],
  },
  // ── Analysis / data / stats ──
  {
    keywords: ["analysis", "data", "stat", "xg", "metric", "performance", "scout", "radar"],
    images: [
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80",
      "https://images.unsplash.com/photo-1504016798967-59a258cca918?w=1200&q=80",
    ],
  },
  // ── Training / fitness ──
  {
    keywords: ["training", "fitness", "pre-season", "drill", "warm-up", "conditioning"],
    images: [
      "https://images.unsplash.com/photo-1504016798967-59a258cca918?w=1200&q=80",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=80",
      "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=1200&q=80",
    ],
  },
  // ── Partnership / duo / chemistry ──
  {
    keywords: ["partnership", "duo", "chemistry", "combination", "link-up", "pair"],
    images: [
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=1200&q=80",
    ],
  },
];

/** Generic football fallback images */
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&q=80",
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80",
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Score each topic against the article text and pick the best image.
 * Returns a deterministic image URL based on the slug (so same article = same image).
 */
export function suggestCoverImage(title: string, slug: string, category?: string): string {
  const text = `${title} ${slug} ${category ?? ""}`.toLowerCase();

  let bestScore = 0;
  let bestPool: string[] = FALLBACK_IMAGES;

  for (const topic of TOPIC_POOL) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (text.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPool = topic.images;
    }
  }

  const idx = hashString(slug) % bestPool.length;
  return bestPool[idx];
}
