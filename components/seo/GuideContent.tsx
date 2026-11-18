"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { GUIDE_COPY as copy, marketplaceGuides } from "@/lib/i18n";
import { guideSlugs, type GuideSlug } from "@/lib/marketplace-guides";

export function GuideContent({ slug }: { slug?: GuideSlug }) {
  const { locale } = useApp();
  const guide = slug ? marketplaceGuides[slug] : undefined;
  const guideLinks = guideSlugs.filter((entry) => entry !== slug);

  return (
    <article className="doc-stage space-y-8">
      <nav aria-label={copy.label[locale]} className="flex flex-wrap items-center gap-2 text-sm text-secondary">
        <Link href="/" className="min-h-11 py-3 font-semibold text-accent underline">{copy.home[locale]}</Link>
        {guide && <><span aria-hidden="true">/</span><Link href="/guides" className="min-h-11 py-3 font-semibold text-accent underline">{copy.label[locale]}</Link></>}
      </nav>
      <header className="space-y-4 rounded-lg border border-hairline bg-surface p-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{(guide?.title ?? copy.title)[locale]}</h1>
        <p className="max-w-prose text-secondary">{(guide?.intro ?? copy.intro)[locale]}</p>
        {guide && (
          <Link href={guide.action.href} className="inline-flex min-h-11 items-center gap-2 rounded bg-accent px-4 py-2 font-semibold text-white">
            {guide.action.label[locale]} <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </header>
      {guide && (
        <>
          <section className="space-y-3 rounded-lg border border-hairline bg-surface p-6">
            <h2 className="text-xl font-bold text-ink">{copy.steps[locale]}</h2>
            <ol className="list-decimal space-y-3 pl-6 text-secondary">
              {guide.steps.map((step) => <li key={step.en}>{step[locale]}</li>)}
            </ol>
          </section>
          <section className="space-y-4 rounded-lg border border-hairline bg-surface p-6">
            <h2 className="text-xl font-bold text-ink">{copy.questions[locale]}</h2>
            {guide.faq.map(({ question, answer }) => (
              <div key={question.en} className="space-y-2">
                <h3 className="font-semibold text-ink">{question[locale]}</h3>
                <p className="text-secondary">{answer[locale]}</p>
              </div>
            ))}
          </section>
        </>
      )}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-ink">{copy.related[locale]}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {guideLinks.map((entry) => (
            <li key={entry} className="rounded-lg border border-hairline bg-surface">
              <Link href={`/guides/${entry}`} className="flex min-h-11 items-center justify-between gap-2 px-4 py-3 font-semibold text-accent hover:underline">
                {marketplaceGuides[entry].title[locale]} <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
