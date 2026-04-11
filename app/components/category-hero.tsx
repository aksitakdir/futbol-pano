"use client";

type Props = {
  /** Örn. var(--sg-primary) — color-mix ile geçerli */
  accent: string;
  /** default: sol taban var(--sg-bg); surface-low: Taktik Lab gibi */
  variant?: "default" | "surface-low";
  children: React.ReactNode;
};

/**
 * Kategori liste sayfaları hero: solda taban renk, sağda accent’li linear geçiş (keskin blur kesimi yok)
 * + hafif radial derinlik. Tam genişlik; overflow-hidden kullanılmaz.
 */
export default function CategoryHero({ accent, variant = "default", children }: Props) {
  const left = variant === "surface-low" ? "var(--sg-surface-low)" : "var(--sg-bg)";

  return (
    <section className="relative w-full px-8 py-20">
      {/* Sağda belirgin ama pürüzsüz renk ayrışması — CSS gradient, kutu sınırında kesilmez */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `linear-gradient(102deg,
            ${left} 0%,
            ${left} 32%,
            color-mix(in srgb, ${accent} 10%, ${left}) 55%,
            color-mix(in srgb, ${accent} 20%, ${left}) 78%,
            color-mix(in srgb, ${accent} 14%, var(--sg-surface-low)) 100%)`,
        }}
      />
      {/* Ek sıcaklık — merkez sağda, yumuşak; parent’ta overflow yok */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0 top-1/2 right-0 h-[min(95vw,540px)] w-[min(95vw,540px)] -translate-y-1/2 translate-x-[18%] rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${accent} 48%, transparent) 0%, transparent 60%)`,
          filter: "blur(100px)",
          opacity: 0.26,
        }}
      />
      <div className="relative z-[1] mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}
