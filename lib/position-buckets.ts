export type PositionBucket = "GK" | "DEF" | "MID" | "FWD";

const GK = new Set(["GK", "Goalkeeper"]);
const DEF = new Set([
  "CB", "LB", "RB", "LWB", "RWB", "Defender", "Center Back",
  "Right Back", "Left Back",
]);
const MID = new Set([
  "CM", "CDM", "CAM", "LM", "RM",
  "Midfielder", "Attacking Midfielder", "Defensive Midfielder",
]);
const FWD = new Set([
  "ST", "CF", "LW", "RW", "Forward", "Winger", "Striker",
  "Right Winger", "Left Winger",
]);

export function positionBucket(pos: string): PositionBucket {
  const p = pos?.trim() ?? "";
  if (GK.has(p)) return "GK";
  if (DEF.has(p)) return "DEF";
  if (MID.has(p)) return "MID";
  if (FWD.has(p)) return "FWD";
  const u = p.toUpperCase();
  if (u.includes("GOAL")) return "GK";
  if (u.includes("BACK") || u.includes("DEF")) return "DEF";
  if (u.includes("MID") || u.includes("WING") && u.includes("BACK")) return "MID";
  if (u.includes("ST") || u.includes("FOR") || u.includes("WING")) return "FWD";
  return "MID";
}

export const POSITION_BUCKET_ORDER: PositionBucket[] = ["GK", "DEF", "MID", "FWD"];

export function positionBucketLabel(bucket: PositionBucket): string {
  const labels: Record<PositionBucket, string> = {
    GK: "Goalkeepers",
    DEF: "Defenders",
    MID: "Midfielders",
    FWD: "Forwards",
  };
  return labels[bucket];
}
