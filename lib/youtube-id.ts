/** Güvenli iframe için izin verilen YouTube video kimliği formatı */
const VALID_ID = /^[a-zA-Z0-9_-]{6,64}$/;

/**
 * Panelden gelen ham metinden YouTube video ID çıkarır.
 * Tam URL, kısa youtu.be, embed/shorts veya düz ID kabul eder.
 */
export function normalizeYoutubeId(raw?: string | null): string | null {
  const s = raw?.trim();
  if (!s) return null;

  if (VALID_ID.test(s)) return s;

  let candidate = s;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const u = new URL(candidate);
    const host = u.hostname.replace(/^www\./i, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0] ?? "";
      if (VALID_ID.test(id)) return id;
    }

    const v = u.searchParams.get("v");
    if (v && VALID_ID.test(v)) return v;

    const pathParts = u.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "embed" && pathParts[1] && VALID_ID.test(pathParts[1])) return pathParts[1];
    if (pathParts[0] === "shorts" && pathParts[1] && VALID_ID.test(pathParts[1])) return pathParts[1];

    if (host.endsWith("youtube.com") && pathParts[0] === "live" && pathParts[1] && VALID_ID.test(pathParts[1])) {
      return pathParts[1];
    }
  } catch {
    /* ignore */
  }

  return null;
}
