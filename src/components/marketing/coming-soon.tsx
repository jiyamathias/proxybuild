import Link from "next/link";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-lg">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--pb-green-muted)] mb-6">
          <Construction className="h-8 w-8 text-[var(--pb-green)]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-[var(--pb-text-muted)] leading-relaxed mb-8">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-[var(--pb-border)] text-sm text-[var(--pb-text-muted)] hover:text-white hover:border-[var(--pb-text-subtle)] transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/book-consultation"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[var(--pb-green)] text-white text-sm font-medium hover:bg-[var(--pb-green-hover)] transition-colors"
          >
            Book a consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
