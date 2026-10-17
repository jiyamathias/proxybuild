import { NextRequest, NextResponse } from "next/server";
import { isValidWebhookSignature, verifyTransaction } from "@/lib/flutterwave";
import { finalizeFlutterwavePayment } from "@/lib/services/payments";

export async function POST(req: NextRequest) {
  // 1. Authenticate the sender
  if (!isValidWebhookSignature(req.headers.get("verif-hash"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = await req.json().catch(() => null);
  if (!event?.data?.id) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  // 2. Never trust the payload — confirm with Flutterwave directly
  const verified = await verifyTransaction(event.data.id);
  if (!verified) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const result = await finalizeFlutterwavePayment(verified);

  if (result.outcome === "unknown_reference") {
    // Ack so Flutterwave stops retrying, but record nothing
    console.warn("[FLW webhook] unknown tx_ref", verified.txRef);
  } else if (result.outcome === "failed") {
    console.warn("[FLW webhook] rejected", verified.txRef, result.reason);
  }

  return NextResponse.json({ received: true });
}
