import type { Metadata } from "next";
import { PitchDeckPresenter } from "@/components/pitch-deck/PitchDeckPresenter";
import { SITE, canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "DigiTiles 3D Executive Pitch Deck | Connected Construction Ecosystem",
  description:
    "Interactive 3D Executive Pitch Deck for DigiTiles: Bangladesh's connected construction commerce and services platform. Founded and presented by Kholipha Ahmmad Al-Amin.",
  alternates: {
    canonical: canonicalUrl("/pitch-deck"),
  },
  openGraph: {
    type: "website",
    title: "DigiTiles 3D Executive Pitch Deck | Connected Construction Ecosystem",
    description:
      "Interactive 3D Executive Pitch Deck for DigiTiles: Bangladesh's connected construction commerce and services platform. Founded and presented by Kholipha Ahmmad Al-Amin.",
    url: canonicalUrl("/pitch-deck"),
    siteName: SITE.name,
    locale: "bn_BD",
    alternateLocale: ["en_BD"],
    images: [
      {
        url: canonicalUrl("/og-pitch-deck.png"),
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "DigiTiles 3D Executive Pitch Deck - Kholipha Ahmmad Al-Amin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiTiles 3D Executive Pitch Deck | Connected Construction Ecosystem",
    description:
      "Interactive 3D Executive Pitch Deck for DigiTiles: Bangladesh's connected construction commerce and services platform. Founded and presented by Kholipha Ahmmad Al-Amin.",
    images: [canonicalUrl("/og-pitch-deck.png")],
  },
};

export default function PitchDeckPage() {
  return <PitchDeckPresenter />;
}
