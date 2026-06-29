import { wcTeamFlagUrl } from "@/lib/wc-team-flags";

type Props = {
  slug: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { w: 40, h: 28, src: 80 as const },
  md: { w: 56, h: 40, src: 160 as const },
  lg: { w: 72, h: 40, src: 320 as const },
};

/** Country flag — fixed 3:2 box (Switzerland square flag included, object-fit: cover) */
export default function WcTeamFlag({ slug, name, size = "md", className = "" }: Props) {
  const dim = SIZES[size];
  const src = wcTeamFlagUrl(slug, dim.src);

  return (
    <span
      className={`wc-team-flag wc-team-flag--${size} ${className}`.trim()}
      style={{ width: dim.w, height: dim.h }}
    >
      {/* Native img — avoids Next image optimizer timeouts on flagcdn in dev */}
      <img
        src={src}
        alt=""
        width={dim.w}
        height={dim.h}
        className="wc-team-flag__img"
        loading="lazy"
        decoding="async"
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
