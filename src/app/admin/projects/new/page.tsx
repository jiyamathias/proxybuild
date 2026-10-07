export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageProjects } from "@/lib/permissions";
import { db } from "@/lib/db";
import { users, profiles } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { CreateProjectForm } from "@/components/admin/create-project-form";
import { FolderPlus } from "lucide-react";

export default async function NewProjectPage() {
  const session = await getSession();
  if (!session || !canManageProjects(session)) redirect("/admin");

  // All CLIENT users
  const clientRows = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(and(eq(users.role, "CLIENT"), eq(users.isActive, true)));

  // Staff who can be PM
  const staffRows = await db
    .select({
      id: users.id,
      role: users.role,
      firstName: profiles.firstName,
      lastName: profiles.lastName,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        inArray(users.role, [
          "SUPER_ADMIN",
          "ADMIN",
          "PROJECT_MANAGER",
          "SITE_SUPERVISOR",
        ]),
        eq(users.isActive, true)
      )
    );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FolderPlus className="h-6 w-6 text-[var(--pb-text-muted)]" />
          New Project
        </h1>
        <p className="text-sm text-[var(--pb-text-muted)] mt-0.5">
          Create a new construction project and assign it to a client
        </p>
      </div>

      <CreateProjectForm clients={clientRows} staff={staffRows} />
    </div>
  );
}
