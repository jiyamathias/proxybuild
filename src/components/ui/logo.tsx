interface LogoProps {
  className?: string;
  /** Show the wordmark beside the icon */
  wordmark?: boolean;
  /** Icon size in px */
  size?: number;
}

export function ProxyBuildLogo({ className = "", wordmark = true, size = 32 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Navy rounded background */}
        <rect width="40" height="40" rx="8" fill="#0B1220" />

        {/* ── B drawn first (behind P) ─────────────────────────
            Green stem + two filled D-bumps with navy counters.
        ──────────────────────────────────────────────────────── */}

        {/* B stem */}
        <rect x="21" y="8" width="5" height="26" rx="2" fill="#16A34A" />

        {/* B top bump — filled D-shape */}
        <path d="M 26 8 Q 38 8 38 15 Q 38 22 26 22 L 26 8 Z" fill="#16A34A" />
        {/* B top counter — navy cuts the hole inside */}
        <path d="M 26 11 Q 33.5 11 33.5 15 Q 33.5 19 26 19 L 26 11 Z" fill="#0B1220" />

        {/* B bottom bump — slightly larger */}
        <path d="M 26 22 Q 39 22 39 28.5 Q 39 35 26 35 L 26 22 Z" fill="#16A34A" />
        {/* B bottom counter */}
        <path d="M 26 25 Q 34 25 34 28.5 Q 34 32 26 32 L 26 25 Z" fill="#0B1220" />

        {/* ── P drawn second (in front of B) ───────────────────
            White stem + filled D-bowl with navy counter.
            Diagonal roofline arm extends upper-right from bowl top.
        ──────────────────────────────────────────────────────── */}

        {/* P stem */}
        <rect x="3" y="5" width="7" height="30" rx="2" fill="white" />

        {/* P bowl — filled white D-shape */}
        <path d="M 10 5 L 20 5 Q 29 5 29 13 Q 29 21 20 21 L 10 21 Z" fill="white" />

        {/* P counter — navy cutout revealing the bowl hole */}
        <path d="M 11 7.5 L 19 7.5 Q 22 7.5 22 13 Q 22 18.5 19 18.5 L 11 18.5 Z" fill="#0B1220" />

        {/* 2×2 house windows — navy cutouts in the white stem */}
        <rect x="4"   y="25"   width="2.5" height="2.5" rx="0.5" fill="#0B1220" />
        <rect x="7.5" y="25"   width="2.5" height="2.5" rx="0.5" fill="#0B1220" />
        <rect x="4"   y="28.5" width="2.5" height="2.5" rx="0.5" fill="#0B1220" />
        <rect x="7.5" y="28.5" width="2.5" height="2.5" rx="0.5" fill="#0B1220" />

        {/* ── Roofline arm (on top of everything) ──────────────
            Diagonal line from top-right of P bowl shooting upper-right.
        ──────────────────────────────────────────────────────── */}
        <path d="M 21 5 L 36 0" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        {/* Arrowhead notch at tip */}
        <path d="M 31 0 L 36 0 L 36 5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>

      {wordmark && (
        <span className="font-bold text-[length:inherit] leading-none tracking-tight">
          <span className="text-white">Proxy</span>
          <span className="text-[var(--pb-green)]">Build</span>
        </span>
      )}
    </span>
  );
}
