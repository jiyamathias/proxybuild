import { timingSafeEqual } from "crypto";

const FLW_BASE = "https://api.flutterwave.com/v3";

function secretKey() {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) throw new Error("FLW_SECRET_KEY is not configured");
  return key;
}

export type InitiateArgs = {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customer: { email: string; name?: string; phonenumber?: string };
  title?: string;
  description?: string;
  meta?: Record<string, string>;
};

/** Creates a hosted checkout session and returns the payment link. */
export async function initiatePayment(args: InitiateArgs): Promise<string> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: args.txRef,
      amount: args.amount,
      currency: args.currency,
      redirect_url: args.redirectUrl,
      customer: args.customer,
      customizations: {
        title: args.title ?? "ProxyBuild Africa",
        description: args.description ?? "Construction project payment",
      },
      meta: args.meta,
    }),
  });

  const body = await res.json();
  if (!res.ok || body.status !== "success" || !body.data?.link) {
    throw new Error(body.message ?? "Failed to create payment link");
  }
  return body.data.link as string;
}

export type VerifiedTransaction = {
  id: number;
  txRef: string;
  status: string;
  amount: number;
  currency: string;
  flwRef: string | null;
};

/**
 * Confirms a transaction directly with Flutterwave.
 * Webhook payloads are never trusted on their own — always verify here.
 */
export async function verifyTransaction(
  transactionId: string | number
): Promise<VerifiedTransaction | null> {
  const res = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });

  const body = await res.json();
  if (!res.ok || body.status !== "success" || !body.data) return null;

  return {
    id: body.data.id,
    txRef: body.data.tx_ref,
    status: body.data.status,
    amount: Number(body.data.amount),
    currency: body.data.currency,
    flwRef: body.data.flw_ref ?? null,
  };
}

/** Constant-time comparison of the verif-hash webhook header. */
export function isValidWebhookSignature(header: string | null): boolean {
  const expected = process.env.FLW_WEBHOOK_HASH;
  if (!expected || !header) return false;

  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function buildTxRef(projectId: string) {
  return `PB-${projectId.slice(0, 8)}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
