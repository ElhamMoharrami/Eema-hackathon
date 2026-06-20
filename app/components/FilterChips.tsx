"use client";

import type { Filters } from "@/lib/types";

type Props = { filters: Filters };

export default function FilterChips({ filters }: Props) {
  const items: { k: string; v: string }[] = [];
  if (filters.use_case) items.push({ k: "Use", v: filters.use_case });
  if (filters.location) items.push({ k: "Where", v: filters.location });
  if (filters.budget_eur && filters.budget_eur > 0) {
    items.push({ k: "Budget", v: `€${filters.budget_eur.toLocaleString("nl-NL")}` });
  }
  for (const t of filters.must_have_tags ?? []) items.push({ k: "Must", v: t });

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-2 settle">
      {items.map((x, i) => (
        <span key={i} className="chip chip-static inline-flex items-baseline gap-2">
          <span className="label-ochre" style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            {x.k}
          </span>
          <span className="text-ink">{x.v}</span>
        </span>
      ))}
    </div>
  );
}
