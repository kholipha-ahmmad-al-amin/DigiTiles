import { notFound } from "next/navigation";
import { GuideContent } from "@/components/seo/GuideContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { GUIDE_COPY, guideSlugs, marketplaceGuides } from "@/lib/marketplace-guides";
import { canonicalUrl, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return guideSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = guideSlugs.find((entry) => entry === params.slug);
  if (!slug) return {};
  const guide = marketplaceGuides[slug];
  return pageMetadata({ path: `/guides/${slug}`, title: guide.title.en, description: guide.intro.en });
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const slug = guideSlugs.find((entry) => entry === params.slug);
  if (!slug) notFound();
  const guide = marketplaceGuides[slug];
  const faq = {
    "@type": "FAQPage",
    inLanguage: "bn",
    mainEntity: guide.faq.map(({ question, answer }) => ({
      "@type": "Question", name: question.bn,
      acceptedAnswer: { "@type": "Answer", text: answer.bn },
    })),
  };
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: GUIDE_COPY.home.bn, item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: GUIDE_COPY.label.bn, item: canonicalUrl("/guides") },
      { "@type": "ListItem", position: 3, name: guide.title.bn, item: canonicalUrl(`/guides/${slug}`) },
    ],
  };
  return <><JsonLd data={{ "@graph": [faq, breadcrumb] }} /><GuideContent slug={slug} /></>;
}
