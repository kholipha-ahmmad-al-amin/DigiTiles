import { cache } from "react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { discoverListing } from "@/lib/public-catalogue";
import { canonicalUrl, pageMetadata, productSchema } from "@/lib/seo";
import { readSurfacePlan } from "@/lib/surface-planning";
import { ListingDetail } from "./ListingDetail";

export const dynamic = "force-dynamic";

const getListingPage = cache((id: string) => {
  const data = discoverListing(id);
  if (!data) notFound();
  return data;
});

type ListingRoute = {
  params: { listingId: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata({ params }: ListingRoute) {
  const { listing, organization } = getListingPage(params.listingId);
  return pageMetadata({
    path: `/marketplace/${encodeURIComponent(listing.id)}`,
    title: listing.titleEn,
    description: `${listing.descriptionEn} View box coverage and request a quotation from ${organization.tradeNameEn}.`,
  });
}

export default function ListingPage({ params, searchParams }: ListingRoute) {
  const data = getListingPage(params.listingId);
  const { listing, organization, category } = data;
  const product = productSchema(listing, organization, category?.nameEn);
  const planParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") planParams.set(key, value);
  }

  return (
    <>
      <JsonLd data={{ "@graph": [product, {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DigiTiles", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: "Marketplace", item: canonicalUrl("/marketplace") },
          { "@type": "ListItem", position: 3, name: listing.titleEn, item: product.url },
        ],
      }] }} />
      <ListingDetail key={`${listing.id}:${planParams}`} data={data} initialPlan={readSurfacePlan(planParams)} requestRfq={planParams.get("request") === "1"} />
    </>
  );
}
