import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Wrench,
  Paintbrush,
  Shovel,
  ClipboardCheck,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "ProxyBuild Africa manages new builds, renovations, finishing works, site preparation and commercial projects for the African diaspora.",
};

const services = [
  {
    icon: Building2,
    title: "New Build",
    tag: "Residential",
    desc: "Full ground-up construction of residential properties — from land survey and design review through to final handover. We manage every trade, every supplier and every stage on your behalf.",
    features: [
      "Architectural and structural plan review",
      "Contractor procurement and vetting",
      "Stage-by-stage milestone management",
      "Daily photo and video updates",
      "Cost tracking and budget reporting",
      "Quality inspection at every milestone",
      "Final snagging and handover report",
    ],
  },
  {
    icon: Wrench,
    title: "Renovation",
    tag: "Refurbishment",
    desc: "Complete renovation and remodelling of existing residential properties. Whether you need a full gut renovation or targeted room upgrades, we manage the entire process to your specification.",
    features: [
      "Pre-renovation condition assessment",
      "Scope of works definition",
      "Contractor selection and onboarding",
      "Works scheduling and trade coordination",
      "Progress monitoring and sign-off",
      "Material sourcing and quality checks",
      "Post-renovation inspection",
    ],
  },
  {
    icon: Paintbrush,
    title: "Finishing Works",
    tag: "Interior",
    desc: "Interior and exterior finishing to take your property from bare structure to ready-to-occupy. Flooring, tiling, plastering, painting, fixtures and fittings — all coordinated and managed.",
    features: [
      "Floor and wall tiling",
      "Plastering and screeding",
      "Internal and external painting",
      "Kitchen and bathroom installation",
      "Electrical and plumbing finishing",
      "Doors, windows and ironmongery",
      "Final clean and readiness inspection",
    ],
  },
  {
    icon: Shovel,
    title: "Site Preparation",
    tag: "Groundworks",
    desc: "All works needed to prepare a plot for construction — land clearing, topographical survey coordination, drainage, foundation excavation and block work. The critical phase done right.",
    features: [
      "Land clearing and vegetation removal",
      "Survey and peg-out coordination",
      "Subsoil investigation and reporting",
      "Excavation and earthworks",
      "Foundation construction",
      "Drainage and soakaway",
      "DPC and ground-floor oversite",
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Property Maintenance",
    tag: "Ongoing",
    desc: "Keep your completed property in excellent condition even when you are abroad. We carry out scheduled inspections, maintenance visits and handle any emergency repairs through our verified tradespeople.",
    features: [
      "Periodic inspection visits (monthly or quarterly)",
      "Roof and drainage checks",
      "Electrical and plumbing inspection",
      "Painting and minor cosmetic upkeep",
      "Security and access management",
      "Emergency repair response",
      "Full condition reports with photos",
    ],
  },
  {
    icon: BarChart3,
    title: "Commercial Projects",
    tag: "Commercial",
    desc: "Office blocks, retail units, warehouses and mixed-use developments. We bring the same rigorous project management discipline to commercial construction as we do to every residential project.",
    features: [
      "Commercial design and planning support",
      "Specialist contractor procurement",
      "Multi-trade programme management",
      "Regulatory compliance and approvals",
      "Cost management and value engineering",
      "Stakeholder reporting",
      "Commissioning and handover",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-4">
            Services
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Everything Your Build Needs — Managed End to End
          </h1>
          <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed">
            From breaking ground to handing over the keys, ProxyBuild manages
            every phase of your construction project. Choose the service that
            matches your needs — or combine them for a fully integrated
            project management experience.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, tag, desc, features }) => (
            <div
              key={title}
              className="flex flex-col p-6 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] hover:border-[var(--pb-green)]/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 rounded-xl bg-[var(--pb-green-muted)] flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-[var(--pb-green)]" />
                </div>
                <span className="text-xs font-semibold text-[var(--pb-green)] bg-[var(--pb-green-muted)] px-2 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
              <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-5">
                {desc}
              </p>
              <ul className="mt-auto space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--pb-text-muted)]">
                    <CheckCircle2 className="h-4 w-4 text-[var(--pb-green)] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--pb-border)] bg-[var(--pb-surface)] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-[var(--pb-text-muted)] mb-8">
            Book a free consultation. We&apos;ll listen to your project goals
            and recommend the right level of engagement for your situation.
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
