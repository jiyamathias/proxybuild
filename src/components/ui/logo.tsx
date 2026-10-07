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
      {/* PB house monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded square bg */}
        <rect width="40" height="40" rx="9" fill="#0B1220" />

        {/* P stem */}
        <rect x="9" y="10" width="4" height="20" rx="1.5" fill="white" />

        {/* P bowl — arrow pointing up-right */}
        <path
          d="M13 10 L24 10 L24 18 L13 18"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Arrow on P (construction diagonal) */}
        <path
          d="M20 10 L28 10 L28 6"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M24 6 L28 6 L28 10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* B shape (right side, green accent) */}
        <rect x="19" y="14" width="3.5" height="16" rx="1.5" fill="#16A34A" />
        <path
          d="M22.5 14 C28 14 30 16 30 18.5 C30 21 28 22 22.5 22"
          stroke="#16A34A"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M22.5 22 C29 22 31 24.5 31 27 C31 29.5 29 30 22.5 30"
          stroke="#16A34A"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* House windows (bottom of B) */}
        <rect x="23" y="25" width="3" height="3" rx="0.5" fill="#0B1220" />
        <rect x="27" y="25" width="3" height="3" rx="0.5" fill="#0B1220" />
      </svg>

      {wordmark && (
        <span className="font-semibold text-[length:inherit] leading-none tracking-tight">
          <span className="text-white">Proxy</span>
          <span className="text-[var(--pb-green)]">Build</span>
        </span>
      )}
    </span>
  );
}
