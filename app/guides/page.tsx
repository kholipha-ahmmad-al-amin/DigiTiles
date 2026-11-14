import { GuideContent } from "@/components/seo/GuideContent";
import { GUIDE_COPY } from "@/lib/marketplace-guides";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ path: "/guides", title: GUIDE_COPY.title.en, description: GUIDE_COPY.intro.en });

export default function GuidesPage() {
  return <GuideContent />;
}
