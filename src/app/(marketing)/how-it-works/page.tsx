import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  FileText,
  HardHat,
  Smartphone,
  KeyRound,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Discover ProxyBuild's 5-step process — from consultation to completed construction — all managed remotely with full transparency.",
};

const steps = [
  {
    number: "01",
    icon: Calendar,
    title: "Book a Free Consultation",
    desc: "Tell us about your project — the location, scope, timeline and budget you have in mind. Our team will review your brief, ask the right questions and give you an honest assessment of what is achievable. There is no obligation and no cost.",
    details: [
      "30–60 minute consultation call",
      "We review your land documents and any existing plans",
      "Honest feasibility assessment",
      "Indication of project timeline and budget range",
    ],
  },
  {
    number: "02",
    icon: FileText,
    title: "Receive Your Project Plan",
    desc: "Once you decide to proceed, we produce a detailed project plan including a phased milestone schedule, an itemised bill of quantities, a payment plan and a proposed team. You review and approve everything before work starts.",
    details: [
      "Phased milestone schedule with clear deliverables",
      "Itemised bill of quantities and cost breakdown",
      "Structured payment plan tied to milestones",
      "Proposed site team and contractor roster",
    ],
  },
  {
    number: "03",
    icon: HardHat,
    title: "We Manage Everything On the Ground",
    desc: "Our site supervisors and project managers take over. We procure materials, coordinate trades, manage contractors and hold every party accountable to the agreed schedule and budget. You never have to chase anyone — we do.",
    details: [
      "Dedicated site supervisor on your project",
      "Contractor briefing, supervision and performance management",
      "Material procurement and quality verification",
      "Milestone sign-off before phase payments are released",
    ],
  },
  {
    number: "04",
    icon: Smartphone,
    title: "Track Progress in Real Time",
    desc: "Log into your ProxyBuild dashboard from anywhere in the world. See dated site photos, milestone status, financial summaries and team updates. We also send you proactive notifications at each major stage — you are always in the loop.",
    details: [
      "Secure client dashboard accessible from any device",
      "Dated photo and video updates from every site visit",
      "Live milestone tracker showing what is done and what is next",
      "Payment and expenditure log updated in real time",
    ],
  },
  {
    number: "05",
    icon: KeyRound,
    title: "Receive Your Keys and Completion Report",
    desc: "When your property is complete, we carry out a final snagging inspection to ensure every element meets the agreed standard. You receive a full completion report, all relevant documents and — most importantly — your keys.",
    details: [
      "Final snagging inspection with a detailed defects log",
      "All defects resolved before handover",
      "Completion report with photo evidence",
      "Handover of keys, warranties and compliance documents",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-4">
            How It Works
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Your Project, Managed from Anywhere in the World
          </h1>
          <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed">
            ProxyBuild takes you through a proven five-step process — from your
            first conversation with us to holding the keys to your finished
            property. Every stage is clear, documented and fully visible to you.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--pb-border)] hidden sm:block" />

          <div className="space-y-10">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex gap-8 sm:gap-12">
                {/* Step indicator */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--pb-green)] flex items-center justify-center z-10 relative">
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="sm:hidden w-px flex-1 bg-[var(--pb-border)] my-2 min-h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-10 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-[var(--pb-green)]">
                      Step {step.number}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {step.title}
                  </h2>
                  <p className="text-[var(--pb-text-muted)] leading-relaxed mb-5">
                    {step.desc}
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {step.details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 text-sm text-[var(--pb-text-muted)]"
                      >
                        <ArrowRight className="h-4 w-4 text-[var(--pb-green)] shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="border-t border-[var(--pb-border)] bg-[var(--pb-surface)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Common Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Do I need to be in Nigeria at any point?",
                a: "No. Our entire process is designed to be managed remotely. From consultation to handover, you can be anywhere in the world. We are your eyes and hands on the ground.",
              },
              {
                q: "How do I know my money is being used correctly?",
                a: "Every payment is tied to a completed milestone that is photographed and documented before the next payment is released. You can see the full financial breakdown in your dashboard at all times.",
              },
              {
                q: "What if something goes wrong during the build?",
                a: "Issues are a normal part of construction. What matters is how they are handled. We identify problems early, communicate them to you immediately, and propose solutions — all at no extra management cost.",
              },
              {
                q: "How long does a typical project take?",
                a: "A standard three-bedroom residential new build typically takes 9–14 months from ground-breaking to handover. Renovation projects vary widely depending on scope. We give you a detailed timeline in your project plan.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--pb-border)] pb-6 last:border-0 last:pb-0">
                <h3 className="text-base font-semibold text-white mb-2">{q}</h3>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-[var(--pb-text-muted)] mb-8">
            Book your free consultation today. We&apos;ll walk you through the
            process for your specific project and answer every question you have.
          </p>
          <Link
            href="/book-consultation"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-[var(--pb-green)] text-white font-semibold hover:bg-[var(--pb-green-hover)] transition-colors"
          >
            Book a Free Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
