import Link from "next/link";
import PageShell from "@/app/components/page-shell";

type Props = { locale?: string };

export default function HubCategoryLinks(_props: Props) {
  const links = [
    { href: "/radar", label: "Radar", desc: "Player analysis" },
    { href: "/lists", label: "Lists", desc: "Curated lists" },
    { href: "/tactics-lab", label: "Tactics Lab", desc: "Tactics & roles" },
    { href: "/arena", label: "Arena", desc: "Play & share" },
  ];

  return (
    <PageShell as="section" className="sg-page-shell--section hub-category-links">
      <div className="eyebrow" style={{ marginBottom: 12 }}>SITE WIDE</div>
      <h2 className="display hub-category-links__title">Main categories</h2>
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
