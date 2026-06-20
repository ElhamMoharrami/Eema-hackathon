import createMollieClient, { MollieClient } from "@mollie/api-client";

let cached: MollieClient | null = null;

export function mollie(): MollieClient {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MOLLIE_API_KEY is not set. Paste a Mollie test_... key into .env.local and restart."
    );
  }
  if (!cached) cached = createMollieClient({ apiKey });
  return cached;
}

export function baseUrl(): string {
  const fromEnv = process.env.BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.URL) return process.env.URL.replace(/\/$/, ""); // Netlify
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
