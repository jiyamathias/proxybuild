"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  changeOrderId: string;
  projectId: string;
}

export function ChangeOrderApproveButton({ changeOrderId, projectId }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  async function respond(decision: "approve" | "reject") {
    setLoading(decision);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/change-orders/${changeOrderId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );
      if (res.ok) {
        setDone(decision === "approve" ? "approved" : "rejected");
        setTimeout(() => window.location.reload(), 800);
      }
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    return (
      <p className="text-sm font-medium text-[var(--pb-success)]">
        {done === "approved" ? "✓ Change order approved" : "Change order rejected"}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="default"
        size="sm"
        onClick={() => respond("approve")}
        disabled={loading !== null}
      >
        {loading === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        Approve
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => respond("reject")}
        disabled={loading !== null}
        className="text-[var(--pb-danger)] hover:bg-[var(--pb-danger)]/10"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
        )}
        Reject
      </Button>
    </div>
  );
}
