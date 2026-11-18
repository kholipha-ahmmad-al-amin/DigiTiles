import { getVerifiedServices } from "@/lib/service-store";
import { ServiceDirectoryContent } from "./ServiceDirectoryContent";

export const dynamic = "force-dynamic";

export default function ServicesPage() {
  return <ServiceDirectoryContent directory={getVerifiedServices()} />;
}
