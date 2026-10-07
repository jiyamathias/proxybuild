"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, LayoutDashboard, FolderOpen, Settings } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";
import { useState } from "react";

export function DashboardNav({ session }: { session: SessionUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FolderOpen, label: "Projects", href: "/dashboard/projects" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <>
      <header className="border-b border-[var(--pb-border)] bg-[var(--pb-surface)] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        {/* Mobile logo */}
        <Link href="/dashboard" className="lg:hidden">
          <span className="text-[var(--pb-green)] font-bold text-lg tracking-tight">
            Proxy<span className="text-white">Build</span>
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/dashboard/notifications"
            className="p-2 text-[var(--pb-text-muted)] hover:text-white rounded-lg hover:bg-[var(--pb-surface-elevated)] transition-colors"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <div className="h-8 w-8 rounded-full bg-[var(--pb-green-muted)] flex items-center justify-center text-xs font-bold text-[var(--pb-green)] shrink-0">
            {getInitials(session.firstName, session.lastName)}
          </div>
          {/* Mobile menu trigger */}
          <button
            className="lg:hidden p-2 text-[var(--pb-text-muted)] hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[var(--pb-border)] bg-[var(--pb-surface)] px-3 py-3">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-[var(--pb-green-muted)] text-[var(--pb-green)] font-medium"
                      : "text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface-elevated)]"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
