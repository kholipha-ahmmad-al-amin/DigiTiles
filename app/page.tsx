import { discoverCatalogue } from "@/lib/public-catalogue";
import { HomeContent } from "./HomeContent";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomeContent {...discoverCatalogue({ pageSize: 6 })} />;
}
