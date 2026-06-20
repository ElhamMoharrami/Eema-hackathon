import { NextRequest, NextResponse } from "next/server";
import { mollie, baseUrl } from "@/lib/mollie";
import { venueById } from "@/lib/venues";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { venueId?: string; amount?: number; description?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const venueId = (body.venueId ?? "").toString();
  const venue = venueById(venueId);
  if (!venue) {
    return NextResponse.json({ error: "Unknown venueId" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid 'amount'" }, { status: 400 });
  }

  const description =
    (body.description ?? `Eema reservation — ${venue.name}`).toString().slice(0, 255);

  try {
    const payment = await mollie().payments.create({
      amount: { currency: "EUR", value: amount.toFixed(2) },
      description,
      redirectUrl: `${baseUrl()}/booked`,
      metadata: { venueId },
    });

    const checkoutUrl = payment.getCheckoutUrl();
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Mollie returned no checkout URL" },
        { status: 502 }
      );
    }
    return NextResponse.json({ checkoutUrl, paymentId: payment.id });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not create payment", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 }
    );
  }
}
