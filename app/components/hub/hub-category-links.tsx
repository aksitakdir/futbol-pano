import Link from "next/link";
import PageShell from "@/app/components/page-shell";
import type { HubLocale } from "@/lib/hub-config";

type Props = { locale: HubLocale };

export default function HubCategoryLinks({ locale }: Props) {
  const base = locale === "en" ? "/en" : "";
  const copy =
    locale === "tr"
      ? { eyebrow: "SİTE GENELİ", title: "Ana kategoriler" }
      : { eyebrow: "SITE WIDE", title: "Main categories" };

  const links =
    locale === "tr"
      ? [
          { href: `${base}/radar`, label: "Radar", desc: "Oyuncu analizleri" },
          { href: `${base}/listeler`, label: "Listeler", desc: "Kürasyonlu listeler" },
          { href: `${base}/taktik-lab`, label: "Taktik Lab", desc: "Taktik ve rol" },
          { href: `${base}/arena`, label: "Arena", desc: "Oyna ve paylaş" },
        ]
      : [
          { href: `${base}/radar`, label: "Radar", desc: "Player analysis" },
          { href: `${base}/listeler`, label: "Lists", desc: "Curated lists" },
          { href: `${base}/taktik-lab`, label: "Tactics Lab", desc: "Tactics & roles" },
          { href: `${base}/arena`, label: "Arena", desc: "Play & share" },
        ];

  return (
    <PageShell as="section" className="sg-page-shell--section hub-category-links">
      <div className="eyebrow" style={{ marginBottom: 12 }}>
        {copy.eyebrow}
      </div>
      <h2 className="display hub-category-links__title">{copy.title}</h2>
      <ul className="hub-category-links__grid">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hub-category-links__card lift">
              <span className="display hub-category-links__label">{l.label}</span>
              <span className="mono hub-category-links__desc">{l.desc}</span>
              <span className="mono hub-category-links__arrow">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
