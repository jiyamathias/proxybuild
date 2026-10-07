import Image from "next/image";

interface LogoProps {
  className?: string;
  /** Show the wordmark text beside the icon */
  wordmark?: boolean;
  /** Icon height in px (icon is square, wordmark auto-scales) */
  size?: number;
}

export function ProxyBuildLogo({ className = "", wordmark = true, size = 32 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <Image
        src="/logo-icon.png"
        alt="ProxyBuild"
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {wordmark && (
        <span className="font-bold text-[length:inherit] leading-none tracking-tight">
          <span className="text-white">Proxy</span>
          <span className="text-[var(--pb-green)]">Build</span>
        </span>
      )}
    </span>
  );
}
