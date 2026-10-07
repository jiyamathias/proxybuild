import Image from "next/image";

interface LogoProps {
  className?: string;
  /** true = full wordmark image; false = icon only */
  wordmark?: boolean;
  /** Height in px — controls icon size (icon only) or wordmark height */
  size?: number;
}

export function ProxyBuildLogo({ className = "", wordmark = true, size = 32 }: LogoProps) {
  if (wordmark) {
    return (
      <span className={`inline-flex items-center select-none ${className}`}>
        <Image
          src="/logo-wordmark.png"
          alt="ProxyBuild"
          width={1566}
          height={522}
          style={{ height: size, width: "auto" }}
          priority
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <Image
        src="/logo-icon.png"
        alt="ProxyBuild"
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
    </span>
  );
}
