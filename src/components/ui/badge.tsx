import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--pb-green-muted)] text-[var(--pb-green)]",
        secondary:
          "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border border-[var(--pb-border)]",
        success: "bg-green-500/10 text-green-400",
        warning: "bg-amber-500/10 text-amber-400",
        danger: "bg-red-500/10 text-red-400",
        info: "bg-blue-500/10 text-blue-400",
        outline:
          "border border-[var(--pb-border)] text-[var(--pb-text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
