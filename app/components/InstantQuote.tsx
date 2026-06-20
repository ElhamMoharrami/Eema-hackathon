"use client";

import { useState } from "react";
import type { Quote, Venue } from "@/lib/types";
import BookerVerification from "./BookerVerification";

type Props = {
  venue: Venue;
  query: string;
  quote: Quote;
};

const eur = (n: number) => `€${n.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function InstantQuote({ venue, quote }: Props) {
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBooker, setShowBooker] = useState(false);

  const reserve = async () => {
    setError(null);
    setReserving(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          venueId: venue.id,
          amount: quote.reservation_fee,
          description: `Eema reservation — ${venue.name}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not start payment");
      sessionStorage.setItem("eema:paymentId", data.paymentId);
      sessionStorage.setItem(
        "eema:context",
        JSON.stringify({
          venueId: venue.id,
          venueName: venue.name,
          amount: quote.reservation_fee,
        })
      );
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setReserving(false);
    }
  };

  return (
    <aside className="settle-slow border border-rule bg-paper p-7 md:p-9">
      <div className="flex items-center justify-between">
        <div className="label label-ink">Instant Quote</div>
        {quote.available && <span className="available-mark">Instantly available</span>}
      </div>

      <h3 className="mt-4 font-display text-3xl leading-tight">{venue.name}</h3>
      <p className="mt-2 max-w-prose text-[0.95rem] leading-relaxed text-ink/80">
        {quote.fit_rationale}
      </p>

      <span className="rule my-7" aria-hidden />

      <ul className="space-y-3">
        {quote.line_items.map((li, i) => (
          <li
            key={i}
            className="flex items-baseline justify-between gap-6 border-b border-dotted border-rule pb-2"
          >
            <span className="text-[0.98rem] text-ink">{li.label}</span>
            <span className="tabular font-mono text-[0.98rem] text-ink">{eur(li.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline justify-between">
        <span className="label">Subtotal</span>
        <span className="tabular font-mono text-base text-taupe">{eur(quote.total)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="label label-ochre">Reservation fee · 20%</span>
        <span className="tabular font-mono text-2xl text-ink">
          {eur(quote.reservation_fee)}
        </span>
      </div>

      <span className="rule my-6" aria-hidden />

      <p className="text-xs leading-relaxed text-taupe">
        Pay the reservation fee now to lock the date. The remaining{" "}
        <span className="tabular font-mono text-ink">
          {eur(Math.max(quote.total - quote.reservation_fee, 0))}
        </span>{" "}
        is settled with the venue owner directly.
      </p>

      {showBooker ? (
        <BookerVerification
          reservationFeeLabel={eur(quote.reservation_fee)}
          paying={reserving}
          onConfirm={() => {
            reserve();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowBooker(true)}
          className="btn btn-ochre mt-6 w-full"
        >
          {`Reserve — pay ${eur(quote.reservation_fee)}`}
        </button>
      )}

      {error && <p className="mt-3 text-sm text-ochreDeep">{error}</p>}
    </aside>
  );
}
