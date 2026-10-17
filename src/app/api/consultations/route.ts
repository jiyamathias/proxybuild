import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { consultations, notifications, users } from "@/db/schema";
import { and, eq, gte, count, inArray } from "drizzle-orm";
import {
  sendConsultationConfirmation,
  sendConsultationAdminNotification,
} from "@/lib/email";
import { createAuditLog, AuditActions } from "@/lib/audit";

const MAX_PER_IP_PER_HOUR = 3;
const MAX_PER_EMAIL_PER_DAY = 2;

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  countryOfResidence: z.string().min(1),
  preferredContact: z.string().optional(),
  projectLocation: z.string().min(1),
  projectState: z.string().optional(),
  projectType: z.string().min(1),
  landStatus: z.string().optional(),
  estimatedBudget: z.string().optional(),
  desiredTimeline: z.string().optional(),
  description: z.string().min(20),
  // Hidden field — real users never fill this; bots do
  website: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? undefined;

    // Honeypot tripped — pretend success so the bot doesn't retry
    if (data.website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [ipRecent, emailRecent] = await Promise.all([
      ip
        ? db
            .select({ value: count() })
            .from(consultations)
            .where(
              and(
                eq(consultations.ipAddress, ip),
                gte(consultations.createdAt, oneHourAgo)
              )
            )
        : Promise.resolve([{ value: 0 }]),
      db
        .select({ value: count() })
        .from(consultations)
        .where(
          and(
            eq(consultations.email, data.email.toLowerCase()),
            gte(consultations.createdAt, oneDayAgo)
          )
        ),
    ]);

    if (ipRecent[0].value >= MAX_PER_IP_PER_HOUR) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (emailRecent[0].value >= MAX_PER_EMAIL_PER_DAY) {
      return NextResponse.json(
        {
          error:
            "We've already received your request. Our team will be in touch shortly.",
        },
        { status: 429 }
      );
    }

    const [consultation] = await db
      .insert(consultations)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        countryOfResidence: data.countryOfResidence,
        preferredContact: data.preferredContact,
        projectLocation: data.projectLocation,
        projectState: data.projectState,
        projectType: data.projectType,
        landStatus: data.landStatus as "OWNED_WITH_TITLE" | "OWNED_WITHOUT_TITLE" | "FAMILY_LAND" | "NOT_YET_ACQUIRED" | "OTHER" | undefined,
        estimatedBudget: data.estimatedBudget,
        desiredTimeline: data.desiredTimeline,
        description: data.description,
        ipAddress: ip,
      })
      .returning({ id: consultations.id });

    // Notify staff in-app so new leads surface on the admin bell
    const staffTargets = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          inArray(users.role, ["SUPER_ADMIN", "ADMIN"]),
          eq(users.isActive, true)
        )
      );

    if (staffTargets.length > 0) {
      await db.insert(notifications).values(
        staffTargets.map((t) => ({
          userId: t.id,
          type: "CONSULTATION_RECEIVED" as const,
          title: `New consultation: ${data.firstName} ${data.lastName}`,
          body: `${data.projectType} in ${data.projectLocation} — from ${data.countryOfResidence}`,
          actionUrl: `/admin/consultations/${consultation.id}`,
        }))
      );
    }

    // Fire emails asynchronously — don't block the response
    Promise.allSettled([
      sendConsultationConfirmation({
        to: data.email,
        firstName: data.firstName,
        projectLocation: data.projectLocation,
      }),
      sendConsultationAdminNotification({
        consultationId: consultation.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        country: data.countryOfResidence,
        projectLocation: data.projectLocation,
        projectType: data.projectType,
        estimatedBudget: data.estimatedBudget,
        description: data.description,
      }),
      createAuditLog({
        action: AuditActions.CONSULTATION_CREATED,
        entityType: "consultation",
        entityId: consultation.id,
        actorEmail: data.email,
        ipAddress: ip,
        metadata: { name: `${data.firstName} ${data.lastName}`, country: data.countryOfResidence },
      }),
    ]);

    return NextResponse.json({ success: true, id: consultation.id }, { status: 201 });
  } catch (err) {
    console.error("[Consultation API]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
