import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Calendar } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the ProxyBuild Africa team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-[var(--pb-green)] uppercase mb-3">
          Get in Touch
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Contact ProxyBuild
        </h1>
        <p className="mt-3 text-sm text-[var(--pb-text-muted)] max-w-md">
          Ready to start your project, or have questions about how we work?
          Reach out through any of the channels below.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <a
          href={`mailto:${siteConfig.emails.support}`}
          className="flex items-center gap-4 p-5 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] hover:border-[var(--pb-green)] transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-[var(--pb-green)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Email Us</p>
            <p className="text-sm text-[var(--pb-text-muted)] group-hover:text-[var(--pb-green)] transition-colors">
              {siteConfig.emails.support}
            </p>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] hover:border-[var(--pb-green)] transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-[var(--pb-green-muted)] flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5 text-[var(--pb-green)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">WhatsApp</p>
            <p className="text-sm text-[var(--pb-text-muted)] group-hover:text-[var(--pb-green)] transition-colors">
              Chat with us directly on WhatsApp
            </p>
          </div>
        </a>

        {/* Book consultation */}
        <Link
          href="/book-consultation"
          className="flex items-center gap-4 p-5 rounded-xl border border-[var(--pb-green)]/40 bg-[var(--pb-green-muted)] hover:bg-[var(--pb-green-muted)]/80 transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-[var(--pb-green)] flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Book a Free Consultation
            </p>
            <p className="text-sm text-[var(--pb-text-muted)]">
              Tell us about your project and we&apos;ll get back to you within
              24 hours.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
