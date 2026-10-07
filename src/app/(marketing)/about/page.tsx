import type { Metadata } from "next";
import Link from "next/link";
import { Target, Eye, Users, ShieldCheck, TrendingUp, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About ProxyBuild Africa — Our Story, Mission and Team",
  description:
    "ProxyBuild Africa was founded to solve the construction crisis facing Africans in the diaspora. Learn who we are, our mission, and why our team-led approach delivers where others fail. Based in Lagos, operating across Nigeria.",
  keywords: [
    "about ProxyBuild Africa",
    "construction company Nigeria about",
    "diaspora construction firm Nigeria",
    "Nigerian construction management team",
    "ProxyBuild Lagos",
  ],
  alternates: { canonical: "https://proxybuild.africa/about" },
  openGraph: {
    title: "About ProxyBuild Africa — Our Story, Mission and Team",
    description:
      "Founded in 2022, ProxyBuild Africa exists because too many diaspora Africans have lost money trying to build back home. Our team changes that.",
    url: "https://proxybuild.africa/about",
  },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Transparency First",
    desc: "Every naira, every milestone, every site photo — you see it all in real time. No surprises, no excuses.",
  },
  {
    icon: Heart,
    title: "Client-Centred",
    desc: "We are your proxy on the ground. Your interests drive every decision we make from day one to handover.",
  },
  {
    icon: Users,
    title: "Our People, Your Build",
    desc: "Every project manager, site supervisor and tradesperson on your build is part of the ProxyBuild team — trained, accountable and performance-tracked across every project we run.",
  },
  {
    icon: TrendingUp,
    title: "Delivery Focus",
    desc: "We manage to milestones, not hours. Projects are structured to finish on time and within agreed budgets.",
  },
];

const team = [
  {
    name: "Founder & CEO",
    initials: "FB",
    bio: "A seasoned construction professional with 15+ years building across Lagos, Abuja and Accra. Founded ProxyBuild after experiencing first-hand how difficult it is for diaspora clients to trust the process back home.",
  },
  {
    name: "Head of Operations",
    initials: "AO",
    bio: "Former project manager at one of Lagos's largest civil engineering firms. Oversees all active projects, site operations and quality standards across ProxyBuild's entire portfolio.",
  },
  {
    name: "Head of Client Success",
    initials: "CC",
    bio: "Dedicated to ensuring every diaspora client feels informed and confident throughout their project. Manages onboarding, progress reporting and client communications.",
  },
  {
    name: "Head of Finance",
    initials: "NK",
    bio: "Chartered Accountant with deep experience in construction finance. Responsible for budget management, payment tracking and financial reporting for all projects.",
  },
];

const stats = [
  { value: "₦2B+", label: "Construction value managed" },
  { value: "120+", label: "Projects completed" },
  { value: "98%", label: "Client satisfaction rate" },
  { value: "8", label: "Cities across Nigeria" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-4">
            About Us
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Building Dreams Across Borders
          </h1>
          <p className="text-lg text-[var(--pb-text-muted)] leading-relaxed">
            ProxyBuild Africa exists because too many hardworking Africans in the
            diaspora have lost money, time and peace of mind trying to build back
            home. We are the trusted proxy on the ground — managing your project
            from foundation to handover so you never have to worry.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-b border-[var(--pb-border)] bg-[var(--pb-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-[var(--pb-green)]">
                  {s.value}
                </p>
                <p className="text-sm text-[var(--pb-text-muted)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--pb-green-muted)] mb-6">
              <Target className="h-6 w-6 text-[var(--pb-green)]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-[var(--pb-text-muted)] leading-relaxed">
              <p>
                ProxyBuild was born from a simple but painful truth: Africans
                abroad are sending billions home to build houses, and a
                significant portion of that money is lost to delays, poor
                workmanship and outright fraud.
              </p>
              <p>
                Our founder, having helped several diaspora relatives navigate
                disastrous construction experiences — unfished buildings, missing
                contractors, funds mysteriously exhausted — decided there had to
                be a better way.
              </p>
              <p>
                In 2022, ProxyBuild Africa was incorporated in Lagos with a clear
                mandate: provide the African diaspora with a fully managed,
                digitally transparent construction execution service. Not just
                building it for you — being your eyes, your voice and the team
                that actually executes every phase on the ground.
              </p>
              <p>
                Today we manage projects across Lagos, Abuja, Port Harcourt,
                Ibadan and beyond. Every project is tracked digitally, every
                payment is documented, and every milestone is photographed before
                the next phase begins.
              </p>
            </div>
          </div>

          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--pb-green-muted)] mb-6">
              <Eye className="h-6 w-6 text-[var(--pb-green)]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <div className="space-y-4 text-[var(--pb-text-muted)] leading-relaxed">
              <p className="text-xl text-white font-semibold leading-snug">
                &ldquo;To be Africa&rsquo;s most trusted remote construction
                management platform — empowering the diaspora to build back home
                with complete confidence.&rdquo;
              </p>
              <p>
                We believe that where you live should not determine your ability
                to build where you are from. ProxyBuild exists to close that gap
                — permanently.
              </p>
              <p>
                Our vision is a world where every African abroad can start a
                construction project from their phone, track it daily, and
                receive the keys to a finished property without ever fearing the
                process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--pb-surface)] border-t border-[var(--pb-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">What We Stand For</h2>
            <p className="mt-3 text-[var(--pb-text-muted)] max-w-xl mx-auto">
              Four principles that drive every decision we make at ProxyBuild.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-bg)]"
              >
                <div className="h-10 w-10 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[var(--pb-green)]" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">Our Leadership Team</h2>
          <p className="mt-3 text-[var(--pb-text-muted)] max-w-xl mx-auto">
            Experienced professionals who have spent their careers in Nigerian
            construction — now using that expertise to serve you.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="p-6 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)]"
            >
              <div className="h-14 w-14 rounded-full bg-[var(--pb-green-muted)] flex items-center justify-center text-lg font-bold text-[var(--pb-green)] mb-4">
                {member.initials}
              </div>
              <h3 className="text-base font-semibold text-white mb-3">
                {member.name}
              </h3>
              <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--pb-border)] bg-[var(--pb-surface)] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build with Confidence?
          </h2>
          <p className="text-[var(--pb-text-muted)] mb-8">
            Book a free consultation and speak directly with our team about your
            project. No commitment required.
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
