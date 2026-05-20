/** Pozisyon etiketleri — ana sayfa radar bloğu ile aynı TR sözlük */
export function translatePositionTr(pos: string): string {
  const map: Record<string, string> = {
    Forward: "Forvet",
    Winger: "Kanat",
    Midfielder: "Orta Saha",
    "Attacking Midfielder": "Ofansif OS",
    "Defensive Midfielder": "Defansif OS",
    Defender: "Defans",
    "Center Back": "Stoper",
    "Right Back": "Sağ Bek",
    "Left Back": "Sol Bek",
    Goalkeeper: "Kaleci",
    "Right Winger": "Sağ Kanat",
    "Left Winger": "Sol Kanat",
    Striker: "Santrafor",
    CAM: "OOS",
    CM: "OMS",
    CDM: "DOS",
    LM: "SOL",
    RM: "SAĞ",
    LB: "SB",
    RB: "SĞB",
    CB: "STP",
    GK: "KL",
    LW: "SK",
    RW: "SK",
    ST: "SF",
  };
  const t = pos?.trim() ?? "";
  return map[t] ?? t;
}

export function formatPlayerMetaLine(
  player: { club: string; league: string; position: string; age: string | number },
  locale: "tr" | "en",
): string {
  const pos = locale === "tr" ? translatePositionTr(String(player.position)) : String(player.position);
  const ageSuffix = locale === "tr" ? "YAŞ" : "YRS";
  const age = player.age != null && player.age !== "" ? `${player.age} ${ageSuffix}` : "";
  return [player.club, player.league, pos, age].filter(Boolean).join(" · ");
}
