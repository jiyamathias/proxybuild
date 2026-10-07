import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Eye,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Home,
  Building2,
  Wrench,
  Hammer,
  TreePine,
  Zap,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Consult",
    description:
      "Book a free consultation. Tell us about your project — location, type, budget and timeline.",
  },
  {
    number: "02",
    title: "Assess",
    description:
      "Our team visits the site, takes measurements, photos and documents the current state.",
  },
  {
    number: "03",
    title: "Plan",
    description:
      "We coordinate architects, engineers and quantity surveyors to produce drawings, BOQ and cost estimates.",
  },
  {
    number: "04",
    title: "Approve",
    description:
      "Review the proposal, timeline and milestones. Approve the plan and payment schedule.",
  },
  {
    number: "05",
    title: "Build",
    description:
      "ProxyBuild assigns managed construction teams and begins execution under direct supervision.",
  },
  {
    number: "06",
    title: "Track",
    description:
      "Follow every milestone from your dashboard. View photos, documents and financial updates in real time.",
  },
  {
    number: "07",
    title: "Complete",
    description:
      "Final inspection, snagging, documentation and handover. Your project, delivered.",
  },
];

const services = [
  {
    icon: Home,
    title: "Residential New Build",
    description:
      "End-to-end construction of new homes across Nigeria, from foundation to handover.",
  },
  {
    icon: Building2,
    title: "Commercial Projects",
    description:
      "Office buildings, retail spaces and mixed-use developments managed with full accountability.",
  },
  {
    icon: Wrench,
    title: "Renovation",
    description:
      "Transform an existing property — structural changes, extensions or complete refurbishment.",
  },
  {
    icon: Hammer,
    title: "Finishing & Fitting",
    description:
      "Tiling, painting, electrical, plumbing fixtures and all internal finishes.",
  },
  {
    icon: TreePine,
    title: "Site Preparation",
    description:
      "Land clearing, excavation, drainage and site infrastructure before construction begins.",
  },
  {
    icon: Zap,
    title: "Property Maintenance",
    description:
      "Post-completion maintenance, inspections, repairs and property upkeep for Nigerians abroad.",
  },
];

const whyPoints = [
  {
    icon: Shield,
    title: "One Accountable Company",
    description:
      "ProxyBuild is a single point of accountability. Not a marketplace of freelancers. One company owns the outcome.",
  },
  {
    icon: Users,
    title: "Managed Construction Teams",
    description:
      "Our construction teams work under ProxyBuild's direct supervision and operational standards.",
  },
  {
    icon: TrendingUp,
    title: "Structured Milestone System",
    description:
      "Every project runs on approved milestones. Payments are tied to verified progress, not promises.",
  },
  {
    icon: Eye,
    title: "Full Digital Visibility",
    description:
      "Your dashboard shows every update, photo, document and payment record in real time.",
  },
  {
    icon: FileText,
    title: "Professional Documentation",
    description:
      "Every drawing, receipt, permit, report and approval is stored and accessible from anywhere.",
  },
  {
    icon: Clock,
    title: "Regular Progress Reporting",
    description:
      "Scheduled updates keep you informed without having to chase anyone for information.",
  },
];

const faqs = [
  {
    q: "Do I need to be in Nigeria to work with ProxyBuild?",
    a: "No. ProxyBuild is specifically designed for clients who are abroad. You only need an internet connection and a browser.",
  },
  {
    q: "Can I monitor construction progress remotely?",
    a: "Yes. Your client dashboard gives you real-time access to photos, videos, milestone status, documents and financial records at any time.",
  },
  {
    q: "How are payments handled?",
    a: "Payments are milestone-based. You fund specific phases of the project and payment is tied to verified completion of each milestone, not upfront in a lump sum.",
  },
  {
    q: "What types of projects does ProxyBuild handle?",
    a: "Residential new builds, renovations, finishing, site preparation, commercial projects and property maintenance. If you are unsure whether your project qualifies, book a free consultation.",
  },
  {
    q: "Does ProxyBuild work outside Lagos?",
    a: "Yes. We work across multiple Nigerian states including Ogun, Abuja, Oyo, Enugu, Delta, Rivers and others. Coverage continues to expand.",
  },
  {
    q: "I already have land. Where do I start?",
    a: "Book a consultation. Tell us about your land, your vision and your budget. We will assess feasibility and put together a plan.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(var(--pb-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--pb-border) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: 0.15,
          }}
        />
        {/* Radial fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,90,19,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 border border-[var(--pb-green)]/30 bg-[var(--pb-green-muted)] rounded-full px-3 py-1 text-xs text-[var(--pb-green)] font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-green)] animate-pulse" />
                Technology-Enabled Construction Execution
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                We Build{" "}
                <span className="text-[var(--pb-green)]">Your Vision</span>
                <br />
                <span className="text-white">
                  Even While You&apos;re Away.
                </span>
              </h1>

              <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed mb-10 max-w-lg">
                Eliminate the risk of sending money home. ProxyBuild handles
                planning, procurement and execution with managed construction
                teams and transparent milestone-based project management.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/book-consultation">
                    Book a Free Consultation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a
                    href="https://wa.me/234"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp Us
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-5 mt-10">
                {[
                  "Managed construction teams",
                  "Milestone-based payments",
                  "Real-time project dashboard",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 text-sm text-[var(--pb-text-muted)]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[var(--pb-success)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dashboard preview */}
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(232,90,19,0.12) 0%, transparent 70%)",
                }}
              />
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROBLEM
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Building Back Home{" "}
              <span className="text-[var(--pb-green)]">
                Shouldn&apos;t Mean Losing Control.
              </span>
            </h2>
            <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed">
              Thousands of Africans in the diaspora send money home to build.
              Too many return years later to find a project nowhere near what
              they paid for.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Money sent without proper accounting",
              "Inflated material prices",
              "Contractors disappearing mid-project",
              "No documentation or receipts",
              "Poor workmanship with no recourse",
              "Unauthorized changes to the design",
              "Endless delays with no explanation",
              "Family disputes over who controls the funds",
              "Returning home to an unfinished building",
            ].map((problem) => (
              <div
                key={problem}
                className="flex items-start gap-3 bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl p-4"
              >
                <div className="mt-0.5 h-5 w-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <p className="text-sm text-[var(--pb-text-muted)]">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)]" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-[var(--pb-green)] uppercase tracking-widest mb-3">
              The Process
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Your Project. Managed From Start to Finish.
            </h2>
            <p className="text-[var(--pb-text-muted)]">
              A structured, accountable process designed specifically for
              clients who are building from abroad.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl p-6 group"
              >
                <div className="text-5xl font-black text-[var(--pb-border)] mb-4 select-none group-hover:text-[var(--pb-green)]/20 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden xl:block absolute top-6 -right-2.5 z-10">
                    <ChevronRight className="h-5 w-5 text-[var(--pb-border)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          DASHBOARD SECTION
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-[var(--pb-green)] uppercase tracking-widest mb-3">
                Client Dashboard
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Track Your Building From{" "}
                <span className="text-[var(--pb-green)]">
                  Anywhere in the World.
                </span>
              </h2>
              <p className="text-[var(--pb-text-muted)] leading-relaxed mb-8">
                Log in from London, Toronto or Dubai. See construction photos
                uploaded this morning, the current milestone status, payment
                records and a direct message thread with your project manager.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  "Real-time construction photos and videos",
                  "Milestone progress and approval tracking",
                  "Full payment history and outstanding balances",
                  "Secure document storage and access",
                  "Direct messaging with your ProxyBuild team",
                  "Change order review and approval",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[var(--pb-green)] shrink-0" />
                    <span className="text-sm text-[var(--pb-text-muted)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg">
                <Link href="/book-consultation">
                  Start Your Project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-8 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(232,90,19,0.1) 0%, transparent 70%)",
                }}
              />
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-[var(--pb-green)] uppercase tracking-widest mb-3">
              What We Build
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Services</h2>
            <p className="text-[var(--pb-text-muted)]">
              From the first brick to the final coat of paint — and beyond.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-[var(--pb-surface)] border border-[var(--pb-border)] hover:border-[var(--pb-green)]/40 rounded-xl p-6 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center mb-4 group-hover:bg-[var(--pb-green)]/20 transition-colors">
                  <service.icon className="h-5 w-5 text-[var(--pb-green)]" />
                </div>
                <h3 className="font-bold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY PROXYBUILD
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-sm font-semibold text-[var(--pb-green)] uppercase tracking-widest mb-3">
              Our Advantage
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why ProxyBuild
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyPoints.map((point) => (
              <div
                key={point.title}
                className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center mb-4">
                  <point.icon className="h-5 w-5 text-[var(--pb-green)]" />
                </div>
                <h3 className="font-bold text-white mb-2">{point.title}</h3>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[var(--pb-green)] uppercase tracking-widest mb-3">
              Common Questions
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold">FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-[var(--pb-surface)] border border-[var(--pb-border)] rounded-xl p-6"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════ */}
      <section className="py-24 border-t border-[var(--pb-border)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your dream home{" "}
            <span className="text-[var(--pb-green)]">
              shouldn&apos;t wait for retirement.
            </span>
          </h2>
          <p className="text-lg text-[var(--pb-text-muted)] mb-10 max-w-2xl mx-auto">
            You are abroad. Your project doesn&apos;t have to wait. Book a free
            consultation and let ProxyBuild turn your vision into a building.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="xl">
              <Link href="/book-consultation">
                Book a Free Consultation
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a
                href="https://wa.me/234"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
