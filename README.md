# Eema

Instant quotes for Europe's iconic palaces, castles, and grand halls — the opposite of
the contact-form-and-wait sites it replaces. Describe your shoot or event in plain
words, get a real itemised quote in seconds, and reserve the space live by paying a
reservation fee via Mollie (test mode).

Single page, no auth, no database. Next.js App Router + Tailwind + Gemini + Mollie.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Var              | Where         | Example                       |
| ---------------- | ------------- | ----------------------------- |
| `GEMINI_API_KEY` | server-only   | `AIza…` (from Google AI Studio) |
| `MOLLIE_API_KEY` | server-only   | `test_…` (use **test mode**)  |
| `BASE_URL`       | server        | `http://localhost:3000` locally; `https://<your-site>.netlify.app` in prod |

`BASE_URL` is used as the Mollie `redirectUrl`. There are no webhooks (they don't reach
`localhost`); the `/booked` page checks status via the Mollie API instead.

## Project layout

```
app/
  page.tsx               single-page experience (search → match → detail → checkout)
  booked/page.tsx        receipt-style booking confirmation
  components/            small, single-purpose React components
  api/match/route.ts     Gemini-backed match + quote (JSON mode)
  api/checkout/route.ts  creates a Mollie payment, returns checkout URL
  api/payment-status/route.ts  read-only Mollie status check
lib/
  gemini.ts              centralized Gemini client + JSON-mode helper w/ 1 retry
  mollie.ts              centralized Mollie client + baseUrl resolver
  venues.ts              load + rehydrate + featured-pinning helpers
  prompts.ts             match & quote prompt templates
  types.ts               shared TS types
seed/venues.json         catalogue (first entry is the house pick, always pinned first)
public/photos/<id>.jpg   per-venue still — missing files degrade to a monogram plate
public/shoots/<id>.mp4   optional per-venue clip ("See your shoot here")
```

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git**, pick this repo.
3. Build settings are picked up from `netlify.toml`. The `@netlify/plugin-nextjs`
   plugin maps App Router route handlers to Netlify Functions.
4. Add env vars in **Site settings → Environment variables**:
   - `GEMINI_API_KEY`
   - `MOLLIE_API_KEY` (test mode)
   - `BASE_URL` (the production Netlify URL, e.g. `https://eema.netlify.app`)
5. Deploy. The same code base runs locally and on Netlify.
