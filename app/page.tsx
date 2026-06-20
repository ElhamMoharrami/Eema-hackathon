"use client";

import { useMemo, useState } from "react";
import type { MatchResult, Venue } from "@/lib/types";
import { allVenues, featuredVenue, isFeatured, photoFor, venueById } from "@/lib/venues";

import SearchBox from "./components/SearchBox";
import ExampleChips from "./components/ExampleChips";
import ThinkingSteps from "./components/ThinkingSteps";
import FilterChips from "./components/FilterChips";
import VenueCard from "./components/VenueCard";
import VenueDetail from "./components/VenueDetail";
import HeroFeature from "./components/HeroFeature";
import VenuePhoto from "./components/VenuePhoto";

const VENUE_COUNT = allVenues().length;

type Stage = "idle" | "matching" | "matched" | "detail";

export default function Page() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [openVenueId, setOpenVenueId] = useState<string | null>(null);

  const hero = useMemo(() => featuredVenue(), []);

  const runMatch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setError(null);
    setMatch(null);
    setOpenVenueId(null);
    setStage("matching");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not match");
      setMatch(data as MatchResult);
      setStage("matched");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStage("idle");
    }
  };

  const openVenue = (id: string) => {
    setOpenVenueId(id);
    setStage("detail");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToList = () => {
    setOpenVenueId(null);
    setStage(match ? "matched" : "idle");
  };

  const reset = () => {
    setQuery("");
    setMatch(null);
    setOpenVenueId(null);
    setStage("idle");
    setError(null);
  };

  const openVenue_ = openVenueId ? venueById(openVenueId) : null;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 pt-10 pb-24 md:px-12">
      <Header onReset={reset} />

      {stage === "detail" && openVenue_ ? (
        <VenueDetail venue={openVenue_} query={query} onBack={backToList} />
      ) : (
        <>
          <section className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-start">
            <div>
              <h1 className="font-display text-[2.6rem] md:text-[3.4rem] leading-[1.04]">
                Skip the form.<br />
                Get a real quote in seconds.
              </h1>
              <p className="mt-5 max-w-prose text-[1.05rem] leading-relaxed text-ink/80">
                Eema is the opposite of <em>“contact-us-and-wait.”</em> Describe your
                shoot or event in plain words. We read it, match it against a hand-picked
                catalogue of Europe's iconic palaces, castles, and grand halls, and quote
                you live — itemised, honest, instantly bookable.
              </p>

              <div className="mt-10">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  onSubmit={() => runMatch(query)}
                  busy={stage === "matching"}
                />
                <div className="mt-5">
                  <ExampleChips onPick={(q) => runMatch(q)} />
                </div>
              </div>

              {error && (
                <p className="mt-6 text-sm text-ochreDeep">
                  {error}
                </p>
              )}
            </div>

            <div className="md:sticky md:top-10">
              {hero && <HeroSummary venue={hero} onOpen={() => openVenue(hero.id)} />}
            </div>
          </section>

          <span className="rule my-16" aria-hidden />

          {stage === "matching" && <MatchingPlaceholder />}

          {stage === "matched" && match && (
            <Results match={match} query={query} onOpen={openVenue} />
          )}

          {stage === "idle" && hero && (
            <section>
              <div className="label mb-8">On view today</div>
              <HeroFeature venue={hero} onOpen={() => openVenue(hero.id)} />
            </section>
          )}
        </>
      )}

      <Footer />
    </main>
  );
}

function Header({ onReset }: { onReset: () => void }) {
  return (
    <header className="flex items-baseline justify-between">
      <button onClick={onReset} className="text-left">
        <div className="font-display text-3xl tracking-tight">Eema<span className="text-ochre">.</span></div>
        <div className="label mt-1">Instant quotes · Palaces, castles & grand halls · Europe</div>
      </button>
      <nav className="hidden md:flex items-baseline gap-8">
        <span className="label">Catalogue · {VENUE_COUNT} spaces</span>
        <span className="label">Live · Mollie test mode</span>
      </nav>
    </header>
  );
}

function HeroSummary({ venue, onOpen }: { venue: Venue; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="block w-full text-left group">
      <div className="mat">
        <span className="crop tl" />
        <span className="crop tr" />
        <span className="crop bl" />
        <span className="crop br" />
        <div className="relative overflow-hidden bg-paperDeep" style={{ aspectRatio: "4 / 5" }}>
          <VenuePhoto
            src={photoFor(venue.id)}
            alt={venue.name}
            className="transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <span className="absolute left-3 top-3 bg-paper/90 px-2 py-1 text-[0.62rem] uppercase tracking-label text-ochre">
            Plate · 01 · House selection
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <span className="font-display text-lg">{venue.name}</span>
        <span className="tabular font-mono text-sm text-taupe">
          €{venue.day_rate_eur.toLocaleString("nl-NL")}/day
        </span>
      </div>
      <div className="label mt-1">{venue.size_m2} m² · {venue.neighbourhood}</div>
    </button>
  );
}

function MatchingPlaceholder() {
  return (
    <div className="settle">
      <div className="label mb-4">Reading the brief</div>
      <p className="font-display text-2xl italic text-ink/70">
        One moment — Eema is reading your brief…
      </p>
    </div>
  );
}

function Results({
  match,
  query,
  onOpen,
}: {
  match: MatchResult;
  query: string;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="space-y-12">
      <ThinkingSteps steps={match.thinking} done />

      <div>
        <div className="label mb-3">Parsed brief</div>
        <FilterChips filters={match.filters} />
      </div>

      <span className="rule" aria-hidden />

      <div>
        <div className="flex items-baseline justify-between">
          <div className="label">Selected spaces</div>
          <div className="label">{match.matches.length} matches · ranked</div>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-12 md:grid-cols-2 stagger">
          {match.matches.map((m, i) => {
            const v = venueById(m.venueId);
            if (!v) return null;
            return (
              <VenueCard
                key={v.id}
                venue={v}
                rationale={m.fit_rationale}
                featured={isFeatured(v.id)}
                index={i}
                onOpen={() => onOpen(v.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-rule pt-8 flex flex-wrap items-baseline justify-between gap-4">
      <span className="label">Eema · Europe · test environment</span>
      <span className="label">Mollie test mode · no real charges</span>
    </footer>
  );
}
