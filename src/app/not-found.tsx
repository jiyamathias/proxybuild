import Link from "next/link";
import { ProxyBuildLogo } from "@/components/ui/logo";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--pb-bg)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-10">
          <ProxyBuildLogo size={36} wordmark />
        </div>

        {/* Large 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-[var(--pb-surface-elevated)] leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-bold text-white">Page not found</p>
          </div>
        </div>

        <p className="text-[var(--pb-text-muted)] text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--pb-green)] hover:bg-[var(--pb-green-hover)] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
