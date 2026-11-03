import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/providers/AppProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { agencySchema, applicationSchema, creatorSchema, organizationSchema, pageMetadata, SITE, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/", title: SITE.title, description: SITE.description }),
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  creator: SITE.creator.name,
  authors: [SITE.creator],
  publisher: SITE.agency.name,
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/hind-siliguri-bengali-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <JsonLd data={{ "@graph": [organizationSchema, websiteSchema, applicationSchema, agencySchema, creatorSchema] }} />
        <AppProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
