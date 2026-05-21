/**
 * WC 2026 Kadro Çekme Script'i
 * API-Football → Supabase wc_squad_players
 *
 * Çalıştırma: node scripts/fetch-wc-squads.mjs
 * Onaylanan ID'ler: WC 2022 league endpoint + search endpoint ile doğrulandı.
 */

const API_KEY = "6bc2194fe42ad4adf233d4c11be131a6";
const SUPABASE_URL = "https://bfjpatsihrzlknrpghvm.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanBhdHNpaHJ6bGtucnBnaHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODk4NTUsImV4cCI6MjA4OTE2NTg1NX0.bz3pxGE7HBNQ39lRoO7rqbbZWnPnAcZRozJqWD7Etkc";

const API_BASE = "https://v3.football.api-sports.io";

// Verified API-Football national team IDs (confirmed via WC2022 league + search endpoints)
const TEAM_API_IDS = {
  // CONCACAF (6)
  abd: 2384,           // USA
  meksika: 16,         // Mexico
  kanada: 5529,        // Canada
  "kosta-rika": 29,    // Costa Rica
  panama: 11,          // Panama
  jamaika: 2385,       // Jamaica
  // CONMEBOL (6)
  brezilya: 6,         // Brazil
  arjantin: 26,        // Argentina
  uruguay: 7,          // Uruguay
  kolombiya: 8,        // Colombia
  ekvador: 2382,       // Ecuador
  paraguay: 2380,      // Paraguay
  // UEFA (18)
  almanya: 25,         // Germany
  fransa: 2,           // France
  ingiltere: 10,       // England
  ispanya: 9,          // Spain
  portekiz: 27,        // Portugal
  hollanda: 1118,      // Netherlands
  belcika: 1,          // Belgium
  italya: 768,         // Italy
  hirvatistan: 3,      // Croatia
  isvicre: 15,         // Switzerland
  avusturya: 775,      // Austria
  norvec: 1090,        // Norway
  danimarka: 21,       // Denmark
  turkiye: 777,        // Turkey
  polonya: 24,         // Poland
  ukrayna: 772,        // Ukraine
  irlanda: 776,        // Rep. of Ireland
  cekya: 770,          // Czech Republic
  // CAF (9)
  fas: 31,             // Morocco
  senegal: 13,         // Senegal
  misir: 32,           // Egypt
  nijerya: 19,         // Nigeria
  cezayir: 1532,       // Algeria
  tunus: 28,           // Tunisia
  kamerun: 1530,       // Cameroon
  gana: 1504,          // Ghana
  "guney-afrika": 1531, // South Africa
  // AFC (8)
  japonya: 12,         // Japan
  "guney-kore": 17,    // South Korea
  avustralya: 20,      // Australia
  "suudi-arabistan": 23, // Saudi Arabia
  iran: 22,            // Iran
  katar: 1569,         // Qatar
  urdun: 1548,         // Jordan
  ozbekistan: 1568,    // Uzbekistan
  // OFC (1)
  "yeni-zelanda": 4673, // New Zealand
};

// Position mapping: API-Football long form → our short code
// API-Football returns: "Goalkeeper" | "Defender" | "Midfielder" | "Attacker"
function mapPosition(pos) {
  if (!pos) return "CM";
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("defender")) return "CB";
  if (p.includes("midfielder")) return "CM";
  if (p.includes("attacker") || p.includes("forward")) return "ST";
  return "CM";
}

// DB constraint: "GK" | "DEF" | "MID" | "FWD" (uppercase)
function positionBucket(pos) {
  if (!pos) return "MID";
  const p = pos.toUpperCase();
  if (p === "GK") return "GK";
  if (["CB", "RB", "LB", "RWB", "LWB", "SW", "DEF"].includes(p)) return "DEF";
  if (["ST", "CF", "LW", "RW", "SS"].includes(p)) return "FWD";
  return "MID";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io",
    },
  });
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors?.rateLimit) throw new Error("RATE_LIMIT: " + data.errors.rateLimit);
  return data;
}

async function fetchSquadForTeam(teamApiId) {
  const data = await apiGet(`/players/squads?team=${teamApiId}`);
  if (!data.response?.length) return [];
  const squad = data.response[0]?.players ?? [];
  return squad.map((p) => {
    const pos = mapPosition(p.position);
    return {
      player_name: p.name,
      position: pos,
      position_bucket: positionBucket(pos),
      club: "",           // squad endpoint doesn't include club; can be enriched later
      sort_order: p.number ?? 99,
      overall_override: null,
    };
  });
}

async function getExistingCount(teamSlug) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wc_squad_players?team_slug=eq.${encodeURIComponent(teamSlug)}&select=id`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
    }
  );
  const cr = res.headers.get("content-range");
  if (!cr) return 0;
  const total = cr.split("/")[1];
  return total === "*" ? 0 : parseInt(total, 10);
}

async function saveToSupabase(teamSlug, players) {
  // Delete existing rows for this team
  const delRes = await fetch(
    `${SUPABASE_URL}/rest/v1/wc_squad_players?team_slug=eq.${encodeURIComponent(teamSlug)}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!delRes.ok) {
    const err = await delRes.text();
    throw new Error(`Supabase DELETE failed: ${err}`);
  }
  if (players.length === 0) return;

  // Deduplicate by player_name (API sometimes returns same abbreviated name twice)
  const seen = new Set();
  const unique = players.filter((p) => {
    if (seen.has(p.player_name)) return false;
    seen.add(p.player_name);
    return true;
  });

  const payload = unique.map((p) => ({ team_slug: teamSlug, ...p }));

  const insRes = await fetch(`${SUPABASE_URL}/rest/v1/wc_squad_players`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!insRes.ok) {
    const err = await insRes.text();
    throw new Error(`Supabase INSERT failed: ${err}`);
  }
  return unique.length;
}

async function checkApiLimit() {
  const data = await apiGet("/status");
  const req = data.response?.requests;
  if (req) {
    console.log(`API quota: ${req.current} used / ${req.limit_day} daily limit`);
    return req.limit_day - req.current;
  }
  return 99;
}

async function main() {
  console.log("=== WC 2026 Squad Fetch ===\n");

  let remaining = 99;
  try {
    remaining = await checkApiLimit();
    console.log(`Remaining requests: ${remaining}\n`);
  } catch (e) {
    console.warn("Could not check quota:", e.message);
  }

  const slugs = Object.keys(TEAM_API_IDS);
  console.log(`Processing ${slugs.length} teams (6–7 sec delay between calls for rate limit)...\n`);

  const results = { ok: [], failed: [], skipped: [] };
  let callsUsed = 1; // 1 for status check above

  for (const slug of slugs) {
    if (callsUsed >= remaining) {
      console.log(`⚠️  Daily limit reached. Skipping remaining.`);
      results.skipped.push(slug);
      continue;
    }

    const apiId = TEAM_API_IDS[slug];
    process.stdout.write(`  ${slug.padEnd(20)} (id:${String(apiId).padStart(5)}) ... `);

    try {
      // Skip teams that already have enough data
      const existing = await getExistingCount(slug);
      if (existing >= 10) {
        console.log(`⏭  already has ${existing} players, skipping`);
        results.skipped.push(slug);
        continue;
      }

      const players = await fetchSquadForTeam(apiId);
      callsUsed++;

      if (players.length === 0) {
        console.log("no squad data");
        results.skipped.push(slug);
        await sleep(6200);
        continue;
      }

      const saved = await saveToSupabase(slug, players);
      console.log(`✓ ${saved} players saved`);
      results.ok.push({ slug, count: saved });
    } catch (err) {
      if (err.message.startsWith("RATE_LIMIT")) {
        console.log(`⏱  rate limited — waiting 60s...`);
        await sleep(62000);
        // Retry once
        try {
          const players = await fetchSquadForTeam(apiId);
          callsUsed++;
          await saveToSupabase(slug, players);
          console.log(`  ✓ retry ok: ${players.length} players`);
          results.ok.push({ slug, count: players.length });
        } catch (e2) {
          console.log(`  ✗ retry failed: ${e2.message}`);
          results.failed.push({ slug, error: e2.message });
        }
      } else {
        console.log(`✗ ${err.message}`);
        results.failed.push({ slug, error: err.message });
      }
    }

    // Rate limit: 10 calls/min → wait 6.2s between calls
    await sleep(6200);
  }

  console.log("\n=== Summary ===");
  console.log(`✓ Saved:   ${results.ok.length} teams`);
  console.log(`✗ Failed:  ${results.failed.length} teams`);
  console.log(`⏭  Skipped: ${results.skipped.length} teams`);

  if (results.failed.length > 0) {
    console.log("\nFailed:");
    results.failed.forEach(({ slug, error }) => console.log(`  - ${slug}: ${error}`));
  }
  if (results.ok.length > 0) {
    console.log("\nSaved teams:");
    results.ok.forEach(({ slug, count }) => console.log(`  ✓ ${slug}: ${count} players`));
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
