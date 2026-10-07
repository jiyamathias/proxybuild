export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/permissions";
import {
  getProjectForUser,
  getProjectMessages,
} from "@/lib/services/projects";
import { MessageThread } from "@/components/dashboard/project/message-thread";
import Link from "next/link";

export default async function AdminProjectMessagesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session)) redirect("/dashboard");

  const { projectId } = await params;
  const [project, messages] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMessages(projectId),
  ]);
  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/admin/projects/${projectId}`}
          className="text-[var(--pb-text-muted)] hover:text-white transition-colors"
        >
          {project.title}
        </Link>
        <span className="text-[var(--pb-border)]">/</span>
        <span className="text-white">Messages</span>
      </div>
      <MessageThread
        projectId={projectId}
        initialMessages={messages}
        currentUserId={session.id}
        currentUserRole={session.role}
      />
    </div>
  );
}
