"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FolderOpen, label: "My Projects", href: "/dashboard/projects" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--pb-border)] bg-[var(--pb-surface)] shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--pb-border)]">
        <Link href="/dashboard">
          <span className="text-[var(--pb-orange)] font-bold text-lg tracking-tight">
            Proxy<span className="text-white">Build</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[var(--pb-orange-muted)] text-[var(--pb-orange)] font-medium"
                  : "text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-elevated)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-[var(--pb-border)] p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-[var(--pb-orange-muted)] flex items-center justify-center text-xs font-bold text-[var(--pb-orange)] shrink-0">
            {getInitials(session.firstName, session.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session.firstName} {session.lastName}
            </p>
            <p className="text-xs text-[var(--pb-text-subtle)] truncate">
              {session.email}
            </p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-elevated)] transition-colors mt-1"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
