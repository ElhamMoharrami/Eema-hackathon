"use client";

import { useEffect, useState } from "react";

type Props = { steps: string[]; done: boolean };

/**
 * Reveals each reasoning step in turn with a calm cadence (~520ms apart).
 * Once `done` is true, all remaining steps appear immediately so the UI
 * never gets stuck mid-stream.
 */
export default function ThinkingSteps({ steps, done }: Props) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
  }, [steps]);

  useEffect(() => {
    if (shown >= steps.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 520);
    return () => clearTimeout(t);
  }, [shown, steps.length]);

  useEffect(() => {
    if (done) setShown(steps.length);
  }, [done, steps.length]);

  if (!steps.length) return null;

  return (
    <div>
      <div className="label mb-3">Reading the brief</div>
      <ol className="space-y-2">
        {steps.slice(0, shown).map((s, i) => (
          <li
            key={i}
            className="settle flex gap-3 text-[0.95rem] leading-relaxed text-ink"
          >
            <span className="mono tabular text-taupe" style={{ fontFamily: "var(--font-mono)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
