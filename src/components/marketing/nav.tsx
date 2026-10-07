"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { ProxyBuildLogo } from "@/components/ui/logo";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--pb-bg-near-black)]/95 backdrop-blur-md border-b border-[var(--pb-border)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <ProxyBuildLogo size={30} wordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors rounded-lg hover:bg-[var(--pb-surface)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Button asChild size="sm">
              <Link href="/book-consultation">Book Consultation</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-[var(--pb-text-muted)] hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-[var(--pb-border)] bg-[var(--pb-bg-near-black)]">
          <nav className="px-4 py-4 space-y-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm text-[var(--pb-text-muted)] hover:text-white rounded-lg hover:bg-[var(--pb-surface)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[var(--pb-border)] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm text-[var(--pb-text-muted)] hover:text-white rounded-lg hover:bg-[var(--pb-surface)] transition-colors"
              >
                Sign In
              </Link>
              <Button asChild className="w-full">
                <Link href="/book-consultation" onClick={() => setOpen(false)}>
                  Book Consultation
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
