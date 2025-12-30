import type React from "react"
import { Navbar } from "@/components/navbar"
import { DashboardMock } from "@/components/dashboard-mock"
import { Button } from "@/components/ui/button"
import {
  ShieldCheck,
  MapPin,
  ArrowRight,
  Lock,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  Users,
  Camera,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 px-4 text-center">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />
          <div className="absolute top-0 h-[1000px] w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="container relative z-10 mx-auto max-w-4xl">
            <Badge className="mb-6 border-primary/20 bg-primary/10 px-4 py-1 text-primary hover:bg-primary/20">
              Trusted by 500+ Africans in the Diaspora
            </Badge>
            <h1 className="mb-8 text-5xl font-black tracking-tighter md:text-8xl">
              We Build Your Vision <br />
              <span className="text-primary italic">— Even While You're Away.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Eliminate the risk of sending money home. ProxyBuild handles planning, procurement, and execution with
              vetted engineers and milestone-based escrow.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-primary px-8 text-lg font-bold text-black hover:bg-primary/90"
                >
                  Book Consultation
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-zinc-700 px-8 text-lg font-bold bg-transparent"
              >
                WhatsApp Us
              </Button>
            </div>

            <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border/50 pt-16 md:grid-cols-4">
              {[
                { label: "Construction Saved", value: "30+ Months" },
                { label: "Scam Risk Reduced", value: "100%" },
                { label: "Milestones Paid", value: "2,400+" },
                { label: "Projects Delivered", value: "150+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-black text-white md:text-3xl">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="bg-zinc-950 py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                  Why Diaspora Africans <br />
                  <span className="text-primary">Struggle to Build.</span>
                </h2>
                <p className="mb-10 text-lg text-muted-foreground">
                  Sending money to relatives or middle-men shouldn't be a gamble. ProxyBuild was founded to stop the
                  "stories" and start the building.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: AlertTriangle, text: "Money mismanaged or stolen by family" },
                    { icon: MapPin, text: "Returning to see an empty plot after years" },
                    { icon: History, text: "No transparency on actual costs or progress" },
                    { icon: Users, text: "Stress of managing builders from abroad" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <item.icon className="size-5" />
                      </div>
                      <span className="text-lg font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                  <div className="flex h-full items-center justify-center p-8 text-center italic text-zinc-500">
                    "I sent $40k for a bungalow. 3 years later, only the foundation was done. No one would take
                    responsibility."
                    <br />
                    <span className="mt-4 block font-bold text-zinc-400 not-italic">— Tunde A., London</span>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Platform Showcase (MUST INCLUDE) */}
        <section id="dashboard" className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-6xl tracking-tight">
                Track Your Building <br />
                From <span className="text-primary">Anywhere.</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Our platform-first approach ensures 100% clarity. View your project's health, approve milestones, and
                chat with supervisors inside your private dashboard.
              </p>
            </div>

            <DashboardMock />

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Weekly Photo/Video",
                  desc: "Never wonder what's happening. Get high-definition progress updates every Friday.",
                  icon: Camera,
                },
                {
                  title: "Milestone Escrow",
                  desc: "Payments are only released to contractors after you verify and approve the work.",
                  icon: Lock,
                },
                {
                  title: "Document Vault",
                  desc: "All your building permits, surveys, and architectural drawings in one secure place.",
                  icon: FileText,
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-border bg-zinc-900/50 p-8 transition-colors hover:border-primary/50"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-6xl tracking-tight">
                7 Steps to Your <br />
                <span className="text-primary italic">Dream Home.</span>
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", title: "Request", desc: "Contact us with your building request via WhatsApp or Form." },
                {
                  step: "02",
                  title: "Planning",
                  desc: "We prepare architectural drawings, cost breakdowns & timelines.",
                },
                {
                  step: "03",
                  title: "Escrow",
                  desc: "Deposit funds into milestone-based escrow (secure and trackable).",
                },
                { step: "04", title: "Execution", desc: "ProxyBuild assigns vetted contractor teams and begins work." },
                { step: "05", title: "Updates", desc: "Receive weekly photo & video updates + monthly reports." },
                { step: "06", title: "Approval", desc: "Funds released only after you approve each milestone." },
                { step: "07", title: "Delivery", desc: "ProxyBuild delivers the building and hands over keys." },
              ].map((item, i) => (
                <div key={i} className="relative p-6 border border-white/5 rounded-2xl bg-zinc-900/30">
                  <span className="absolute -top-4 -left-4 size-10 flex items-center justify-center rounded-full bg-primary text-black font-bold text-xs">
                    {item.step}
                  </span>
                  <h3 className="mt-4 mb-2 text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-zinc-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-zinc-950 py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 md:grid-cols-2">
              <div className="space-y-8">
                <h2 className="text-4xl font-bold md:text-6xl tracking-tight">
                  Professional Construction <br />
                  <span className="text-primary italic">Services.</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  From residential masterpieces to commercial hubs, we handle every type of construction with precision
                  and transparency.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Residential Buildings",
                    "Commercial Plazas",
                    "Renovations & Finishing",
                    "Land Surveying",
                    "Foundation & Fencing",
                    "Maintenance Packages",
                  ].map((service) => (
                    <div key={service} className="flex items-center gap-2 text-zinc-300">
                      <CheckCircle2 className="size-5 text-primary" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
                    <img src="/luxury-villa-construction.jpg" alt="Villa" className="h-full w-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900">
                    <img src="/commercial-plaza-rendering.jpg" alt="Plaza" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900">
                    <img src="/interior-finishing-work.jpg" alt="Interior" className="h-full w-full object-cover" />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
                    <img
                      src="/building-foundation-inspection.jpg"
                      alt="Foundation"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust System */}
        <section className="bg-zinc-950 py-24">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl border border-primary/20 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.1),transparent_50%)] p-8 md:p-16">
              <div className="mb-12 text-center md:text-left">
                <h2 className="text-3xl font-bold md:text-5xl tracking-tight">
                  The ProxyBuild Security <br />
                  <span className="text-primary">Architecture.</span>
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Escrow-Protected",
                    desc: "No upfront blind payments. Funds stay in escrow until milestones pass.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Vetted Contractors",
                    desc: "3-layer background and skill check on every team member.",
                    icon: Users,
                  },
                  {
                    title: "Digital Contracts",
                    desc: "Every project is legally backed with signed digital agreements.",
                    icon: FileText,
                  },
                  {
                    title: "Live Supervision",
                    desc: "Independent ProxyBuild engineers supervise every nail and brick.",
                    icon: CheckCircle2,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <item.icon className="size-8 text-primary" />
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-24 text-center md:py-32">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.2),transparent_70%)]" />
          <div className="container relative z-10 mx-auto px-4">
            <h2 className="mb-6 text-4xl font-black md:text-7xl tracking-tighter uppercase italic">
              Your dream home should <br />
              not wait for retirement.
            </h2>
            <p className="mb-12 text-xl text-muted-foreground">
              Start your project today with the trust of a professional proxy on the ground.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-16 rounded-full bg-primary px-10 text-xl font-bold text-black hover:bg-primary/90"
                >
                  Book Consultation
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="h-16 px-10 text-xl font-bold hover:text-primary">
                Chat on WhatsApp <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-primary font-bold text-black text-xs">
                P
              </div>
              <span className="text-lg font-bold">ProxyBuild Africa</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500">
              <Link href="#" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/login" className="hover:text-primary">
                Client Login
              </Link>
            </div>
            <p className="text-sm text-zinc-600">© 2025 ProxyBuild Africa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
