"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Milestone,
  FileText,
  Image,
  DollarSign,
  MessageSquare,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

const tabs = [
  { label: "Overview", href: "", icon: LayoutGrid },
  { label: "Updates", href: "/updates", icon: TrendingUp },
  { label: "Milestones", href: "/milestones", icon: Milestone },
  { label: "Media", href: "/media", icon: Image },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Payments", href: "/payments", icon: DollarSign },
  { label: "Changes", href: "/change-orders", icon: ClipboardList },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/projects/${projectId}`;

  return (
    <div className="border-b border-[var(--pb-border)] overflow-x-auto">
      <nav className="flex gap-0 min-w-max">
        {tabs.map((tab) => {
          const href = `${base}${tab.href}`;
          const active =
            tab.href === ""
              ? pathname === base
              : pathname.startsWith(href);
          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap",
                active
                  ? "border-[var(--pb-orange)] text-white font-medium"
                  : "border-transparent text-[var(--pb-text-muted)] hover:text-white hover:border-[var(--pb-border)]"
              )}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
