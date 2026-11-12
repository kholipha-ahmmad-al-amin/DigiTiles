"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { ASSISTANT_COPY } from "@/lib/i18n-assistant";

type Source = { id: string; title: string; href: string; kind: string };
type Estimate = {
  listingTitle: string;
  href: string;
  areaSqft: number;
  wastePercent: number;
  boxes: number;
};
type Answer = { answer: string; sources: Source[]; estimate: Estimate | null };

export function CatalogueAssistant() {
  const { locale } = useApp();
  const params = useSearchParams();
  const listingId = params.get("listing") || undefined;
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Answer | null>(null);

  async function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (trimmed.length < 2 || pending) return;
    setQuestion(trimmed);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, locale, listingId }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message || (locale === "bn" ? "উত্তর আসেনি।" : "No answer was returned."));
      }
      setResult(payload.data);
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : locale === "bn" ? "উত্তর আসেনি।" : "No answer was returned.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ask-stage">
      <header className="ask-intro">
        <p className="eyebrow">
          <span>{ASSISTANT_COPY.eyebrow[locale]}</span>
        </p>
        <h1 className="display-title text-ink">{ASSISTANT_COPY.title[locale]}</h1>
        <p className="text-base leading-relaxed text-secondary">{ASSISTANT_COPY.intro[locale]}</p>
      </header>

      <form
        className="ask-form space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor="catalogue-question" className="block text-sm font-semibold text-ink">
          {ASSISTANT_COPY.label[locale]}
        </label>
        <textarea
          id="catalogue-question"
          value={question}
          maxLength={500}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={ASSISTANT_COPY.placeholder[locale]}
          className="w-full rounded border border-hairline bg-canvas px-3 py-3 text-base text-ink"
        />
        <div className="ask-suggestions">
          {ASSISTANT_COPY.suggestions.map((item) => (
            <button
              key={item.en}
              type="button"
              className="btn-line text-xs"
              onClick={() => void ask(item[locale])}
            >
              {item[locale]}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-solid" disabled={pending || question.trim().length < 2}>
          {pending ? ASSISTANT_COPY.working[locale] : ASSISTANT_COPY.submit[locale]}
        </button>
        {error ? <p className="text-sm text-accent">{error}</p> : null}
      </form>

      <section className="ask-answer space-y-4" aria-live="polite">
        <h2 className="text-xl font-bold text-ink">{ASSISTANT_COPY.eyebrow[locale]}</h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-secondary">
          {result?.answer || ASSISTANT_COPY.empty[locale]}
        </p>
        {result?.estimate ? (
          <p className="text-sm text-ink">
            <span className="font-semibold">{ASSISTANT_COPY.estimate[locale]}: </span>
            <Link href={result.estimate.href} className="text-accent underline">
              {result.estimate.listingTitle}
            </Link>
            {locale === "bn"
              ? `, ${result.estimate.areaSqft} বর্গফুট, ${result.estimate.wastePercent}% বাড়তি, আনুমানিক ${result.estimate.boxes} বক্স।`
              : `, ${result.estimate.areaSqft} sq.ft, ${result.estimate.wastePercent}% extra, about ${result.estimate.boxes} boxes.`}
          </p>
        ) : null}
      </section>

      <aside className="ask-sources" aria-label={ASSISTANT_COPY.sources[locale]}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink">{ASSISTANT_COPY.sources[locale]}</h2>
        {result?.sources.length ? (
          <ul className="mt-3 space-y-2">
            {result.sources.map((source) => (
              <li key={source.id}>
                <Link href={source.href} className="text-sm font-semibold text-accent underline">
                  {source.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-secondary">{ASSISTANT_COPY.empty[locale]}</p>
        )}
      </aside>
    </div>
  );
}
