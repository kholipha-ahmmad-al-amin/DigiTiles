import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/marketplace",
  title: "Compare Tiles and Verified Showrooms in Bangladesh",
  description: "Browse floor tiles, wall tiles and porcelain from verified Bangladeshi showrooms. Compare technical specifications, coverage per box and indicative BDT prices.",
});

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return children;
}
