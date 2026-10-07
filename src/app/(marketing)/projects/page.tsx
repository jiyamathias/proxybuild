import type { Metadata } from "next";
import { ComingSoon } from "@/components/marketing/coming-soon";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <ComingSoon
      title="Our Projects"
      description="A showcase of completed and ongoing projects is coming soon. We'll share real client stories, site photos, and outcomes here. In the meantime, book a consultation."
    />
  );
}
