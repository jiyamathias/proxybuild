"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  milestoneId: string;
  projectId: string;
}

export function MilestoneApproveButton({ milestoneId, projectId }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function submit(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/milestones/${milestoneId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      if (res.ok) {
        setDone(action === "approve" ? "approved" : "rejected");
        // Refresh page data after short delay
        setTimeout(() => window.location.reload(), 800);
      }
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <p className="text-sm font-medium text-[var(--pb-success)]">
        {done === "approved" ? "✓ Milestone approved" : "Milestone rejected — team notified"}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="default"
        size="sm"
        onClick={() => submit("approve")}
        disabled={loading !== null}
      >
        {loading === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        Approve Milestone
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => submit("reject")}
        disabled={loading !== null}
        className="text-[var(--pb-danger)] hover:bg-[var(--pb-danger)]/10"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
        )}
        Request Changes
      </Button>
    </div>
  );
}
