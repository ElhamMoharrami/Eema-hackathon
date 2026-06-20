import { GoogleGenAI } from "@google/genai";

let cached: GoogleGenAI | null = null;

export function gemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  if (!cached) cached = new GoogleGenAI({ apiKey });
  return cached;
}

export const MODEL = "gemini-3-flash-live";

/**
 * Call Gemini in JSON mode and return parsed JSON.
 * Retries once on parse failure or empty content. Never throws to the caller
 * unless both attempts fail — caller decides how to surface that.
 */
export async function jsonChat<T>(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<T> {
  const client = gemini();

  const tryOnce = async (): Promise<T> => {
    const res = await client.models.generateContent({
      model: MODEL,
      contents: opts.user,
      config: {
        systemInstruction: opts.system,
        responseMimeType: "application/json",
        temperature: opts.temperature ?? 0.4,
      },
    });
    const text = res.text ?? "";
    return JSON.parse(text) as T;
  };

  try {
    return await tryOnce();
  } catch {
    return await tryOnce();
  }
}
