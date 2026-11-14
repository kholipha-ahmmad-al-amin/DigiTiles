import { Suspense } from "react";
import { CatalogueAssistant } from "@/components/assistant/CatalogueAssistant";
import { ASSISTANT_COPY } from "@/lib/i18n-assistant";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/assistant",
  title: ASSISTANT_COPY.title.en,
  description: ASSISTANT_COPY.intro.en,
});

export default function AssistantPage() {
  return (
    <Suspense fallback={null}>
      <CatalogueAssistant />
    </Suspense>
  );
}
