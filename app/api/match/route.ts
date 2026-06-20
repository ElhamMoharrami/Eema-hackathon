import { NextRequest, NextResponse } from "next/server";
import { jsonChat } from "@/lib/gemini";
import { allVenues, featuredId, rehydrateIds, venueById } from "@/lib/venues";
import {
  MATCH_SYSTEM,
  QUOTE_SYSTEM,
  matchUserPrompt,
  quoteUserPrompt,
} from "@/lib/prompts";
import type { MatchResult, Quote } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { query?: string; venueId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = (body.query ?? "").toString().trim();
  if (!query) {
    return NextResponse.json({ error: "Missing 'query'" }, { status: 400 });
  }

  // Quote mode: venueId provided
  if (body.venueId) {
    const venue = venueById(body.venueId);
    if (!venue) {
      return NextResponse.json({ error: "Unknown venueId" }, { status: 404 });
    }
    try {
      const quote = await jsonChat<Quote>({
        system: QUOTE_SYSTEM,
        user: quoteUserPrompt(venue, query),
        temperature: 0.4,
      });
      return NextResponse.json(sanitizeQuote(quote));
    } catch (err) {
      return NextResponse.json(
        { error: "Could not generate quote", detail: errMsg(err) },
        { status: 502 }
      );
    }
  }

  // Match mode
  try {
    const raw = await jsonChat<MatchResult>({
      system: MATCH_SYSTEM,
      user: matchUserPrompt(allVenues(), query),
      temperature: 0.5,
    });
    return NextResponse.json(sanitizeMatch(raw));
  } catch (err) {
    return NextResponse.json(
      { error: "Could not match", detail: errMsg(err) },
      { status: 502 }
    );
  }
}

function sanitizeMatch(raw: MatchResult): MatchResult {
  const thinking = Array.isArray(raw.thinking)
    ? raw.thinking.map((s) => String(s)).slice(0, 5)
    : [];
  const filters = {
    use_case: String(raw.filters?.use_case ?? ""),
    location: String(raw.filters?.location ?? ""),
    budget_eur:
      typeof raw.filters?.budget_eur === "number" && Number.isFinite(raw.filters.budget_eur)
        ? raw.filters.budget_eur
        : null,
    must_have_tags: Array.isArray(raw.filters?.must_have_tags)
      ? raw.filters.must_have_tags.map((t) => String(t))
      : [],
  };

  const incoming = Array.isArray(raw.matches) ? raw.matches : [];
  const validIds = rehydrateIds(incoming.map((m) => m?.venueId).filter(Boolean));
  const rationaleById = new Map<string, string>();
  for (const m of incoming) {
    if (m?.venueId && !rationaleById.has(m.venueId)) {
      rationaleById.set(m.venueId, String(m.fit_rationale ?? ""));
    }
  }

  const featured = featuredId();
  const matches = validIds.map((id) => {
    const r = rationaleById.get(id);
    if (r) return { venueId: id, fit_rationale: r };
    if (id === featured) {
      return { venueId: id, fit_rationale: "House selection · always shown first." };
    }
    return { venueId: id, fit_rationale: "" };
  });

  return { thinking, filters, matches };
}

function sanitizeQuote(raw: Quote): Quote {
  const lineItems = Array.isArray(raw.line_items)
    ? raw.line_items
        .map((li) => ({
          label: String(li?.label ?? "").trim(),
          amount: Number(li?.amount ?? 0),
        }))
        .filter((li) => li.label && Number.isFinite(li.amount))
    : [];
  const total = Number.isFinite(raw.total) ? Number(raw.total) : sum(lineItems);
  const reservation_fee = Number.isFinite(raw.reservation_fee)
    ? Number(raw.reservation_fee)
    : Math.round(total * 0.2);
  return {
    fit_rationale: String(raw.fit_rationale ?? ""),
    available: raw.available !== false,
    currency: "EUR",
    line_items: lineItems,
    reservation_fee,
    total,
  };
}

function sum(items: { amount: number }[]): number {
  return items.reduce((acc, x) => acc + (Number.isFinite(x.amount) ? x.amount : 0), 0);
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "unknown";
}
