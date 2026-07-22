import type { ReactNode } from "react";
import { Coin, Asclepius, ShieldChevron } from "@phosphor-icons/react/dist/ssr";
import type { Industry } from "./copy";

/**
 * The glyph that stands for each industry on the landing page.
 *
 * Shared rather than declared at each call site because the two places it is
 * used are meant to read as the same mark: the hero's segment selector (what
 * you pick) and the emulator's industry tag (what you are now watching). A
 * private copy in either file would let the chip drift off the control that
 * sets it.
 *
 * Phosphor nodes are supplied by the caller and never bundled into a Broadsheet
 * component, so size and weight are decided here at each usage.
 */
export const INDUSTRY_ICONS: Record<Industry, ReactNode> = {
  fintech: <Coin />,
  healthcare: <Asclepius />,
  defense: <ShieldChevron />,
};
