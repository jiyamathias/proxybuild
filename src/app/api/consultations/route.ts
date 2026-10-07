import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";
import { consultations } from "@/db/schema";
import {
  sendConsultationConfirmation,
  sendConsultationAdminNotification,
} from "@/lib/email";
import { createAuditLog, AuditActions } from "@/lib/audit";

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

    const [consultation] = await db
      .insert(consultations)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
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
