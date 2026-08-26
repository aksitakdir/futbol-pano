/**
 * Pre-publish gate for Scout Gamer articles.
 *
 * SKILL.md tells the editor what to check. Prose does not stop anyone — the same
 * failures came back after each rule was written down. This file stops them.
 *
 * Every rule here exists because it already went wrong in production:
 *
 *   Endrick was written at Lyon a season after he left.      -> club drift
 *   Kosugi was written at Djurgarden 8 months after leaving.  -> club drift
 *   Endrick was written as 20 the month he turned 21.         -> age drift
 *   Lewis-Skelly was carded a left-back while being
 *     converted into a defensive midfielder.                  -> role vs frame
 *   Rico Lewis was carded a right-back while playing as a 8.  -> role vs frame
 *   Amorim was named at Man Utd months after being sacked;
 *     Guardiola at City after he left.                        -> manager drift
 *   A GBP 70m valuation came from an aggregator alone.        -> unsourced money
 *   Lewis Hall was written as a live pursuit from a report
 *     three weeks old that had since resolved.                -> stale source
 *   A FAQ shipped raw markdown that renders as literal text.  -> block hygiene
 *
 * The gate asks for declarations, not opinions. It cannot judge football — that
 * stays with the editor. It makes it impossible to skip the checks that are
 * mechanical, and impossible to publish a claim nobody looked up.
 */

// Position codes, matching how fc_players stores them. The one vocabulary both
// `position_frame` and `last_match_position` must speak.
const POSITIONS = [
  "GK", "RB", "LB", "RWB", "LWB", "CB",
  "CDM", "CM", "CAM", "RM", "LM",
  "RW", "LW", "CF", "ST",
];

const MAX_CHECK_AGE_DAYS = 30; // a player check older than this is not "current"
const MAX_STORY_AGE_DAYS = 7; // transfer stories resolve in days, not weeks

const MANAGER_HINTS =
  /\b(manager|head coach|boss|appointed|sacked|dismissed|takes charge|under (?:new )?(?:manager|coach))\b/i;

// EUR/GBP/USD amounts: "€80m", "GBP 70m", "$25 million", "€6.5m"
const MONEY_RE = /(?:[€£$]\s?\d[\d.,]*\s?(?:m|bn|million|billion)?)/gi;

function daysBetween(a, b) {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

function parseDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function blockText(b) {
  return [b.html, b.text, b.heading, b.title]
    .filter(Boolean)
    .concat((b.items ?? []).flatMap((i) => [i.q, i.a, typeof i === "string" ? i : ""]))
    .concat((b.stats ?? []).flatMap((s) => [s.value, s.label, s.note]))
    .concat([...(b.left?.items ?? []), ...(b.right?.items ?? [])])
    .filter(Boolean)
    .join(" ");
}

/**
 * @param {object}   args.brief         the brief JSON
 * @param {object[]} args.sectionsJson  parsed blocks
 * @param {object}   args.supabase      service-role client (may be null -> DB checks skipped)
 * @param {Date}     [args.today]
 */
export async function runPreflight({ brief, sectionsJson, supabase, today = new Date() }) {
  const blockers = [];
  const warnings = [];
  const notes = [];

  const blocks = sectionsJson ?? [];
  const fullText = blocks.map(blockText).join("\n");
  const verification = brief.verification ?? {};

  // ---- 1. every carded player must carry a dated, sourced check ------------
  const carded = blocks.filter((b) => b.type === "player").flatMap((b) =>
    String(b.name ?? "")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean),
  );

  // `role` invites a label and a label is what keeps going wrong.
  // `last_match_position` asks for an observation instead: where did he actually
  // line up the last time you looked? The frame check below runs on that, so a
  // player cannot pass by being *called* a full-back.
  const REQUIRED = ["club", "role", "last_match_position", "age", "source", "as_of"];

  for (const name of carded) {
    const row = verification[name];
    if (!row) {
      blockers.push(
        `verification missing for carded player "${name}". Add brief.verification["${name}"] ` +
          `with ${REQUIRED.join(", ")}.`,
      );
      continue;
    }
    for (const field of REQUIRED) {
      const v = row[field];
      if (v === undefined || v === null || String(v).trim() === "") {
        blockers.push(`verification["${name}"].${field} is empty.`);
      }
    }
    const asOf = parseDate(row.as_of);
    if (row.as_of && !asOf) {
      blockers.push(`verification["${name}"].as_of must be YYYY-MM-DD (got "${row.as_of}").`);
    } else if (asOf) {
      const age = daysBetween(today, asOf);
      if (age < 0) blockers.push(`verification["${name}"].as_of is in the future.`);
      else if (age > MAX_CHECK_AGE_DAYS) {
        blockers.push(
          `verification["${name}"] was checked ${age} days ago — re-verify (limit ${MAX_CHECK_AGE_DAYS}).`,
        );
      }
    }
  }

  for (const name of Object.keys(verification)) {
    if (!carded.includes(name)) {
      warnings.push(`verification["${name}"] has no @player: card in the markup.`);
    }
  }

  // ---- 2. the piece's position frame must match how players actually play --
  // This is the Lewis-Skelly / Rico Lewis gate. A position-framed piece may not
  // card a player whose declared real-world role is something else.
  // Both sides of this check are codes from POSITIONS, never prose. Free text
  // defeats the check: "central midfield (listed at right-back)" contains the
  // words "right back" and would sail through a substring match while saying
  // the opposite. A code cannot be talked around.
  const frameTerms = (Array.isArray(brief.position_frame)
    ? brief.position_frame
    : [brief.position_frame]
  )
    .map((t) => String(t ?? "").trim().toUpperCase())
    .filter(Boolean);
  const frame = frameTerms.join("/");

  for (const t of frameTerms) {
    if (!POSITIONS.includes(t)) {
      blockers.push(`position_frame "${t}" is not a position code. Use one of: ${POSITIONS.join(", ")}.`);
    }
  }

  if (frameTerms.length) {
    for (const name of carded) {
      const row = verification[name];
      const observed = String(row?.last_match_position ?? "").trim().toUpperCase();
      if (!observed) continue; // already blocked above
      if (!POSITIONS.includes(observed)) {
        blockers.push(
          `verification["${name}"].last_match_position must be a position code, not prose ` +
            `(got "${row.last_match_position}"). Use one of: ${POSITIONS.join(", ")}. ` +
            `Explain the nuance in .role.`,
        );
        continue;
      }
      if (frameTerms.includes(observed)) continue;

      // A player may stay against the frame, but only as a stated exception —
      // the divergence then has to be the point, not an oversight. This is the
      // Rico Lewis case: carded at right-back, deployed as a midfielder, kept
      // because that fact IS the article's argument.
      const why = String(row.frame_exception ?? "").trim();
      if (!why) {
        blockers.push(
          `"${name}" last played ${observed}, but this piece is framed ${frame}. Cut him, or set ` +
            `verification["${name}"].frame_exception explaining why the divergence is the point.`,
        );
      } else if (!norm(fullText).includes(norm(name))) {
        blockers.push(`"${name}" has a frame_exception but is not discussed in the article.`);
      } else {
        warnings.push(`"${name}" kept against the ${frame} frame (last played ${observed}): ${why}`);
      }
    }
  } else if (carded.length > 1) {
    notes.push(
      "brief.position_frame is not set — no role/frame check ran. Set it for any piece built " +
        "around one position.",
    );
  }

  // ---- 3. declared club/age vs the fc_players row (the DB drifts) ----------
  if (supabase && carded.length) {
    for (const name of carded) {
      const row = verification[name];
      if (!row) continue;
      const { data } = await supabase
        .from("fc_players")
        .select("name,club,age")
        .ilike("name", name)
        .limit(1)
        .maybeSingle();

      if (!data) {
        warnings.push(`"${name}" is not in fc_players — the player card will not render stats.`);
        continue;
      }
      // Club names are written differently in different places ("Newcastle" vs
      // "Newcastle Utd"), so containment either way counts as agreement. Only a
      // genuinely different club — the Kosugi case — reads as drift.
      const dbClub = norm(data.club);
      const myClub = norm(row.club);
      const clubDrift = !(dbClub && myClub && (dbClub.includes(myClub) || myClub.includes(dbClub)));
      const ageDrift = String(data.age) !== String(row.age);
      if ((clubDrift || ageDrift) && row.drift !== true) {
        const parts = [];
        if (clubDrift) parts.push(`club: fc_players says "${data.club}", you say "${row.club}"`);
        if (ageDrift) parts.push(`age: fc_players says ${data.age}, you say ${row.age}`);
        blockers.push(
          `"${name}" disagrees with fc_players (${parts.join("; ")}). If your check is right, ` +
            `set verification["${name}"].drift = true to record that the database is stale.`,
        );
      }
      if (row.drift === true && !clubDrift && !ageDrift) {
        warnings.push(`verification["${name}"].drift is set but fc_players agrees.`);
      }
    }
  }

  // ---- 4. anyone named as a manager must be checked ------------------------
  if (MANAGER_HINTS.test(fullText)) {
    const managers = brief.verification_managers;
    if (!Array.isArray(managers) || managers.length === 0) {
      blockers.push(
        "The article talks about managers/coaches but brief.verification_managers is empty. " +
          "List every manager named, as { name, club, as_of, source }.",
      );
    } else {
      managers.forEach((m, i) => {
        for (const f of ["name", "club", "as_of", "source"]) {
          if (!String(m?.[f] ?? "").trim()) {
            blockers.push(`verification_managers[${i}].${f} is empty.`);
          }
        }
        const d = parseDate(m?.as_of);
        if (m?.as_of && !d) blockers.push(`verification_managers[${i}].as_of must be YYYY-MM-DD.`);
        else if (d && daysBetween(today, d) > MAX_CHECK_AGE_DAYS) {
          blockers.push(`verification_managers[${i}] (${m.name}) check is stale — re-verify.`);
        }
        if (m?.name && !norm(fullText).includes(norm(m.name))) {
          warnings.push(`verification_managers: "${m.name}" is not mentioned in the article.`);
        }
      });
    }
  }

  // ---- 5. every money figure needs a named source --------------------------
  const money = [...new Set((fullText.match(MONEY_RE) ?? []).map((m) => m.replace(/\s+/g, "")))];
  if (money.length) {
    const sources = Array.isArray(brief.sources) ? brief.sources : [];
    const covered = norm(sources.map((s) => `${s.claim} ${s.source}`).join(" "));
    for (const amount of money) {
      const bare = norm(amount);
      if (!covered.includes(bare)) {
        blockers.push(
          `"${amount}" appears in the article with no entry in brief.sources. Add ` +
            `{ claim, source, as_of } — and if it only exists on an aggregator, cut it.`,
        );
      }
    }
    sources.forEach((s, i) => {
      for (const f of ["claim", "source", "as_of"]) {
        if (!String(s?.[f] ?? "").trim()) blockers.push(`sources[${i}].${f} is empty.`);
      }
      const d = parseDate(s?.as_of);
      if (s?.as_of && !d) blockers.push(`sources[${i}].as_of must be YYYY-MM-DD.`);
      else if (d && daysBetween(today, d) > MAX_STORY_AGE_DAYS) {
        blockers.push(
          `sources[${i}] ("${s.claim}") is ${daysBetween(today, d)} days old. Transfer stories ` +
            `resolve in days — search for what happened since, and write the latest state.`,
        );
      }
    });
  }

  // ---- 6. block hygiene the renderer cannot fix ----------------------------
  for (const b of blocks) {
    if (["faq", "vs", "stat-highlight", "list"].includes(b.type)) {
      const raw = blockText(b);
      if (/\[[^\]]+\]\([^)]+\)/.test(raw)) {
        blockers.push(
          `${b.type} block contains markdown link syntax, which renders as literal text. ` +
            `Move the link into a plain/callout/section block.`,
        );
      }
    }
  }

  const pullquotes = blocks.filter((b) => b.type === "pullquote").length;
  if (pullquotes > 1) blockers.push(`${pullquotes} pull quotes — the house rule is one.`);

  const last = blocks[blocks.length - 1];
  if (last && last.type === "plain") {
    blockers.push(
      "The article ends on a plain paragraph. Close on a pullquote, callout or other block.",
    );
  }

  // ---- 7. things the gate cannot check, printed so they are not forgotten --
  notes.push(
    "After publishing: confirm the page is in /sitemap.xml, that at least two published " +
      "articles link to it, and submit it in Search Console. A page with none of these stays " +
      "invisible no matter how good it is.",
  );

  return { blockers, warnings, notes };
}
