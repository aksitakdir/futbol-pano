import { createClient } from "@/lib/supabase";
import { categoryArticlePath } from "@/lib/category-config";
import { getCategoryImage } from "@/lib/category-images";
import { articleExcerpt } from "@/lib/article-excerpt";
import { extractArticleHighlights } from "@/lib/content-highlight-tags";
import { normalizeCoverStories, orderWithCoverPin, COVER_STORY_SETTINGS_KEY } from "@/lib/cover-story";
import { arenaPath } from "@/lib/arena-brackets";
import {
  DEFAULT_HERO_SLIDER,
  enabledHeroCategories,
  normalizeCustomSlides,
  normalizeHeroSlider,
  normalizeRecentCount,
} from "@/lib/site-settings";
import type { PlayerCardData } from "@/app/components/player-card";

/**
 * Everything the homepage shows, fetched on the server (P3, 2026-10-20).
 *
 * WHY: the homepage was one client component whose hero slider, "Latest content"
 * carousel, "All articles" grid, featured player and "On our radar" cards all
 * waited on useEffect fetches. Googlebot's first pass got "LOADING..." where they
 * belong, and the only article links in the body were the In Focus block's. The
 * page now renders from this data, and the client component keeps only the
 * interactivity (slider timer, carousel paging).
 *
 * Randomness is seeded, so a render is reproducible and the labels are true:
 * "Player of the Week" changes by ISO week, the radar cards and the hero's arena
 * slide by day. Only finished strings and numbers leave this file: no article body
 * reaches the page payload.
 */

export type HomeArticle = {
  id: string;
  href: string;
  title: string;
  category: string;
  image: string;
  dateShort: string;
};
export type HomeHeroSlide =
  | { kind: "content"; key: string; article: HomeArticle; excerpt: string }
  | { kind: "arena"; key: string; title: string; teaser: string; href: string }
  | { kind: "wc"; key: string; title: string; teaser: string; href: string; eyebrow: string }
  | { kind: "custom"; key: string; title: string; teaser: string; href: string; eyebrow: string; image?: string };
export type HomeRecent = HomeArticle & { pills: string[] };
export type HomeData = {
  slides: HomeHeroSlide[];
  recent: HomeRecent[];
  latest: HomeArticle[];
  featured: (PlayerCardData & { description: string }) | null;
  radar: PlayerCardData[];
};

type Row = {
  id: string | number;
  title: string;
  title_en: string | null;
  slug: string;
  category: string;
  content: string | null;
  content_en: string | null;
  created_at: string;
  cover_image: string | null;
};
type PoolEntry = { name: string; club?: string; league?: string; position?: string; age?: string | number; description?: string; why_watch?: string };
type Stats = Omit<PlayerCardData, "name" | "club" | "league" | "position" | "age" | "whyWatch"> & { name: string };

const ROW_SELECT = "id,title,title_en,slug,category,content,content_en,created_at,cover_image";
const LATEST = 12;

// ── seeded randomness ───────────────────────────────────────────────────────────
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7);
  return `${year}-W${week}`;
}

// ── shaping ──────────────────────────────────────────────────────────────────────
const titleOf = (r: Row) => r.title_en || r.title;
const dateShort = (iso: string) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
const toArticle = (r: Row): HomeArticle => ({
  id: String(r.id),
  href: categoryArticlePath(r.category, r.slug),
  title: titleOf(r),
  category: r.category,
  image: r.cover_image?.trim() || getCategoryImage(r.category, r.slug),
  dateShort: dateShort(r.created_at),
});

/**
 * The hero's article slides, as the client page chose them: the homepage pin first,
 * then up to two from the last 7 days, then the last 30 days, then the rest at
 * random (seeded by day), repeating if there are too few.
 */
function heroArticles(all: Row[], count: number, pinnedId: string | undefined, rand: () => number, now: number): Row[] {
  if (!all.length || count <= 0) return [];
  const ms7 = 7 * 86_400_000;
  const ms30 = 30 * 86_400_000;
  const byNewest = [...all].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const picked: Row[] = [];
  const used = new Set<string>();
  const take = (r: Row) => { picked.push(r); used.add(String(r.id)); };
  const pinned = pinnedId ? all.find((r) => String(r.id) === pinnedId) : undefined;
  if (pinned) take(pinned);
  for (const r of byNewest) {
    if (picked.length >= 2) break;
    if (!used.has(String(r.id)) && Date.parse(r.created_at) >= now - ms7) take(r);
  }
  for (const r of byNewest) {
    if (picked.length >= count) break;
    if (!used.has(String(r.id)) && Date.parse(r.created_at) >= now - ms30) take(r);
  }
  for (const r of shuffled(byNewest.filter((r) => !used.has(String(r.id))), rand)) {
    if (picked.length >= count) break;
    take(r);
  }
  const pool = picked.length ? [...picked] : byNewest;
  for (let i = 0; picked.length < count && pool.length; i++) picked.push(pool[i % pool.length]);
  return picked.slice(0, count);
}

export async function getHomeData(now = new Date()): Promise<HomeData> {
  const supabase = createClient();
  const day = now.toISOString().slice(0, 10);
  const { data: settingRows, error: settingsError } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["hero_slider", "recent_count", "hero_custom_slides", COVER_STORY_SETTINGS_KEY, "form_players_pool"]);
  if (settingsError) throw settingsError;
  const setting = (k: string) => settingRows?.find((r) => r.key === k)?.value;

  const hero = setting("hero_slider") ? normalizeHeroSlider(setting("hero_slider")) : { ...DEFAULT_HERO_SLIDER };
  const recentCount = setting("recent_count") ? normalizeRecentCount(setting("recent_count")) : 6;
  const customSlides = normalizeCustomSlides(setting("hero_custom_slides"));
  const pinnedId = normalizeCoverStories(setting(COVER_STORY_SETTINGS_KEY)).homepage;
  const categories = enabledHeroCategories(hero);

  const [heroRes, recentRes, arenaRes, pinnedRes] = await Promise.all([
    supabase.from("contents").select(ROW_SELECT).eq("status", "published")
      .in("category", categories.length ? categories : ["radar"])
      .order("created_at", { ascending: false }).limit(Math.max(recentCount * 3, 24)),
    supabase.from("contents").select(ROW_SELECT).eq("status", "published")
      .order("created_at", { ascending: false }).limit(recentCount + LATEST),
    supabase.from("arena_games").select("slug,hero_title_en,hero_teaser_en").eq("status", "published"),
    pinnedId
      ? supabase.from("contents").select(ROW_SELECT).eq("id", pinnedId).eq("status", "published").maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  for (const r of [heroRes, recentRes, arenaRes, pinnedRes]) if (r.error) throw r.error;

  // ── hero ──
  let heroRows = (heroRes.data ?? []) as Row[];
  const pinnedRow = pinnedRes.data as Row | null;
  if (pinnedRow) heroRows = [pinnedRow, ...heroRows.filter((r) => String(r.id) !== String(pinnedRow.id))];
  heroRows = orderWithCoverPin(heroRows, pinnedId);
  const heroRand = seeded(`hero:${day}`);
  const slides: HomeHeroSlide[] = heroArticles(heroRows, hero.sliderCount ?? 5, pinnedId, heroRand, now.getTime()).map((r, i) => ({
    kind: "content",
    key: `${r.id}-${i}`,
    article: toArticle(r),
    excerpt: articleExcerpt(r.content_en || r.content || "", { max: 140, title: titleOf(r) }),
  }));
  if (hero.wcPromo) {
    slides.unshift({ kind: "wc", key: "wc-2026-promo", eyebrow: "FIFA WORLD CUP 2026", title: "World Cup 2026", teaser: "Match schedule, squads, and scout analysis — June 11 to July 19, 2026.", href: "/world-cup-2026" });
  }
  for (const cs of customSlides.filter((s) => s.enabled && s.title && s.href)) {
    slides.splice(Math.min(1, slides.length), 0, { kind: "custom", key: cs.id, title: cs.title, teaser: cs.teaser, href: cs.href, eyebrow: cs.eyebrow || "FEATURED", image: cs.image });
  }
  const games = (arenaRes.data ?? []) as { slug: string; hero_title_en: string; hero_teaser_en: string }[];
  if (hero.arena && games.length) {
    const g = games[Math.floor(heroRand() * games.length)];
    slides.splice(Math.floor(heroRand() * (slides.length + 1)), 0, { kind: "arena", key: `arena-${g.slug}`, title: g.hero_title_en, teaser: g.hero_teaser_en, href: arenaPath(g.slug) });
  }

  // ── carousel and the grid below it (the grid starts after the carousel's last item, so
  // nothing repeats; a 9th carousel item is reached by paging, and from its own hub) ──
  const recentRows = (recentRes.data ?? []) as Row[];
  const recent: HomeRecent[] = recentRows.slice(0, recentCount).map((r) => ({
    ...toArticle(r),
    pills: extractArticleHighlights(r.content_en || r.content || "", { max: 3, seed: r.slug, titleHint: titleOf(r) }),
  }));
  const latest = recentRows.slice(recentCount, recentCount + LATEST).map(toArticle);

  // ── players: identity from the verified pool, numbers from the game ──
  let pool: PoolEntry[] = [];
  try {
    const parsed = JSON.parse(String(setting("form_players_pool") ?? "[]"));
    if (Array.isArray(parsed)) pool = parsed.filter((p) => p?.name);
  } catch { /* an unreadable pool shows no player sections */ }
  let featured: HomeData["featured"] = null;
  let radar: PlayerCardData[] = [];
  if (pool.length) {
    // Names in the pool match fc_players exactly (scripts/form-pool.mjs checks it).
    const { data: statRows, error: statsError } = await supabase
      .from("fc_players")
      .select("name,overall,pace,shooting,passing,dribbling,defending,physical,photo_url")
      .in("name", pool.map((p) => p.name));
    if (statsError) throw statsError;
    const stats = new Map(((statRows ?? []) as Stats[]).map((s) => [s.name.toLowerCase(), s]));
    const card = (p: PoolEntry): PlayerCardData | null => {
      const s = stats.get(p.name.toLowerCase());
      if (!s?.overall) return null;
      return {
        name: p.name, club: p.club ?? "", league: p.league ?? "", position: p.position ?? "", age: String(p.age ?? ""),
        overall: s.overall, pace: s.pace ?? 0, shooting: s.shooting ?? 0, passing: s.passing ?? 0,
        dribbling: s.dribbling ?? 0, defending: s.defending ?? 0, physical: s.physical ?? 0,
        photo_url: s.photo_url ?? undefined, whyWatch: p.why_watch ?? "",
      };
    };
    const ready = pool.filter((p) => card(p));
    const week = ready.length ? shuffled(ready, seeded(`featured:${isoWeek(now)}`))[0] : null;
    if (week) featured = { ...card(week)!, description: week.description ?? "" };
    // The week's player is not repeated among the radar cards below it.
    radar = shuffled(ready.filter((p) => p !== week), seeded(`radar:${day}`)).slice(0, 10).map((p) => card(p)!);
  }

  return { slides, recent, latest, featured, radar };
}
