"use server";

import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./password";
import { createSession, setSessionCookie, deleteSession } from "./session";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { nanoid } from "nanoid";
import { sendPasswordReset } from "@/lib/email";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type ActionResult = { error?: string; success?: boolean };

export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    return { error: "Invalid email or password" };
  }

  if (!user.isActive) {
    return { error: "Your account is inactive. Please contact support." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password" };
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  const token = await createSession(user.id);
  await setSessionCookie(token);

  await createAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    action: AuditActions.USER_LOGIN,
    entityType: "user",
    entityId: user.id,
  });

  // Redirect based on role
  if (user.role === "CLIENT") {
    redirect("/dashboard");
  } else {
    redirect("/admin");
  }
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) return { error: "Email is required" };

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  const token = nanoid(40);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetExpiry: expiry,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  // Get first name
  const [profile] = await db
    .select({ firstName: profiles.firstName })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  await sendPasswordReset({
    to: user.email,
    firstName: profile?.firstName ?? "there",
    resetUrl,
  });

  return { success: true };
}

export async function resetPasswordAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const token = formData.get("token")?.toString();
  const password = formData.get("password")?.toString();

  if (!token || !password) return { error: "Missing required fields" };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters" };

  const now = new Date();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);

  if (!user) return { error: "Invalid or expired reset link" };

  // Check expiry
  const [{ passwordResetExpiry }] = await db
    .select({ passwordResetExpiry: users.passwordResetExpiry })
    .from(users)
    .where(eq(users.id, user.id));

  if (!passwordResetExpiry || passwordResetExpiry < now) {
    return { error: "This reset link has expired. Please request a new one." };
  }

  const hash = await hashPassword(password);

  await db
    .update(users)
    .set({
      passwordHash: hash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  await createAuditLog({
    actorId: user.id,
    action: AuditActions.USER_PASSWORD_RESET,
    entityType: "user",
    entityId: user.id,
  });

  redirect("/login?reset=success");
}
