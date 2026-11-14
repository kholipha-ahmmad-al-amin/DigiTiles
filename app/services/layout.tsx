import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/services",
  title: "Tile Installers and Material Transport in Bangladesh",
  description: "Find tile installers by district and specialty, compare BDT rates, and estimate material transport by vehicle class and distance.",
});

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return children;
}
