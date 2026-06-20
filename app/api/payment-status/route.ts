import { NextRequest, NextResponse } from "next/server";
import { mollie } from "@/lib/mollie";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing 'id'" }, { status: 400 });
  }
  try {
    const payment = await mollie().payments.get(id);
    return NextResponse.json({
      status: payment.status,
      amount: payment.amount,
      metadata: payment.metadata ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not fetch payment", detail: err instanceof Error ? err.message : "unknown" },
      { status: 502 }
    );
  }
}
