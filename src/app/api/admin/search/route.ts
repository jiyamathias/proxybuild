import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles, projects, consultations } from "@/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || !isStaff(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ projects: [], clients: [], consultations: [] });

  const pattern = `%${q}%`;

  const [matchedProjects, matchedClients, matchedConsultations] = await Promise.all([
    db
      .select({ id: projects.id, title: projects.title, status: projects.status, city: projects.city })
      .from(projects)
      .where(
        or(
          ilike(projects.title, pattern),
          ilike(projects.city, pattern),
          ilike(projects.area, pattern),
          ilike(projects.slug, pattern),
        )
      )
      .limit(5),

    db
      .select({
        id: users.id,
        email: users.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(
        and(
          eq(users.role, "CLIENT"),
          or(
            ilike(users.email, pattern),
            ilike(profiles.firstName, pattern),
            ilike(profiles.lastName, pattern),
          )
        )
      )
      .limit(5),

    db
      .select({ id: consultations.id, firstName: consultations.firstName, lastName: consultations.lastName, email: consultations.email, status: consultations.status })
      .from(consultations)
      .where(
        or(
          ilike(consultations.firstName, pattern),
          ilike(consultations.lastName, pattern),
          ilike(consultations.email, pattern),
          ilike(consultations.projectLocation, pattern),
        )
      )
      .limit(4),
  ]);

  return NextResponse.json({
    projects: matchedProjects,
    clients: matchedClients,
    consultations: matchedConsultations,
  });
}
