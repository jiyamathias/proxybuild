"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";
import { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { ProxyBuildLogo } from "@/components/ui/logo";
import { AdminSearch } from "./search";

export function AdminTopNav({ session }: { session: SessionUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="border-b border-[var(--pb-border)] bg-[var(--pb-surface)] px-4 sm:px-6 h-16 flex items-center gap-4 sticky top-0 z-30">
        {/* Mobile logo */}
        <Link href="/admin" className="lg:hidden">
          <ProxyBuildLogo size={36} wordmark />
        </Link>

        {/* Search */}
        <div className="hidden sm:flex flex-1 max-w-md">
          <AdminSearch />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/admin/notifications"
            className="p-2 text-[var(--pb-text-muted)] hover:text-white rounded-lg hover:bg-[var(--pb-surface-elevated)] transition-colors"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <div className="h-8 w-8 rounded-full bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] flex items-center justify-center text-xs font-bold text-white shrink-0">
            {getInitials(session.firstName, session.lastName)}
          </div>
          <button
            className="lg:hidden p-2 text-[var(--pb-text-muted)] hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-0 top-0 bottom-0 w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar session={session} />
          </div>
        </div>
      )}
    </>
  );
}
