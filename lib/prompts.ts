import type { Venue } from "./types";

export const MATCH_SYSTEM = `You are the matching brain of Eema, an instant-quoting platform for filming and event spaces — a curated catalogue of Europe's iconic palaces, castles, and grand halls.

You receive a natural-language client request and the catalogue of venues. Reply with ONLY valid JSON in this exact shape:

{
  "thinking": ["3 to 5 short REAL reasoning steps written in the first person — what you actually noticed in the brief, how you weighed it, why you ranked the way you did. No filler."],
  "filters": {
    "use_case": "short phrase, e.g. 'beverage commercial'",
    "location": "city or neighbourhood mentioned, else ''",
    "budget_eur": 0,
    "must_have_tags": ["industrial", "daylight"]
  },
  "matches": [
    { "venueId": "id-from-catalogue", "fit_rationale": "one short sentence on why this space fits" }
  ]
}

Rules:
- Only use venueId values that appear in the provided catalogue. Never invent IDs.
- Rank matches: best fit first. Return between 3 and 6 matches.
- If the brief is vague, infer reasonable defaults; never refuse.
- budget_eur: integer EUR, or 0 if not specified.
- Output nothing but the JSON — no markdown, no code fences.`;

export function matchUserPrompt(venues: Venue[], query: string): string {
  const slim = venues.map((v) => ({
    id: v.id,
    name: v.name,
    neighbourhood: v.neighbourhood,
    size_m2: v.size_m2,
    day_rate_eur: v.day_rate_eur,
    tags: v.tags,
  }));
  return `CATALOGUE:\n${JSON.stringify(slim, null, 2)}\n\nCLIENT REQUEST: ${query}`;
}

export const QUOTE_SYSTEM = `You are an instant-quoting engine for a venue-booking platform.
Given a VENUE and a CLIENT REQUEST, reply with ONLY valid JSON in this exact shape:
{
  "fit_rationale": "one short sentence on why this space fits",
  "available": true,
  "currency": "EUR",
  "line_items": [{"label": "...", "amount": 0}],
  "reservation_fee": 0,
  "total": 0
}

Rules:
- Use realistic premium pricing in EUR for an iconic European heritage venue (palace,
  castle, grand hall) in the venue's region. Anchor on the venue's day_rate_eur.
- Include 3–5 line items that fit the request (e.g. full/half-day hire, cleaning,
  on-site supervision, power/rigging, parking, catering). Vary them to the use-case.
- In fit_rationale, use the venue's real name and mention its size and one or two tags.
- Stay close to the client's budget when realistic; if the true cost is higher, quote
  honestly and keep it reasonable.
- Set reservation_fee to roughly 20% of total (paid now to reserve; the balance is
  settled with the owner directly).
- Output nothing but the JSON — no markdown, no code fences.`;

export function quoteUserPrompt(venue: Venue, query: string): string {
  return `VENUE: ${JSON.stringify(venue)}\nCLIENT REQUEST: ${query}`;
}
