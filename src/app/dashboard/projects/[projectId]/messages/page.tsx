export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getProjectForUser,
  getProjectMessages,
} from "@/lib/services/projects";
import { MessageThread } from "@/components/dashboard/project/message-thread";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { projectId } = await params;
  const [project, messages] = await Promise.all([
    getProjectForUser(projectId, session),
    getProjectMessages(projectId),
  ]);
  if (!project) notFound();

  return (
    <MessageThread
      projectId={projectId}
      initialMessages={messages}
      currentUserId={session.id}
      currentUserRole={session.role}
    />
  );
}
