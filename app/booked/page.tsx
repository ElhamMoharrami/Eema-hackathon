"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "loading" | "paid" | "open" | "failed" | "canceled" | "expired" | "missing" | "error";

type Ctx = { venueId?: string; venueName?: string; amount?: number };

const eur = (n: number) => `€${n.toLocaleString("nl-NL")}`;

export default function BookedPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [ctx, setCtx] = useState<Ctx>({});
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const pid =
      typeof window !== "undefined" ? sessionStorage.getItem("eema:paymentId") : null;
    setPaymentId(pid);

    try {
      const raw =
        typeof window !== "undefined" ? sessionStorage.getItem("eema:context") : null;
      if (raw) setCtx(JSON.parse(raw));
    } catch {
      // ignore — never crash on empty/garbled session
    }

    if (!pid) {
      setStatus("missing");
      return;
    }
    check(pid).then(setStatus);
  }, []);

  const recheck = async () => {
    if (!paymentId) return;
    setStatus("loading");
    setStatus(await check(paymentId));
  };

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 pt-16 pb-24 md:px-12">
      <header className="flex items-baseline justify-between">
        <Link href="/" className="text-left">
          <div className="font-display text-2xl tracking-tight">
            Eema<span className="text-ochre">.</span>
          </div>
          <div className="label mt-1">Reservation receipt</div>
        </Link>
        <span className="label">Test mode</span>
      </header>

      <section className="mt-12 border border-rule bg-paper p-8 md:p-12 settle-slow">
        {status === "loading" && <Body label="Status" big="Checking your payment…" />}

        {status === "paid" && (
          <PaidView ctx={ctx} paymentId={paymentId} />
        )}

        {status === "open" && (
          <Pending ctx={ctx} onRecheck={recheck} />
        )}

        {(status === "failed" || status === "canceled" || status === "expired") && (
          <Failed status={status} onRetry={() => (window.location.href = "/")} />
        )}

        {status === "missing" && (
          <Body
            label="No reservation in progress"
            big="Nothing to confirm here."
            sub="Head back to the catalogue and start a new quote."
            action={<Link href="/" className="btn mt-6 inline-block">Back to Eema</Link>}
          />
        )}

        {status === "error" && (
          <Body
            label="Could not reach Mollie"
            big="We couldn't fetch your payment status."
            sub="Try again in a moment."
            action={<button onClick={recheck} className="btn mt-6">Try again</button>}
          />
        )}
      </section>
    </main>
  );
}

function PaidView({ ctx, paymentId }: { ctx: Ctx; paymentId: string | null }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="label label-ink">Confirmed</div>
        <span className="available-mark">Reserved</span>
      </div>

      <h1 className="mt-5 font-display text-4xl md:text-5xl leading-[1.05]">
        Reserved.
      </h1>
      <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/85">
        We&apos;re connecting you with the owner.{" "}
        <strong className="text-ink">Check your email for your meeting link.</strong>
      </p>

      <span className="rule my-8" aria-hidden />

      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        {ctx.venueName && <Row k="Venue" v={ctx.venueName} />}
        {ctx.amount != null && <Row k="Reservation paid" v={eur(ctx.amount)} mono />}
        {paymentId && <Row k="Payment ref" v={paymentId} mono />}
        <Row k="Issued" v={new Date().toLocaleString("nl-NL")} />
      </dl>

      <span className="rule my-8" aria-hidden />

      <p className="text-xs leading-relaxed text-taupe">
        This page is your receipt — feel free to screenshot it. The balance is settled with
        the venue owner directly, on the day.
      </p>

      <Link href="/" className="btn mt-8 inline-block">
        New quote
      </Link>
    </>
  );
}

function Pending({ ctx, onRecheck }: { ctx: Ctx; onRecheck: () => void }) {
  return (
    <>
      <div className="label label-ink">In progress</div>
      <h1 className="mt-5 font-display text-4xl leading-[1.05]">
        Payment in progress.
      </h1>
      <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/85">
        Mollie hasn&apos;t confirmed yet. Give it a moment, then re-check.
      </p>
      {ctx.venueName && (
        <p className="label mt-6">
          For {ctx.venueName}
          {ctx.amount != null ? ` · ${eur(ctx.amount)}` : ""}
        </p>
      )}
      <button onClick={onRecheck} className="btn mt-6">
        Re-check status
      </button>
    </>
  );
}

function Failed({ status, onRetry }: { status: Status; onRetry: () => void }) {
  const label =
    status === "canceled"
      ? "Payment canceled"
      : status === "expired"
      ? "Payment expired"
      : "Payment not completed";
  return (
    <>
      <div className="label label-ink">{label}</div>
      <h1 className="mt-5 font-display text-4xl leading-[1.05]">
        {label}.
      </h1>
      <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/85">
        No charge was made. You can try the reservation again — your quote is still warm.
      </p>
      <button onClick={onRetry} className="btn btn-ochre mt-6">
        Try again
      </button>
    </>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <>
      <dt className="label">{k}</dt>
      <dd className={mono ? "tabular font-mono text-right text-ink" : "text-right text-ink"}>
        {v}
      </dd>
    </>
  );
}

function Body({
  label,
  big,
  sub,
  action,
}: {
  label: string;
  big: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <>
      <div className="label label-ink">{label}</div>
      <h1 className="mt-5 font-display text-3xl leading-[1.1]">{big}</h1>
      {sub && <p className="mt-4 text-[1.02rem] text-ink/80">{sub}</p>}
      {action}
    </>
  );
}

async function check(paymentId: string): Promise<Status> {
  try {
    const res = await fetch(`/api/payment-status?id=${encodeURIComponent(paymentId)}`);
    const data = await res.json();
    if (!res.ok) return "error";
    const s = (data?.status ?? "").toString();
    if (s === "paid") return "paid";
    if (s === "open" || s === "pending" || s === "authorized") return "open";
    if (s === "canceled") return "canceled";
    if (s === "expired") return "expired";
    if (s === "failed") return "failed";
    return "open";
  } catch {
    return "error";
  }
}
