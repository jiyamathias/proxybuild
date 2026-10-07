import Link from "next/link";
import { Building2, ShieldCheck, BarChart3 } from "lucide-react";
import { ProxyBuildLogo } from "@/components/ui/logo";
import { CopyrightYear } from "@/components/shared/copyright-year";

const features = [
  {
    icon: BarChart3,
    title: "Real-time progress tracking",
    desc: "Live photo updates and milestone status from every site visit.",
  },
  {
    icon: ShieldCheck,
    title: "Vetted, trusted professionals",
    desc: "Every contractor and site supervisor is verified before appointment.",
  },
  {
    icon: Building2,
    title: "Full financial transparency",
    desc: "See exactly where your money goes — down to every receipt.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel (desktop only) ────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] shrink-0 flex-col justify-between bg-[var(--pb-navy)] border-r border-[var(--pb-border)] p-10 relative overflow-hidden">
        {/* Subtle green radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 0% 100%, rgba(22,163,74,0.12) 0%, transparent 70%)",
          }}
        />
        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" aria-label="Back to home">
            <ProxyBuildLogo size={36} wordmark />
          </Link>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              We Build Your Vision,
              <br />
              Even While You're Away.
            </h2>
            <p className="mt-3 text-sm text-[var(--pb-text-muted)] leading-relaxed max-w-xs">
              Construction management built for the African diaspora. Structured
              milestones, trusted teams, and full digital transparency.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-3.5">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[var(--pb-green)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">
                    {title}
                  </p>
                  <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer copy */}
        <div className="relative z-10">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--pb-text-subtle)] uppercase mb-1.5">
            Connect · Build · Grow
          </p>
          <p className="text-xs text-[var(--pb-text-subtle)]">
            © <CopyrightYear /> ProxyBuild Africa. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-[var(--pb-border)] px-4 py-4">
          <Link href="/" aria-label="Back to home">
            <ProxyBuildLogo size={28} wordmark />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          {children}
        </main>

        <footer className="lg:hidden border-t border-[var(--pb-border)] px-4 py-4 text-center">
          <p className="text-xs text-[var(--pb-text-subtle)]">
            © <CopyrightYear /> ProxyBuild Africa. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
