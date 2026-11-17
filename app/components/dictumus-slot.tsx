import { DICTUMUS_BANNER, dictumusWebAppUrl, type DictumusSlot } from "@/lib/dictumus";
import DictumusMotion from "./dictumus-motion";

/**
 * One Dictumus banner slot (docs/dictumus/BANNER-SLOTS.md). No hooks, so the label,
 * link and still image are in the server HTML wherever it is mounted;
 * DictumusMotion adds the clip on top in the browser and sends the GA4 view/click events.
 *
 * Which slot shows at which width is CSS only (app/globals.css, "Dictumus banner"):
 * in-content up to 599px, article-end up to 960px, sidebar from 961px. A hidden slot's
 * lazy image and clip are never fetched.
 *
 * The names avoid "ad", "banner", "promo" and "sponsor": ad-blocker lists hide those.
 */
export default function DictumusSlot({ slot, slug, className }: { slot: DictumusSlot; slug: string; className?: string }) {
  const b = DICTUMUS_BANNER;
  return (
    <aside
      className={`dx-slot dx-slot--${slot}${className ? ` ${className}` : ""}`}
      data-slot={slot}
      aria-label="Promotion: Dictumus, from the makers of Scout Gamer"
    >
      <div className="dx-slot__label mono" data-nosnippet="">{b.label}</div>
      <a className="dx-slot__link" href={dictumusWebAppUrl(slot, slug)} target="_blank" rel="sponsored noopener">
        <span className="dx-slot__frame">
          {/* One 13.7 KB palette PNG for every width (lib/dictumus.ts); next/image would re-encode it larger. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="dx-slot__still"
            src={b.still}
            width={b.width}
            height={b.height}
            alt={b.alt}
            loading="lazy"
            decoding="async"
          />
          <DictumusMotion src={b.video} slot={slot} slug={slug} />
        </span>
      </a>
    </aside>
  );
}
