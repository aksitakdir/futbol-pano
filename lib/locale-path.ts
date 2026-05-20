/** TR ↔ EN path mapping for campaign hubs */
export function translatePathBetweenLocales(pathname: string, toEn: boolean): string {
  if (toEn) {
    if (pathname.startsWith("/dunya-kupasi-2026")) {
      return pathname
        .replace(/^\/dunya-kupasi-2026/, "/en/world-cup-2026")
        .replace(/\/listeler(\/|$)/, "/lists$1")
        .replace(/\/kadrolar(\/|$)/, "/squads$1");
    }
    if (pathname.startsWith("/transfer")) {
      return pathname
        .replace(/^\/transfer/, "/en/transfers")
        .replace(/\/listeler(\/|$)/, "/lists$1")
        .replace(/\/gidecek-mi(\/|$)/, "/will-they-go$1");
    }
    if (pathname === "/tr" || pathname === "/") return "/en";
    const enPath = pathname === "/tr" ? "" : pathname;
    return `/en${enPath}`;
  }

  if (pathname.startsWith("/en/world-cup-2026")) {
    return pathname
      .replace(/^\/en\/world-cup-2026/, "/dunya-kupasi-2026")
      .replace(/\/lists(\/|$)/, "/listeler$1")
      .replace(/\/squads(\/|$)/, "/kadrolar$1");
  }
  if (pathname.startsWith("/en/transfers")) {
    return pathname
      .replace(/^\/en\/transfers/, "/transfer")
      .replace(/\/lists(\/|$)/, "/listeler$1")
      .replace(/\/will-they-go(\/|$)/, "/gidecek-mi$1");
  }
  const trPath = pathname.replace(/^\/en/, "") || "/";
  return trPath === "/" ? "/tr" : trPath;
}
