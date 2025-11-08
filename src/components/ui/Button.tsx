import type { ButtonHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/client-utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary:
          "bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-sky-500 text-white shadow-[0_12px_40px_rgba(99,102,241,0.25)] hover:shadow-[0_18px_45px_rgba(236,72,153,0.35)]",
        secondary:
          "border border-white/20 bg-white/10 text-white/80 backdrop-blur hover:border-white/35 hover:bg-white/15",
        ghost:
          "text-white/70 hover:text-white hover:bg-white/10 border border-transparent",
      },
      size: {
        sm: "px-4 py-2 text-xs uppercase tracking-[0.3em]",
        md: "px-6 py-2.5 text-sm uppercase tracking-[0.3em]",
        lg: "px-8 py-3 text-sm uppercase tracking-[0.4em]",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = ({ className, intent, size, ...props }: ButtonProps) => (
  <button className={cn(buttonStyles({ intent, size }), className)} {...props} />
);
