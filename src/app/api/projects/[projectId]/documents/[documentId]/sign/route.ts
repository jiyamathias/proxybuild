import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser } from "@/lib/services/projects";
import { db } from "@/lib/db";
import {
  documents,
  documentSignatures,
  notifications,
  projectMembers,
  users,
} from "@/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { createAuditLog, AuditActions } from "@/lib/audit";
import { z } from "zod/v4";

export const AGREEMENT_STATEMENT =
  "I confirm that I have read and understood this document, and I agree to be bound by its terms. I understand that typing my full name below constitutes my legally binding electronic signature.";

const schema = z.object({
  signerName: z.string().min(2).max(200),
  agreed: z.literal(true),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, documentId } = await params;
  const project = await getProjectForUser(projectId, session);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the project's client signs
  if (project.clientId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: "You must type your full name and confirm agreement." },
      { status: 400 }
    );
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.projectId, projectId)))
    .limit(1);

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!doc.requiresSignature) {
    return NextResponse.json(
      { error: "This document does not require a signature." },
      { status: 400 }
    );
  }
  if (!doc.isClientVisible) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // One signature per signer per document
  const existing = await db
    .select({ id: documentSignatures.id })
    .from(documentSignatures)
    .where(
      and(
        eq(documentSignatures.documentId, documentId),
        eq(documentSignatures.signerId, session.id)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "You have already signed this document." },
      { status: 409 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    null;

  const [signature] = await db
    .insert(documentSignatures)
    .values({
      documentId,
      projectId,
      signerId: session.id,
      signerName: body.data.signerName.trim(),
      agreementStatement: AGREEMENT_STATEMENT,
      documentVersion: doc.version,
      documentStorageKey: doc.storageKey,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? null,
    })
    .returning();

  // Tell the team
  const assigned = await db
    .select({ id: projectMembers.userId })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        isNull(projectMembers.removedAt)
      )
    );

  const staff =
    assigned.length > 0
      ? assigned
      : await db
          .select({ id: users.id })
          .from(users)
          .where(
            and(
              inArray(users.role, ["SUPER_ADMIN", "ADMIN"]),
              eq(users.isActive, true)
            )
          );

  if (staff.length > 0) {
    await db.insert(notifications).values(
      staff.map((s) => ({
        userId: s.id,
        type: "NEW_DOCUMENT" as const,
        title: `Document signed: ${doc.title}`,
        body: `${body.data.signerName.trim()} signed ${doc.title} for ${project.title}.`,
        projectId,
        actionUrl: `/admin/projects/${projectId}/documents`,
      }))
    );
  }

  await createAuditLog({
    actorId: session.id,
    action: AuditActions.DOCUMENT_SIGNED,
    entityType: "document",
    entityId: documentId,
    projectId,
    ipAddress: ip ?? undefined,
    after: {
      signerName: body.data.signerName.trim(),
      documentVersion: doc.version,
      signedAt: signature.signedAt,
    },
  });

  return NextResponse.json({ success: true, signedAt: signature.signedAt });
}
