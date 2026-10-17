import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  projects,
  milestones,
  projectUpdates,
  projectMedia,
  payments,
  users,
  profiles,
} from "@/db/schema";
import { eq, and, gte, inArray, isNull } from "drizzle-orm";
import { sendWeeklyDigest, type DigestProject } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { isAuthorizedCron } from "@/lib/cron/auth";

// Digest covers the trailing week
const WINDOW_DAYS = 7;

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // Active projects with a client who can actually receive mail
  const rows = await db
    .select({
      projectId: projects.id,
      title: projects.title,
      progressPercent: projects.progressPercent,
      currency: projects.currency,
      budgetAmount: projects.budgetAmount,
      clientId: projects.clientId,
      email: users.email,
      firstName: profiles.firstName,
    })
    .from(projects)
    .innerJoin(users, eq(users.id, projects.clientId))
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        inArray(projects.status, ["ACTIVE", "CONTRACT", "PLANNING"]),
        eq(users.isActive, true)
      )
    );

  if (rows.length === 0) {
    return NextResponse.json({ sent: 0, recipients: 0 });
  }

  const projectIds = rows.map((r) => r.projectId);

  // Pull the week's activity in bulk rather than per project
  const [weekUpdates, weekMedia, allMilestones, successfulPayments] =
    await Promise.all([
      db
        .select({
          projectId: projectUpdates.projectId,
          title: projectUpdates.title,
          createdAt: projectUpdates.createdAt,
        })
        .from(projectUpdates)
        .where(
          and(
            inArray(projectUpdates.projectId, projectIds),
            gte(projectUpdates.createdAt, since),
            eq(projectUpdates.isClientVisible, true)
          )
        ),
      db
        .select({ projectId: projectMedia.projectId })
        .from(projectMedia)
        .where(
          and(
            inArray(projectMedia.projectId, projectIds),
            gte(projectMedia.createdAt, since),
            eq(projectMedia.isClientVisible, true)
          )
        ),
      db
        .select({
          projectId: milestones.projectId,
          title: milestones.title,
          clientVisibleTitle: milestones.clientVisibleTitle,
          status: milestones.status,
          approvalStatus: milestones.approvalStatus,
          isClientVisible: milestones.isClientVisible,
          sequence: milestones.sequence,
        })
        .from(milestones)
        .where(inArray(milestones.projectId, projectIds)),
      db
        .select({ projectId: payments.projectId, amount: payments.amount })
        .from(payments)
        .where(
          and(
            inArray(payments.projectId, projectIds),
            eq(payments.status, "SUCCESSFUL")
          )
        ),
    ]);

  // Index by project
  const updatesBy = new Map<string, { title: string; createdAt: Date }[]>();
  for (const u of weekUpdates) {
    const list = updatesBy.get(u.projectId) ?? [];
    list.push({ title: u.title, createdAt: u.createdAt });
    updatesBy.set(u.projectId, list);
  }

  const photosBy = new Map<string, number>();
  for (const m of weekMedia) {
    photosBy.set(m.projectId, (photosBy.get(m.projectId) ?? 0) + 1);
  }

  const paidBy = new Map<string, number>();
  for (const p of successfulPayments) {
    paidBy.set(p.projectId, (paidBy.get(p.projectId) ?? 0) + Number(p.amount));
  }

  const currentBy = new Map<string, string>();
  const awaitingBy = new Map<string, string>();
  for (const m of allMilestones) {
    if (!m.isClientVisible) continue;
    const label = m.clientVisibleTitle ?? m.title;
    if (m.status === "IN_PROGRESS" && !currentBy.has(m.projectId)) {
      currentBy.set(m.projectId, label);
    }
    if (m.approvalStatus === "AWAITING_CLIENT" && !awaitingBy.has(m.projectId)) {
      awaitingBy.set(m.projectId, label);
    }
  }

  // Group projects per client so each person gets one email
  const byClient = new Map<
    string,
    { email: string; firstName: string; projects: DigestProject[] }
  >();

  for (const r of rows) {
    const updatesThisWeek = updatesBy.get(r.projectId) ?? [];
    const newPhotoCount = photosBy.get(r.projectId) ?? 0;
    const awaitingApproval = awaitingBy.get(r.projectId) ?? null;

    const budget = Number(r.budgetAmount ?? 0);
    const paid = paidBy.get(r.projectId) ?? 0;
    const outstanding = budget - paid;

    // Skip quiet projects with nothing to report, so the digest never feels like noise
    const hasNews =
      updatesThisWeek.length > 0 || newPhotoCount > 0 || awaitingApproval !== null;
    if (!hasNews) continue;

    const entry = byClient.get(r.clientId) ?? {
      email: r.email,
      firstName: r.firstName,
      projects: [],
    };

    entry.projects.push({
      id: r.projectId,
      title: r.title,
      progressPercent: r.progressPercent,
      currentMilestone: currentBy.get(r.projectId) ?? null,
      updatesThisWeek,
      newPhotoCount,
      outstandingLabel:
        outstanding > 0 ? formatCurrency(outstanding, r.currency) : null,
      awaitingApproval,
    });

    byClient.set(r.clientId, entry);
  }

  const results = await Promise.allSettled(
    [...byClient.values()].map((c) =>
      sendWeeklyDigest({
        to: c.email,
        firstName: c.firstName,
        projects: c.projects,
      })
    )
  );

  const sent = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  ).length;

  return NextResponse.json({
    recipients: byClient.size,
    sent,
    failed: results.length - sent,
  });
}
