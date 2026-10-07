import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing use of the ProxyBuild platform.",
};

const lastUpdated = "October 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-[var(--pb-text-muted)]">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="space-y-8 text-[var(--pb-text-muted)]">
        <Section title="1. Agreement to Terms">
          <p>
            By accessing or using the ProxyBuild platform (&ldquo;Service&rdquo;)
            operated by ProxyBuild Africa Ltd (&ldquo;ProxyBuild&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by
            these Terms of Service. If you do not agree, do not use the
            Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            ProxyBuild provides a construction execution and project management
            platform. We manage construction projects on behalf of clients,
            providing milestone tracking, media uploads, document management,
            messaging, and financial reporting.
          </p>
          <p>
            ProxyBuild is not a marketplace. We act as the primary contractor
            responsible for managing your project end to end through our
            vetted team of professionals.
          </p>
        </Section>

        <Section title="3. Accounts">
          <ul>
            <li>
              You must provide accurate information when creating an account.
            </li>
            <li>
              You are responsible for maintaining the security of your
              credentials. Notify us immediately at{" "}
              <a
                href="mailto:support@proxybuild.africa"
                className="text-[var(--pb-green)] hover:underline"
              >
                support@proxybuild.africa
              </a>{" "}
              if you suspect unauthorised access.
            </li>
            <li>
              Accounts are non-transferable. Each account represents a single
              individual or business entity.
            </li>
          </ul>
        </Section>

        <Section title="4. Project Engagement">
          <p>
            A project engagement begins when a signed Letter of Engagement or
            project agreement is executed between you and ProxyBuild Africa
            Ltd. These Terms operate alongside that agreement and do not
            replace it.
          </p>
          <p>
            Platform access is provided to support your active project. Access
            may be continued after project completion at our discretion for
            records purposes.
          </p>
        </Section>

        <Section title="5. Payments">
          <ul>
            <li>
              Payment schedules are defined in your project agreement and
              typically align with milestone completion.
            </li>
            <li>
              All payments are non-refundable once a milestone has been
              completed and approved, except where ProxyBuild is in material
              breach.
            </li>
            <li>
              ProxyBuild is not responsible for third-party bank charges,
              currency conversion costs, or delays caused by payment
              processors.
            </li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            The ProxyBuild platform, including its design, code, and content,
            is owned by ProxyBuild Africa Ltd and protected by copyright.
          </p>
          <p>
            Photos, documents, and other materials you upload to the platform
            remain your property. By uploading, you grant ProxyBuild a
            limited licence to store, display, and share those materials with
            you and your project team as part of service delivery.
          </p>
        </Section>

        <Section title="7. Prohibited Use">
          <p>You must not:</p>
          <ul>
            <li>Use the platform for any unlawful purpose.</li>
            <li>
              Attempt to access accounts, data, or systems you are not
              authorised to access.
            </li>
            <li>Upload malicious code or files.</li>
            <li>
              Reproduce or distribute platform content without our written
              permission.
            </li>
          </ul>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, ProxyBuild&rsquo;s total
            liability to you for any claim arising from your use of the
            platform shall not exceed the amounts paid by you to ProxyBuild in
            the three months preceding the claim.
          </p>
          <p>
            ProxyBuild is not liable for indirect, incidental, or consequential
            loss, including loss of data, loss of income, or damage to
            property not caused directly by our negligence.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            We may suspend or terminate your access to the platform if you
            breach these Terms or your project agreement. You may request
            account deletion by contacting us; we will delete your data in
            accordance with our{" "}
            <Link
              href="/privacy"
              className="text-[var(--pb-green)] hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by the laws of the Federal Republic of
            Nigeria. Any disputes shall be subject to the exclusive
            jurisdiction of the courts of Lagos State, Nigeria.
          </p>
        </Section>

        <Section title="11. Changes to Terms">
          <p>
            We may update these Terms from time to time. We will notify you by
            email of material changes. Continued use of the Service after
            changes take effect constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these Terms:{" "}
            <a
              href="mailto:legal@proxybuild.africa"
              className="text-[var(--pb-green)] hover:underline"
            >
              legal@proxybuild.africa
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
