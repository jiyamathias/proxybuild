import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { sessions, users, profiles } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { UserRole } from "@/types";

const SESSION_COOKIE = "pb_session";
const SESSION_EXPIRY_DAYS = 30;
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "change-this-secret-in-production-min-32-chars"
);

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export async function createSession(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(secret);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    await jwtVerify(token, secret);
  } catch {
    return null;
  }

  const now = new Date();
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
      avatarUrl: profiles.avatarUrl,
      isActive: users.isActive,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, now),
        eq(users.isActive, true)
      )
    )
    .limit(1);

  if (!result[0]) return null;

  const { isActive: _ia, ...sessionUser } = result[0];
  return sessionUser as SessionUser;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
