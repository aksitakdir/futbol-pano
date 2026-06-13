export function formatPlayerMetaLine(
  player: { club: string; league: string; position: string; age: string | number },
): string {
  const pos = String(player.position);
  const age = player.age != null && player.age !== "" ? `${player.age} YRS` : "";
  return [player.club, player.league, pos, age].filter(Boolean).join(" · ");
}
