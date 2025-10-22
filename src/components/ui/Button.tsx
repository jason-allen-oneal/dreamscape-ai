import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
  {
    variants: {
      intent: {
        primary: "bg-indigo-600 text-white hover:bg-indigo-500",
        secondary: "bg-slate-800 text-gray-200 hover:bg-slate-700",
        ghost: "bg-transparent text-gray-300 hover:bg-slate-800",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = ({ className, intent, size, ...props }: ButtonProps) => (
  <button className={cn(buttonStyles({ intent, size }), className)} {...props} />
);
