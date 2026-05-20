"use client";

type Props = {
  accent: string;
  variant?: "default" | "surface-low";
  /** Use sg-hero-text-block (more inset) instead of sg-site-container for the inner wrapper */
  heroInset?: boolean;
  children: React.ReactNode;
};

export default function CategoryHero({ accent, variant = "default", heroInset = false, children }: Props) {
  const left = variant === "surface-low" ? "var(--sg-surface-low)" : "var(--sg-bg)";

  return (
    <section
      className="relative w-full"
      style={{ paddingTop: "clamp(56px, 8vw, 112px)", paddingBottom: "clamp(48px, 7vw, 96px)" }}
    >
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            `linear-gradient(108deg,`,
            `${left} 0%,`,
            `${left} 28%,`,
            `color-mix(in srgb, ${accent} 8%, ${left}) 48%,`,
            `color-mix(in srgb, ${accent} 18%, ${left}) 72%,`,
            `color-mix(in srgb, ${accent} 12%, var(--sg-surface-low)) 100%)`,
          ].join(" "),
        }}
      />
      {/* Ambient glow — top right */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0"
        style={{
          top: "-20%",
          right: "-5%",
          width: "min(80vw, 600px)",
          height: "min(80vw, 600px)",
          borderRadius: "50%",
          background: `radial-gradient(circle, color-mix(in srgb, ${accent} 40%, transparent) 0%, transparent 65%)`,
          filter: "blur(120px)",
          opacity: 0.22,
        }}
      />
      {/* Bottom separator line */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-0 bottom-0 left-0 right-0"
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, color-mix(in srgb, ${accent} 30%, transparent) 50%, transparent)`,
        }}
      />
      <div className={`relative z-[1] ${heroInset ? "sg-hero-text-block" : "sg-site-container"}`}>{children}</div>
    </section>
  );
}
