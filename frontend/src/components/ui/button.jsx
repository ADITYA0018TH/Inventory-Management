import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border text-sm font-medium transition-all backdrop-blur-[10px] focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--glass-elevated)] text-[var(--text-primary)] border-[color:var(--glass-border)] shadow-[var(--glass-shadow-soft)] hover:bg-[color:color-mix(in_srgb,var(--glass-elevated)_82%,white_18%)] hover:shadow-[var(--glass-shadow-hover)]",
        destructive:
          "bg-[color:color-mix(in_srgb,var(--danger)_20%,var(--glass-elevated))] text-[var(--text-primary)] border-[color:color-mix(in_srgb,var(--danger)_48%,var(--glass-border))] shadow-[var(--glass-shadow-soft)] hover:bg-[color:color-mix(in_srgb,var(--danger)_28%,var(--glass-elevated))]",
        outline:
          "bg-[color:color-mix(in_srgb,var(--glass-elevated)_80%,transparent)] text-[var(--text-primary)] border-[color:var(--glass-border)] shadow-[var(--glass-shadow-soft)] hover:bg-[color:color-mix(in_srgb,var(--accent)_16%,var(--glass-elevated))]",
        secondary:
          "bg-[color:color-mix(in_srgb,var(--glass-surface)_88%,transparent)] text-[var(--text-secondary)] border-[color:var(--glass-border)] shadow-[var(--glass-shadow-soft)] hover:text-[var(--text-primary)] hover:bg-[color:color-mix(in_srgb,var(--glass-surface)_70%,white_30%)]",
        ghost: "border-transparent bg-transparent text-[var(--text-secondary)] shadow-none hover:bg-[color:color-mix(in_srgb,var(--glass-elevated)_65%,transparent)] hover:text-[var(--text-primary)]",
        link: "border-transparent bg-transparent text-[var(--accent)] shadow-none hover:underline underline-offset-4",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
