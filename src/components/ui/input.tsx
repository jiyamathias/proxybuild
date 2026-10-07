import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white placeholder:text-[var(--pb-text-subtle)] transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[var(--pb-orange)] focus:ring-offset-0 focus:border-[var(--pb-orange)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
