"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function markAllRead() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        setDone(true);
        setTimeout(() => window.location.reload(), 600);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) return null;

  return (
    <Button variant="ghost" size="sm" onClick={markAllRead} disabled={loading}>
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
      )}
      Mark all read
    </Button>
  );
}
