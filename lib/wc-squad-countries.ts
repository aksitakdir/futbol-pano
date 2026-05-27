export type WcCountry = { slug: string; nameTr: string; nameEn: string };

export const WC_COUNTRIES: WcCountry[] = [
  { slug: "turkiye", nameTr: "Türkiye", nameEn: "Turkey" },
  { slug: "turkey", nameTr: "Türkiye", nameEn: "Turkey" },
  { slug: "almanya", nameTr: "Almanya", nameEn: "Germany" },
  { slug: "germany", nameTr: "Almanya", nameEn: "Germany" },
  { slug: "ingiltere", nameTr: "İngiltere", nameEn: "England" },
  { slug: "england", nameTr: "İngiltere", nameEn: "England" },
  { slug: "fransa", nameTr: "Fransa", nameEn: "France" },
  { slug: "france", nameTr: "Fransa", nameEn: "France" },
  { slug: "brezilya", nameTr: "Brezilya", nameEn: "Brazil" },
  { slug: "brazil", nameTr: "Brezilya", nameEn: "Brazil" },
  { slug: "arjantin", nameTr: "Arjantin", nameEn: "Argentina" },
  { slug: "argentina", nameTr: "Arjantin", nameEn: "Argentina" },
  { slug: "ispanya", nameTr: "İspanya", nameEn: "Spain" },
  { slug: "spain", nameTr: "İspanya", nameEn: "Spain" },
  { slug: "abd", nameTr: "ABD", nameEn: "USA" },
  { slug: "usa", nameTr: "ABD", nameEn: "USA" },
  { slug: "meksika", nameTr: "Meksika", nameEn: "Mexico" },
  { slug: "mexico", nameTr: "Meksika", nameEn: "Mexico" },
  { slug: "kanada", nameTr: "Kanada", nameEn: "Canada" },
  { slug: "canada", nameTr: "Kanada", nameEn: "Canada" },
  { slug: "portekiz", nameTr: "Portekiz", nameEn: "Portugal" },
  { slug: "portugal", nameTr: "Portekiz", nameEn: "Portugal" },
  { slug: "hollanda", nameTr: "Hollanda", nameEn: "Netherlands" },
  { slug: "netherlands", nameTr: "Hollanda", nameEn: "Netherlands" },
  { slug: "italya", nameTr: "İtalya", nameEn: "Italy" },
  { slug: "italy", nameTr: "İtalya", nameEn: "Italy" },
  { slug: "belcika", nameTr: "Belçika", nameEn: "Belgium" },
  { slug: "belgium", nameTr: "Belçika", nameEn: "Belgium" },
];

const bySlug = new Map(WC_COUNTRIES.map((c) => [c.slug, c]));

export function resolveWcCountry(slug: string, locale: "tr" | "en"): { slug: string; name: string } | null {
  const row = bySlug.get(slug);
  if (!row) return null;
  return { slug: row.slug, name: locale === "tr" ? row.nameTr : row.nameEn };
}

export const WC_COUNTRIES_INDEX = WC_COUNTRIES.filter((c) =>
  ["turkey", "germany", "england", "france", "brazil", "argentina", "spain", "usa", "mexico", "canada", "portugal", "netherlands", "italy", "belgium"].includes(c.slug),
);
