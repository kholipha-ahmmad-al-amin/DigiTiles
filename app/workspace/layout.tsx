import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/workspace",
  title: "Workspace",
  description: "Manage DigiTiles quotations, orders and delivery coordination in your workspace.",
  index: false,
});

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return children;
}
