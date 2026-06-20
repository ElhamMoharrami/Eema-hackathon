"use client";

import { useEffect, useState } from "react";
import type { Quote, Venue } from "@/lib/types";
import { photoFor, videoFor } from "@/lib/venues";
import GalleryFrame from "./GalleryFrame";
import InstantQuote from "./InstantQuote";

type Props = {
  venue: Venue;
  query: string;
  onBack: () => void;
};

const DEFAULT_BRIEF =
  "Standard one-day booking — itemise pricing for this venue at its listed day rate.";

export default function VenueDetail({ venue, query, onBack }: Props) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setQuote(null);
    setError(null);
    const briefForQuote = query.trim() || DEFAULT_BRIEF;
    (async () => {
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: briefForQuote, venueId: venue.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Could not generate quote");
        if (!cancelled) setQuote(data as Quote);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [venue.id, query]);

  return (
    <section className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
      <div>
        <button onClick={onBack} className="label mb-6 inline-flex items-center gap-2 hover:text-ink">
          ← Back to selection
        </button>
        <GalleryFrame
          photoUrl={photoFor(venue.id)}
          caption={`${venue.name} · ${venue.size_m2} m² · ${venue.neighbourhood}`}
          videoSrc={videoFor(venue.id)}
          enableVideoControl
          large
        />
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="Day rate" value={`€${venue.day_rate_eur.toLocaleString("nl-NL")}`} />
          <Stat label="Size" value={`${venue.size_m2} m²`} />
          <Stat label="Where" value={venue.neighbourhood} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
          {venue.tags.map((t) => (
            <span key={t} className="label">· {t}</span>
          ))}
        </div>
      </div>

      <div>
        {quote ? (
          <InstantQuote venue={venue} query={query} quote={quote} />
        ) : error ? (
          <div className="border border-rule p-6">
            <div className="label label-ink mb-2">Quote unavailable</div>
            <p className="text-sm text-taupe">{error}</p>
          </div>
        ) : (
          <QuoteSkeleton />
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-rule pt-3">
      <div className="label">{label}</div>
      <div className="tabular font-mono text-base text-ink mt-1">{value}</div>
    </div>
  );
}

function QuoteSkeleton() {
  return (
    <div className="border border-rule bg-paper p-7 md:p-9">
      <div className="label label-ink">Instant Quote</div>
      <div className="mt-4 h-7 w-2/3 bg-paperDeep" />
      <div className="mt-3 h-4 w-3/4 bg-paperDeep" />
      <span className="rule my-7" aria-hidden />
      <ul className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="h-4 w-1/2 bg-paperDeep" />
            <span className="h-4 w-16 bg-paperDeep" />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs italic text-taupe">Drafting your quote…</p>
    </div>
  );
}
