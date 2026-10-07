import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Calendar, CheckCircle2, Clock, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse ProxyBuild Africa's portfolio of residential and commercial construction projects across Lagos, Abuja, Port Harcourt and beyond.",
};

type ProjectStatus = "Completed" | "In Progress" | "Handover";

const projects: {
  title: string;
  type: string;
  location: string;
  city: string;
  client: string;
  duration: string;
  year: string;
  status: ProjectStatus;
  highlight: string;
  initials: string;
}[] = [
  {
    title: "Lekki Phase 1 Residence",
    type: "4-Bedroom Detached",
    location: "Lekki Phase 1",
    city: "Lagos",
    client: "Diaspora Client — UK",
    duration: "14 months",
    year: "2024",
    status: "Completed",
    highlight:
      "Ground-up construction of a 4-bedroom detached house with BQ, swimming pool and 2-room staff quarters. Delivered on schedule.",
    initials: "LP",
  },
  {
    title: "Jabi District Build",
    type: "5-Bedroom Semi-Detached",
    location: "Jabi",
    city: "Abuja",
    client: "Diaspora Client — USA",
    duration: "16 months",
    year: "2024",
    status: "Completed",
    highlight:
      "Full new build managed across two phases. Client monitored progress weekly from Houston via the ProxyBuild dashboard.",
    initials: "JD",
  },
  {
    title: "GRA Port Harcourt Renovation",
    type: "Full Renovation — 3-Bed",
    location: "GRA Phase 2",
    city: "Port Harcourt",
    client: "Diaspora Client — Canada",
    duration: "7 months",
    year: "2023",
    status: "Completed",
    highlight:
      "Complete gut renovation of an existing property — full structural repairs, new plumbing, rewire, and interior finishing.",
    initials: "GR",
  },
  {
    title: "Bodija Estate New Build",
    type: "3-Bedroom Bungalow",
    location: "Bodija Estate",
    city: "Ibadan",
    client: "Diaspora Client — Ireland",
    duration: "10 months",
    year: "2023",
    status: "Completed",
    highlight:
      "Compact but beautifully finished 3-bed bungalow. Client visited for the first time at handover — fully completed to specification.",
    initials: "BE",
  },
  {
    title: "Ikeja GRA Townhouse",
    type: "Townhouse — 4 Floors",
    location: "Ikeja GRA",
    city: "Lagos",
    client: "Diaspora Client — Netherlands",
    duration: "20 months",
    year: "2025",
    status: "In Progress",
    highlight:
      "Multi-storey townhouse development currently at roofing stage. Client receives photo updates twice weekly from the site supervisor.",
    initials: "IG",
  },
  {
    title: "Maitama Finishing Works",
    type: "Interior Finishing — 6-Bed",
    location: "Maitama",
    city: "Abuja",
    client: "Diaspora Client — UK",
    duration: "5 months",
    year: "2025",
    status: "In Progress",
    highlight:
      "Complete interior finishing of a shell property. Tiling, painting, kitchen and bathroom installation all underway.",
    initials: "MF",
  },
  {
    title: "Chevron Drive Detached",
    type: "5-Bedroom Detached",
    location: "Chevron Drive",
    city: "Lagos",
    client: "Diaspora Client — Australia",
    duration: "18 months",
    year: "2025",
    status: "Handover",
    highlight:
      "Prestige 5-bedroom home with home office, cinema room and generator house. Final snagging complete — awaiting client arrival for key handover.",
    initials: "CD",
  },
  {
    title: "Asokoro Commercial Block",
    type: "Office Development",
    location: "Asokoro",
    city: "Abuja",
    client: "Diaspora Client — USA",
    duration: "22 months",
    year: "2024",
    status: "Completed",
    highlight:
      "Three-storey commercial office block with ground-floor retail. ProxyBuild managed design coordination, contractors and fit-out.",
    initials: "AC",
  },
  {
    title: "Omole Phase 2 New Build",
    type: "3-Bedroom + BQ",
    location: "Omole Phase 2",
    city: "Lagos",
    client: "Diaspora Client — Germany",
    duration: "11 months",
    year: "2023",
    status: "Completed",
    highlight:
      "Straightforward but well-executed 3-bedroom build with BQ. Completed two weeks ahead of schedule.",
    initials: "OP",
  },
];

const statusConfig: Record<
  ProjectStatus,
  { icon: typeof CheckCircle2; color: string; bg: string }
> = {
  Completed: {
    icon: CheckCircle2,
    color: "text-[var(--pb-green)]",
    bg: "bg-[var(--pb-green-muted)]",
  },
  "In Progress": {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  Handover: {
    icon: Building2,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
};

export default function ProjectsPage() {
  const completed = projects.filter((p) => p.status === "Completed").length;
  const inProgress = projects.filter(
    (p) => p.status === "In Progress" || p.status === "Handover"
  ).length;

  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-4">
            Our Projects
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Real Builds. Real Results. Real Clients.
          </h1>
          <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed">
            Every project here was managed end-to-end by ProxyBuild for a
            diaspora client who could not be present on site. From Lagos to
            Abuja to Port Harcourt — these are the homes and properties we have
            delivered.
          </p>
        </div>

        {/* Summary strip */}
        <div className="flex flex-wrap gap-6 mt-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-[var(--pb-green)]" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{completed}</p>
              <p className="text-sm text-[var(--pb-text-muted)]">Completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{inProgress}</p>
              <p className="text-sm text-[var(--pb-text-muted)]">Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const cfg = statusConfig[project.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={project.title}
                className="flex flex-col p-6 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] hover:border-[var(--pb-green)]/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="h-11 w-11 rounded-xl bg-[var(--pb-green-muted)] flex items-center justify-center text-sm font-bold text-[var(--pb-green)] shrink-0">
                    {project.initials}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${cfg.bg} ${cfg.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {project.status}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white mb-1">
                  {project.title}
                </h2>
                <p className="text-xs font-medium text-[var(--pb-green)] mb-3">
                  {project.type}
                </p>

                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed mb-4 flex-1">
                  {project.highlight}
                </p>

                <div className="border-t border-[var(--pb-border)] pt-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--pb-text-subtle)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {project.location}, {project.city}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--pb-text-subtle)]">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {project.duration} · {project.year}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--pb-border)] bg-[var(--pb-surface)] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Project Could Be Next
          </h2>
          <p className="text-[var(--pb-text-muted)] mb-8">
            Whether you are building from scratch, renovating an existing
            property, or completing an unfinished build — ProxyBuild has the
            experience to deliver it.
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
