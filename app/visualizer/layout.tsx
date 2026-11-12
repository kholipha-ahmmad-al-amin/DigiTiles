import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/visualizer",
  title: "Room Tile Visualizer and Box Calculator",
  description: "Preview tile laying patterns, grout colours and lighting in four room presets. Calculate boxes and wastage before requesting a BDT quotation.",
});

export default function VisualizerLayout({ children }: { children: ReactNode }) {
  return children;
}
