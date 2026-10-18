"use client";

import { LayoutOwnsFooter } from "./footer-context";
import SiteFooter from "./site-footer";

/**
 * Puts the server-rendered article index INSIDE the site footer, above its
 * columns, for every page under the wrapping layout.
 *
 * WHY: the pages render their own <SiteFooter />, and the index used to be a
 * sibling after the page, so it landed below the copyright line as a separate
 * wall of links. The layout cannot reach into the page to put it above the
 * footer, so it takes the footer over instead: pages inside the provider skip
 * theirs, and the one here renders after the page with the index in it.
 *
 * The index is still rendered by the layout, not the page, so it is in the raw
 * HTML whatever the page is doing (a client page still showing its loading
 * state has no footer of its own, and must not take the crawl path with it).
 */
export default function FooterOwner({
  index,
  themeClass,
  children,
}: {
  index: React.ReactNode;
  /**
   * The page's hub theme (e.g. "theme-wc-2026"). The footer used to sit inside the
   * page's themed <main> and pick up its accents; drawn out here it needs the class
   * passed along, or the WC and Transfers footers fall back to the default palette.
   */
  themeClass?: string;
  children: React.ReactNode;
}) {
  const footer = <SiteFooter index={index} />;
  return (
    <>
      <LayoutOwnsFooter.Provider value={true}>{children}</LayoutOwnsFooter.Provider>
      {themeClass ? <div className={themeClass}>{footer}</div> : footer}
    </>
  );
}
