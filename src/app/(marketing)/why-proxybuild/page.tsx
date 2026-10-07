import type { Metadata } from "next";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Lock,
  Users,
  Gauge,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Why ProxyBuild Africa — The Safest Way to Build in Nigeria from Abroad",
  description:
    "Discover why Africans in the UK, USA, Canada and beyond choose ProxyBuild to build back home. Our team executes your project directly — no outsourcing, no middlemen, full transparency and milestone-gated payments.",
  keywords: [
    "why ProxyBuild Africa",
    "safe way to build house Nigeria",
    "trusted construction company Nigeria diaspora",
    "avoid construction scam Nigeria",
    "build Nigeria from UK safely",
    "diaspora Nigeria construction problem",
    "construction management Nigeria transparent",
  ],
  alternates: { canonical: "https://proxybuild.africa/why-proxybuild" },
  openGraph: {
    title: "Why ProxyBuild Africa — Build Back Home Without the Fear",
    description:
      "ProxyBuild's team is on your site, executing the build directly. Real-time dashboard. Milestone-gated payments. No outsourcing.",
    url: "https://proxybuild.africa/why-proxybuild",
  },
};

const problems = [
  "Contractors disappear after receiving payment",
  "Materials are substituted with cheaper alternatives",
  "Projects stall for months without explanation",
  "Costs balloon far beyond the original estimate",
  "Family members trusted to supervise get overwhelmed",
  "No visibility into what is actually happening on site",
  "Unfinished buildings sit for years, depreciating",
];

const differences = [
  {
    icon: Eye,
    title: "Complete Visibility",
    desc: "Your dedicated client dashboard gives you real-time access to site photos, milestone status, financial summaries and team updates — from wherever you are in the world.",
  },
  {
    icon: Lock,
    title: "Payment Protection",
    desc: "We never release funds for the next phase until the current milestone is photographed, inspected and signed off. Your money only moves when work is verified complete.",
  },
  {
    icon: Users,
    title: "Our Team On Your Site",
    desc: "ProxyBuild's own project managers, site supervisors and tradespeople are the ones on the ground. Every person working on your build is part of our team — trained, accountable and performance-tracked.",
  },
  {
    icon: Gauge,
    title: "Direct Execution, Not Referrals",
    desc: "We are not a middleman or a platform that connects you to someone else. ProxyBuild directly executes your project — our people are on your site from day one to handover, and we own every outcome.",
  },
];

const testimonials = [
  {
    quote:
      "I had tried twice with family supervising and both times the money was gone with nothing to show. ProxyBuild finished my four-bedroom in 14 months. I cried at handover.",
    name: "Adaeze O.",
    location: "London, UK · Project: 4-bed residence, Lekki",
    initials: "AO",
  },
  {
    quote:
      "The dashboard was the thing that got my wife on board. She could see photos every week. When the roof was going up she was watching from Toronto. No stress, no drama.",
    name: "Emeka B.",
    location: "Toronto, Canada · Project: New build, Abuja",
    initials: "EB",
  },
  {
    quote:
      "What I appreciated most was the honesty. When there was a delay because of rains, they told me immediately. No hiding, no excuses. I trusted them completely after that.",
    name: "Yetunde A.",
    location: "Houston, USA · Project: Renovation, Ibadan",
    initials: "YA",
  },
];

export default function WhyProxyBuildPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-4">
            Why ProxyBuild
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            You Should Be Able to Build Back Home Without the Fear
          </h1>
          <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed">
            Diaspora Africans send billions home to build every year. A painful
            proportion of that money is lost. ProxyBuild exists to change
            that — permanently.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full mb-6">
              <AlertTriangle className="h-4 w-4" />
              The Reality for Too Many Diaspora Builders
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Building from Abroad is Broken
            </h2>
            <p className="text-[var(--pb-text-muted)] mb-6 leading-relaxed">
              Without someone you fully trust managing your project on the
              ground, construction back home is riddled with risks that can cost
              you years of savings and enormous emotional stress.
            </p>
            <ul className="space-y-3">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-[var(--pb-text-muted)]">
                  <X className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--pb-green)] bg-[var(--pb-green-muted)] border border-[var(--pb-green)]/20 px-3 py-1.5 rounded-full mb-6">
              <CheckCircle2 className="h-4 w-4" />
              The ProxyBuild Difference
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Your Build, Fully Managed
            </h2>
            <p className="text-[var(--pb-text-muted)] mb-6 leading-relaxed">
              ProxyBuild is not a referral service. We are not a middleman.
              Our own project managers, site supervisors and tradespeople are
              on your site, executing the build directly — from ground-breaking
              to handover. We own every outcome.
            </p>
            <div className="space-y-4">
              {differences.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3.5 p-4 rounded-xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
                  <div className="h-9 w-9 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-[var(--pb-green)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-[var(--pb-border)] bg-[var(--pb-surface)] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">Heard From Our Clients</h2>
            <p className="mt-3 text-[var(--pb-text-muted)] max-w-xl mx-auto">
              Real stories from diaspora clients who built their homes through ProxyBuild.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-bg)]"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-[var(--pb-green)] fill-[var(--pb-green)]"
                    />
                  ))}
                </div>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--pb-green-muted)] flex items-center justify-center text-xs font-bold text-[var(--pb-green)] shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[var(--pb-text-subtle)]">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Build Deserves a Trusted Manager
          </h2>
          <p className="text-[var(--pb-text-muted)] mb-8">
            Join hundreds of diaspora clients who have built back home with
            confidence through ProxyBuild. Start with a free, no-obligation consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book-consultation"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-[var(--pb-green)] text-white font-semibold hover:bg-[var(--pb-green-hover)] transition-colors"
            >
              Book a Free Consultation
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:text-white hover:border-[var(--pb-text-subtle)] transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
