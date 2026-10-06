/**
 * sections_json → one HTML string for the legacy `content_en` column.
 *
 * WHY: every card, category page and the RSS feed build their snippet and
 * "FROM CONTENT" pills from `content_en`. The admin editor used to write an
 * empty `<p></p>` there for block articles, so 88 of 124 published articles
 * had no card pills and no card excerpt (found 2026-10-06). The page itself
 * always renders from sections_json; this column is only ever read for
 * snippets, so it holds a faithful text copy of the blocks.
 *
 * Plain .mjs so the admin panel (TypeScript) and scripts/backfill-content-en.mjs
 * share one implementation.
 */

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Text fields of plain / pullquote / list / faq blocks already hold inline HTML
 * (<strong>, <a>) — SectionsJsonBody renders them unescaped, so this does too.
 * Markdown bold is converted so the pill extractor sees one form.
 */
const inline = (s) => String(s ?? "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

const para = (text) =>
  String(text ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inline(p.replace(/\n/g, " "))}</p>`)
    .join("\n");

/**
 * @param {unknown} blocks sections_json
 * @returns {string} HTML, or "" when there is nothing to copy
 */
export function sectionsToHtml(blocks) {
  if (!Array.isArray(blocks)) return "";
  const out = [];

  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    switch (b.type) {
      case "intro":
      case "callout":
        if (b.html?.trim()) out.push(b.html.trim());
        break;
      case "section":
        if (b.heading?.trim()) out.push(`<h2>${esc(b.heading.trim())}</h2>`);
        if (b.html?.trim()) out.push(b.html.trim());
        break;
      // Short group headings ("Playing", "Generous") would become card pills; keep them as prose.
      case "header":
        if (b.heading?.trim()) out.push(`<p>${esc(b.heading.trim())}</p>`);
        break;
      case "plain":
        if (b.text?.trim()) out.push(para(b.text));
        break;
      case "pullquote":
        if (b.text?.trim()) out.push(`<blockquote><p>${inline(b.text.trim())}</p></blockquote>`);
        break;
      case "list": {
        const items = (b.items ?? []).filter((i) => String(i).trim());
        if (items.length) {
          const tag = b.style === "ol" ? "ol" : "ul";
          out.push(`<${tag}>${items.map((i) => `<li>${inline(i)}</li>`).join("")}</${tag}>`);
        }
        break;
      }
      case "faq":
        for (const it of b.items ?? []) {
          if (it?.q?.trim() && it?.a?.trim()) out.push(`<h3>${esc(it.q.trim())}</h3>\n<p>${inline(it.a.trim())}</p>`);
        }
        break;
      // Stat cards and table rows are written as <p>, not <li>: the pill extractor treats
      // every short <li> as a candidate, and "16 Days" is not a pill.
      case "stat-highlight": {
        const stats = (b.stats ?? []).filter((s) => s?.value);
        if (stats.length) {
          out.push(stats.map((s) => `<p>${esc(s.value)} ${esc(s.label ?? "")}${s.note ? ` — ${esc(s.note)}` : ""}</p>`).join("\n"));
        }
        break;
      }
      case "vs":
        for (const side of [b.left, b.right]) {
          if (side?.title) out.push(`<p>${esc(side.title)}: ${(side.items ?? []).map(inline).join("; ")}</p>`);
        }
        break;
      case "table":
        if (Array.isArray(b.rows) && b.rows.length) {
          if (b.caption) out.push(`<p>${inline(b.caption)}</p>`);
          out.push(b.rows.map((r) => `<p>${r.map(esc).join(" · ")}</p>`).join("\n"));
        }
        break;
      // player, image, youtube, divider: no prose to copy
      default:
        break;
    }
  }

  return out.join("\n");
}
