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
      {/* PB monogram — faithful to brand: white P with roofline arrow, green B, house windows */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Navy rounded square background */}
        <rect width="40" height="40" rx="8" fill="#0B1220" />

        {/* ── P shape ──────────────────────────────────────────
            Vertical stem left side + angular bowl whose top-right
            arm extends diagonally upper-right (construction roofline).
        ─────────────────────────────────────────────────────── */}

        {/* P stem */}
        <rect x="5" y="5" width="5" height="30" rx="2" fill="white" />

        {/* P bowl filled: right and bottom sides form a standard bowl,
            but the top-right corner extends as a diagonal spike upper-right.
            Path: bottom-left of bowl → across bottom → curve up right side →
            top-right goes diagonally to apex → notch back → close. */}
        <path
          d="
            M 10 20
            L 18 20
            Q 25 20 25 13
            Q 25 7  18 7
            L 10  7
          "
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Diagonal roofline arm extending from top of P bowl to upper-right */}
        <path
          d="M 20 7 L 31 2"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Arrowhead notch at the tip */}
        <path
          d="M 26 2 L 31 2 L 31 7"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* ── 2×2 house windows at bottom of P ──────────────── */}
        <rect x="5.5" y="27" width="4"   height="4"   rx="0.8" fill="#16A34A" />
        <rect x="11"  y="27" width="4"   height="4"   rx="0.8" fill="#16A34A" />
        <rect x="5.5" y="32.5" width="4" height="3.5" rx="0.8" fill="#16A34A" />
        <rect x="11"  y="32.5" width="4" height="3.5" rx="0.8" fill="#16A34A" />

        {/* ── B shape (green) ────────────────────────────────── */}
        {/* B stem */}
        <rect x="20" y="7" width="4" height="26" rx="2" fill="#16A34A" />

        {/* B top bump */}
        <path
          d="M 24 7 Q 34 7 34 14 Q 34 20 24 20"
          stroke="#16A34A"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* B bottom bump (slightly larger) */}
        <path
          d="M 24 20 Q 35 20 35 26.5 Q 35 33 24 33"
          stroke="#16A34A"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
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
