"use client";

import type { Venue } from "@/lib/types";
import { photoFor, videoFor } from "@/lib/venues";
import GalleryFrame from "./GalleryFrame";

type Props = {
  venue: Venue;
  onOpen: () => void;
};

const prettify = (t: string) => t.replace(/-/g, " ");

export default function HeroFeature({ venue, onOpen }: Props) {
  const headlineTags = venue.tags.slice(0, 3).map(prettify);
  return (
    <section className="grid gap-10 md:grid-cols-[1.2fr_1fr] items-end">
      <GalleryFrame
        photoUrl={photoFor(venue.id)}
        caption={`${venue.name} · ${venue.size_m2} m² · ${venue.neighbourhood}`}
        videoSrc={videoFor(venue.id)}
        enableVideoControl
        large
      />
      <div>
        <div className="label label-ochre">Featured · House selection</div>
        <h2 className="mt-3 font-display text-4xl md:text-5xl leading-[1.05]">
          {venue.name}.
        </h2>
        <p className="mt-4 text-[0.95rem] uppercase tracking-label text-taupe">
          {headlineTags.join(" · ")}
        </p>
        <p className="mt-5 max-w-prose text-[1.05rem] leading-relaxed text-ink/85">
          {venue.size_m2} m² in {venue.neighbourhood}. Curated, vetted, instantly bookable
          — the kind of room production managers usually wait months to brief. Eema books
          it in minutes.
        </p>
        <div className="mt-6 flex items-baseline gap-8">
          <div>
            <div className="label">Day rate</div>
            <div className="tabular font-mono text-2xl text-ink mt-1">
              €{venue.day_rate_eur.toLocaleString("nl-NL")}
            </div>
          </div>
          <div>
            <div className="label">Reservation</div>
            <div className="tabular font-mono text-2xl text-ochre mt-1">~20%</div>
          </div>
        </div>
        <button onClick={onOpen} className="btn btn-ochre mt-8">
          Quote this space
        </button>
      </div>
    </section>
  );
}
