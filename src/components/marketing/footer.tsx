import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CopyrightYear } from "@/components/shared/copyright-year";
import { ProxyBuildLogo } from "@/components/ui/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--pb-border)] bg-[var(--pb-bg-near-black)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4" style={{ fontSize: "16px" }}>
              <ProxyBuildLogo size={32} wordmark />
            </Link>
            <p className="text-sm text-[var(--pb-text-muted)] leading-relaxed">
              We Build Your Vision — Even While You&apos;re Away.
            </p>
            <p className="text-xs text-[var(--pb-text-subtle)] mt-4">
              ProxyBuild Africa Ltd
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Services", href: "/services" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Why ProxyBuild", href: "/why-proxybuild" },
                { label: "Projects", href: "/projects" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2.5">
              {[
                "New Build",
                "Renovation",
                "Finishing",
                "Site Preparation",
                "Property Maintenance",
                "Commercial Projects",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[var(--pb-text-muted)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${siteConfig.emails.support}`}
                  className="text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
                >
                  {siteConfig.emails.support}
                </a>
              </li>
              <li>
                <Link
                  href="/book-consultation"
                  className="text-sm text-[var(--pb-green)] hover:text-[var(--pb-green-hover)] transition-colors font-medium"
                >
                  Book a Free Consultation
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--pb-text-muted)] hover:text-white transition-colors"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--pb-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--pb-text-subtle)]">
            © <CopyrightYear /> ProxyBuild Africa. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-[var(--pb-text-subtle)] hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[var(--pb-text-subtle)] hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
