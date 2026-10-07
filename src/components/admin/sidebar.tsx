"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  UserCog,
  DollarSign,
  FileText,
  MessageSquare,
  ClipboardList,
  Settings,
  Activity,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { ProxyBuildLogo } from "@/components/ui/logo";
import type { SessionUser } from "@/lib/auth/session";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: FolderOpen, label: "Projects", href: "/admin/projects" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: UserCog, label: "Team", href: "/admin/team" },
  { icon: ClipboardList, label: "Consultations", href: "/admin/consultations" },
  { icon: DollarSign, label: "Finance", href: "/admin/finance" },
  { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Activity, label: "Audit Logs", href: "/admin/audit-logs" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 border-r border-[var(--pb-border)] bg-[var(--pb-surface)] shrink-0 h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[var(--pb-border)] flex items-center justify-between">
        <Link href="/admin">
          <ProxyBuildLogo size={28} className="text-sm font-semibold" />
        </Link>
        <span className="text-[10px] font-medium bg-[var(--pb-green-muted)] text-[var(--pb-green)] px-1.5 py-0.5 rounded">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[var(--pb-green-muted)] text-[var(--pb-green)] font-medium"
                  : "text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-elevated)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge + user */}
      <div className="border-t border-[var(--pb-border)] p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {getInitials(session.firstName, session.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session.firstName} {session.lastName}
            </p>
            <p className="text-xs text-[var(--pb-text-subtle)] truncate capitalize">
              {session.role.toLowerCase().replace(/_/g, " ")}
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
