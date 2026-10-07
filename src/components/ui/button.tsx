"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pb-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--pb-orange)] text-white hover:bg-[var(--pb-orange-hover)] active:scale-[0.98]",
        secondary:
          "bg-[var(--pb-surface-elevated)] text-white hover:bg-[var(--pb-surface-raised)] border border-[var(--pb-border)]",
        outline:
          "border border-[var(--pb-border)] text-white hover:border-[var(--pb-orange)] hover:text-[var(--pb-orange)] bg-transparent",
        ghost:
          "text-[var(--pb-text-muted)] hover:text-white hover:bg-[var(--pb-surface)] bg-transparent",
        destructive:
          "bg-[var(--pb-danger)] text-white hover:bg-red-600",
        link: "text-[var(--pb-orange)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-5",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
