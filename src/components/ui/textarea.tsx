import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface-elevated)] px-3 py-2 text-sm text-white placeholder:text-[var(--pb-text-subtle)] transition-colors resize-none",
        "focus:outline-none focus:ring-2 focus:ring-[var(--pb-orange)] focus:ring-offset-0 focus:border-[var(--pb-orange)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
