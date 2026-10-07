import Link from "next/link";
import { CopyrightYear } from "@/components/shared/copyright-year";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-[var(--pb-border)] px-4 py-4">
        <Link href="/" className="inline-block">
          <span className="text-[var(--pb-green)] font-bold text-xl tracking-tight">
            Proxy<span className="text-white">Build</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="border-t border-[var(--pb-border)] px-4 py-4 text-center">
        <p className="text-xs text-[var(--pb-text-subtle)]">
          © <CopyrightYear /> ProxyBuild Africa. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
