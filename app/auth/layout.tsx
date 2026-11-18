import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/auth",
  title: "Sign In",
  description: "Sign in to your DigiTiles account with a Bangladesh mobile number.",
  index: false,
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
