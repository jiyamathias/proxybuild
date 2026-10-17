import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
 *
 * Returns false when the secret is unset so a misconfigured deploy fails closed
 * rather than exposing the endpoint to the open internet.
 */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  const provided = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
