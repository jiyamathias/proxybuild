import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ProxyBuild Africa collects, uses and protects your personal information.",
};

const lastUpdated = "October 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--pb-text-muted)]">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="prose prose-sm prose-invert max-w-none space-y-8 text-[var(--pb-text-muted)]">
        <Section title="1. Who We Are">
          <p>
            ProxyBuild Africa Ltd (&ldquo;ProxyBuild&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) operates the construction execution platform
            available at{" "}
            <span className="text-[var(--pb-green)]">proxybuild.africa</span>.
            We act as data controller for personal information collected through
            this platform.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of personal data:</p>
          <ul>
            <li>
              <strong>Account information</strong> — name, email address,
              password (hashed), and phone number provided at registration.
            </li>
            <li>
              <strong>Project data</strong> — property details, addresses,
              project milestones, uploaded photos and documents you share with
              us.
            </li>
            <li>
              <strong>Payment records</strong> — amounts, dates, and references
              for payments recorded against your project. We do not store
              full card details.
            </li>
            <li>
              <strong>Communications</strong> — messages you send through the
              platform to our team.
            </li>
            <li>
              <strong>Usage data</strong> — pages visited, features used, and
              browser/device metadata collected automatically via server logs.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We process your data to:</p>
          <ul>
            <li>Create and manage your account and project.</li>
            <li>Provide real-time construction progress updates.</li>
            <li>Facilitate communication between you and our teams.</li>
            <li>Record and report on financial transactions.</li>
            <li>Improve platform security and detect fraud.</li>
            <li>
              Send you transactional emails (project updates, milestone
              approvals). We will not send marketing emails without your
              consent.
            </li>
          </ul>
        </Section>

        <Section title="4. How We Store and Protect Your Data">
          <p>
            All data is stored on servers within the European Economic Area
            (Neon PostgreSQL, hosted on AWS). Files and media are stored
            securely on Cloudflare R2 object storage with private access
            controls.
          </p>
          <p>
            Passwords are hashed using bcrypt (12 rounds) and never stored in
            plain text. Session tokens are issued as short-lived signed JWTs
            and stored in httpOnly cookies.
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>
            We do not sell your data. We may share limited data with:
          </p>
          <ul>
            <li>
              <strong>Our construction teams and supervisors</strong> — solely
              to manage your project.
            </li>
            <li>
              <strong>Trusted infrastructure providers</strong> (Neon,
              Cloudflare, Resend) — bound by data processing agreements.
            </li>
            <li>
              <strong>Legal authorities</strong> — if required by applicable
              law.
            </li>
          </ul>
        </Section>

        <Section title="6. Your Rights">
          <p>
            Under applicable data protection law you have the right to:
          </p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (subject to legal retention obligations).</li>
            <li>Object to or restrict certain processing.</li>
            <li>Receive a portable copy of your data.</li>
          </ul>
          <p>
            To exercise any right, contact us at{" "}
            <a
              href="mailto:privacy@proxybuild.africa"
              className="text-[var(--pb-green)] hover:underline"
            >
              privacy@proxybuild.africa
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section title="7. Retention">
          <p>
            We retain account and project data for the duration of your
            relationship with ProxyBuild and for up to 7 years afterwards in
            accordance with standard financial and contractual record-keeping
            requirements.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use a single session cookie (<code>pb_session</code>) that is
            strictly necessary for authentication. We do not use advertising or
            analytics cookies.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this policy periodically. We will notify registered
            users of material changes by email. Continued use of the platform
            after changes takes effect constitutes acceptance.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about this policy should be directed to:{" "}
            <a
              href="mailto:privacy@proxybuild.africa"
              className="text-[var(--pb-green)] hover:underline"
            >
              privacy@proxybuild.africa
            </a>
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-[var(--pb-border)]">
        <Link
          href="/"
          className="text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
