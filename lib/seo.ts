import type { Metadata } from "next";
import type { DealerListing, Organization } from "./types";

export const SITE = {
  name: "DigiTiles",
  url: "https://digitiles.equisaas-bd.com/",
  title: "DigiTiles | Tile Marketplace and Construction Services in Bangladesh",
  description: "Compare tiles from verified showrooms in Bangladesh, preview room layouts, calculate boxes, request BDT quotations, and coordinate installation and delivery.",
  logo: "/brand/digitiles-mark.png",
  interfaceMark: "/brand/digitiles-mark-ui.png",
  shareImage: "/brand/digitiles-social.jpg",
  creator: { name: "Kholipha Ahmmad Al-Amin", url: "https://kholipha-ahmmad-al-amin.equisaas-bd.com/" },
  agency: { name: "EquiSaaS Agency", url: "https://agency.equisaas-bd.com/" },
  parent: { name: "EquiSaaS BD", url: "https://equisaas-bd.com/" },
};

export function canonicalUrl(path: string) {
  return new URL(path, SITE.url).href;
}

const socialImage = {
  url: canonicalUrl(SITE.shareImage),
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "DigiTiles tile marketplace and construction services in Bangladesh",
};

export function pageMetadata({ path, title, description, index = true }: {
  path: string;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  const fullTitle = path === "/" ? title : `${title} | ${SITE.name}`;
  const url = canonicalUrl(path);
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: { index, follow: index },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      siteName: SITE.name,
      locale: "bn_BD",
      alternateLocale: ["en_BD"],
      url,
      images: [socialImage],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [socialImage] },
  };
}

export const organizationSchema = {
  "@type": "Organization",
  "@id": canonicalUrl("/#organization"),
  name: SITE.name,
  url: SITE.url,
  logo: canonicalUrl(SITE.logo),
  description: SITE.description,
  areaServed: { "@type": "Country", name: "Bangladesh" },
  parentOrganization: { "@id": `${SITE.agency.url}#organization` },
};

export const creatorSchema = {
  "@type": "Person",
  "@id": `${SITE.creator.url}#person`,
  name: SITE.creator.name,
  url: SITE.creator.url,
};

export const agencySchema = {
  "@type": "Organization",
  "@id": `${SITE.agency.url}#organization`,
  name: SITE.agency.name,
  url: SITE.agency.url,
  parentOrganization: { "@type": "Organization", name: SITE.parent.name, url: SITE.parent.url },
};

export const websiteSchema = {
  "@type": "WebSite",
  "@id": canonicalUrl("/#website"),
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: ["bn-BD", "en"],
  creator: { "@id": creatorSchema["@id"] },
  publisher: { "@id": organizationSchema["@id"] },
};

export const applicationSchema = {
  "@type": "WebApplication",
  "@id": canonicalUrl("/#application"),
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web browser",
  inLanguage: ["bn-BD", "en"],
  provider: { "@id": organizationSchema["@id"] },
  creator: [{ "@id": agencySchema["@id"] }, { "@id": creatorSchema["@id"] }],
};

export function productSchema(listing: DealerListing, dealer: Pick<Organization, "tradeNameEn">, category?: string) {
  const url = canonicalUrl(`/marketplace/${encodeURIComponent(listing.id)}`);
  const specifications = [
    ["Dimensions", listing.dimensionsMm],
    ["Surface finish", listing.surfaceFinish],
    ["Water absorption", listing.waterAbsorption],
    ["PEI wear rating", listing.peiRating],
    ["Slip resistance", listing.slipResistance],
    ["Coverage per box (sq.ft)", listing.sqftPerBox],
  ];
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: listing.titleEn,
    alternateName: listing.titleBn,
    description: listing.descriptionEn,
    sku: listing.sku,
    category,
    material: listing.materialType,
    brand: { "@type": "Brand", name: listing.brand },
    additionalProperty: specifications.filter(([, value]) => value != null && value !== "").map(([name, value]) => ({
      "@type": "PropertyValue", name, value,
    })),
    offers: listing.pricePerBoxBdt > 0 ? {
      "@type": "Offer",
      url,
      description: "Indicative box price. Request a dealer quotation for a binding offer and delivery fees.",
      priceCurrency: "BDT",
      price: listing.pricePerBoxBdt,
      seller: { "@type": "Organization", name: dealer.tradeNameEn },
    } : undefined,
  };
}
