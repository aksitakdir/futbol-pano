/**
 * İngilizce / API pozisyon etiketlerini Türkçe gösterim için çevirir.
 * `app/page.tsx` içindeki `translatePosition` ile aynı map kalmalı.
 */
export function translatePosition(pos: string): string {
  const map: Record<string, string> = {
    Forward: "Forvet",
    Winger: "Kanat",
    Midfielder: "Orta Saha",
    "Attacking Midfielder": "Ofansif Orta Saha",
    "Defensive Midfielder": "Defansif Orta Saha",
    Defender: "Defans",
    "Center Back": "Stoper",
    "Right Back": "Sağ Bek",
    "Left Back": "Sol Bek",
    Goalkeeper: "Kaleci",
    "Right Winger": "Sağ Kanat",
    "Left Winger": "Sol Kanat",
    Striker: "Santrafor",
  };
  const t = pos.trim();
  return map[t] ?? pos;
}
