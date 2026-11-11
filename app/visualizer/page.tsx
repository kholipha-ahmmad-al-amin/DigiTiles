import { discoverListing } from "@/lib/public-catalogue";
import { queryDiscoverableListings } from "@/lib/store";
import { readSurfacePlan, VISUALIZER_PAGE_SIZE } from "@/lib/surface-planning";
import { VisualizerStudio } from "./VisualizerStudio";

export const dynamic = "force-dynamic";

export default function VisualizerPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const listingId = params.get("listingId");
  const { items, totalCount } = queryDiscoverableListings({ pageSize: VISUALIZER_PAGE_SIZE });
  const selected = listingId && discoverListing(listingId)?.listing;
  return (
    <VisualizerStudio key={params.toString()} initialSelection={selected || null} initialPlan={readSurfacePlan(params)}
      initialListings={items} initialTotal={totalCount} />
  );
}
