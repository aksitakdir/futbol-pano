export type PositionBucket = "GK" | "DEF" | "MID" | "FWD";

const GK = new Set(["GK", "Goalkeeper", "Kaleci", "KL"]);
const DEF = new Set([
  "CB", "LB", "RB", "LWB", "RWB", "STP", "SB", "SĞB", "Defender", "Center Back",
  "Right Back", "Left Back", "Defans",
]);
const MID = new Set([
  "CM", "CDM", "CAM", "LM", "RM", "OMS", "DOS", "OOS", "SOL", "SAĞ",
  "Midfielder", "Attacking Midfielder", "Defensive Midfielder", "Orta Saha",
]);
const FWD = new Set([
  "ST", "CF", "LW", "RW", "SF", "SK", "Forward", "Winger", "Striker",
  "Right Winger", "Left Winger", "Forvet", "Kanat", "Santrafor",
]);

export function positionBucket(pos: string): PositionBucket {
  const p = pos?.trim() ?? "";
  if (GK.has(p)) return "GK";
  if (DEF.has(p)) return "DEF";
  if (MID.has(p)) return "MID";
  if (FWD.has(p)) return "FWD";
  const u = p.toUpperCase();
  if (u.includes("GOAL")) return "GK";
  if (u.includes("BACK") || u.includes("DEF") || u.includes("STP")) return "DEF";
  if (u.includes("MID") || u.includes("WING") && u.includes("BACK")) return "MID";
  if (u.includes("ST") || u.includes("FOR") || u.includes("WING")) return "FWD";
  return "MID";
}

export const POSITION_BUCKET_ORDER: PositionBucket[] = ["GK", "DEF", "MID", "FWD"];

export function positionBucketLabel(bucket: PositionBucket, locale: "tr" | "en"): string {
  const labels: Record<PositionBucket, { tr: string; en: string }> = {
    GK: { tr: "Kaleciler", en: "Goalkeepers" },
    DEF: { tr: "Defans", en: "Defenders" },
    MID: { tr: "Orta saha", en: "Midfielders" },
    FWD: { tr: "Forvet", en: "Forwards" },
  };
  return labels[bucket][locale];
}
