import { createContext } from "react";

/**
 * True inside a <FooterOwner>: the route's layout draws the footer (with the
 * article index above it), so a SiteFooter rendered by the page itself stands
 * down instead of appearing twice.
 */
export const LayoutOwnsFooter = createContext(false);
