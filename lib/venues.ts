import seed from "@/seed/venues.json";
import type { Venue } from "./types";

const VENUES: Venue[] = seed as Venue[];

export function allVenues(): Venue[] {
  return VENUES;
}

export function venueById(id: string): Venue | undefined {
  return VENUES.find((v) => v.id === id);
}

/**
 * Convention: photos live at /public/photos/<id>.jpg and videos at /public/shoots/<id>.mp4.
 * Missing files degrade gracefully (monogram plate for photos, hidden play pill for videos).
 */
export function photoFor(venueId: string): string {
  return `/photos/${venueId}.jpg`;
}

export function videoFor(venueId: string): string {
  return `/shoots/${venueId}.mp4`;
}

/**
 * The catalogue's house pick — always shown first and slightly larger.
 * Anchored on the first seed entry so it follows whatever the curator puts at the top.
 */
export function featuredVenue(): Venue {
  return VENUES[0];
}

export function featuredId(): string {
  return VENUES[0]?.id ?? "";
}

export function isFeatured(id: string): boolean {
  return id === featuredId();
}

/**
 * Rehydrate a list of candidate venue IDs against the seed file:
 * drop unknown/duplicate IDs, then ensure the featured venue sits at position 0
 * (inserted if the model omitted it).
 */
export function rehydrateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    if (!VENUES.some((v) => v.id === id)) continue;
    seen.add(id);
    out.push(id);
  }
  const featured = featuredId();
  if (!featured) return out;
  const idx = out.indexOf(featured);
  if (idx > 0) {
    out.splice(idx, 1);
    out.unshift(featured);
  } else if (idx === -1) {
    out.unshift(featured);
  }
  return out;
}
