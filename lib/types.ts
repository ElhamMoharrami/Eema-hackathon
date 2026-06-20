export type Venue = {
  id: string;
  name: string;
  neighbourhood: string;
  size_m2: number;
  day_rate_eur: number;
  tags: string[];
};

export type Filters = {
  use_case: string;
  location: string;
  budget_eur: number | null;
  must_have_tags: string[];
};

export type MatchResult = {
  thinking: string[];
  filters: Filters;
  matches: { venueId: string; fit_rationale: string }[];
};

export type LineItem = { label: string; amount: number };

export type Quote = {
  fit_rationale: string;
  available: boolean;
  currency: "EUR";
  line_items: LineItem[];
  reservation_fee: number;
  total: number;
};
