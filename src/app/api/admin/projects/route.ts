import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageProjects } from "@/lib/permissions";
import { db } from "@/lib/db";
import { projects, projectMembers, auditLogs } from "@/db/schema";
import { z } from "zod/v4";

const schema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  projectType: z.string(),
  status: z.string().default("PLANNING"),
  currency: z.string().default("NGN"),
  budgetAmount: z.string().nullable().optional(),
  contractValue: z.string().nullable().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  address: z.string().optional(),
  plannedStartDate: z.string().nullable().optional(),
  plannedEndDate: z.string().nullable().optional(),
  projectManagerId: z.string().uuid().nullable().optional(),
  internalNotes: z.string().optional(),
});

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) +
    "-" +
    Date.now().toString(36)
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canManageProjects(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const {
    clientId,
    title,
    description,
    projectType,
    status,
    currency,
    budgetAmount,
    contractValue,
    state,
    city,
    area,
    address,
    plannedStartDate,
    plannedEndDate,
    projectManagerId,
    internalNotes,
  } = body.data;

  const [project] = await db
    .insert(projects)
    .values({
      slug: slugify(title),
      title,
      description: description ?? null,
      projectType: projectType as any,
      status: status as any,
      health: "ON_TRACK",
      clientId,
      currency: currency as any,
      budgetAmount: budgetAmount ?? null,
      contractValue: contractValue ?? null,
      country: "Nigeria",
      state: state ?? null,
      city: city ?? null,
      area: area ?? null,
      address: address ?? null,
      plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : null,
      plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : null,
      internalNotes: internalNotes ?? null,
    })
    .returning();

  // Assign project manager as member
  if (projectManagerId) {
    await db.insert(projectMembers).values({
      projectId: project.id,
      userId: projectManagerId,
      role: "PROJECT_MANAGER",
    });
  }

  await db.insert(auditLogs).values({
    actorId: session.id,
    action: "CREATE",
    entityType: "PROJECT",
    entityId: project.id,
    after: { title, clientId, status, projectType },
  });

  return NextResponse.json({ project }, { status: 201 });
}
