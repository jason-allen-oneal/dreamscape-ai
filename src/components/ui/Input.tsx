import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Input = ({ label, helperText, ...props }: InputProps) => (
  <label className="group flex flex-col gap-2 text-xs uppercase tracking-[0.35em] text-white/40">
    {label && <span>{label}</span>}
    <input
      {...props}
      className="
        w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-base
        text-white/80 backdrop-blur transition placeholder:text-white/30 focus:border-white/35
        focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500
      "
    />
    {helperText && <span className="text-[10px] text-white/40">{helperText}</span>}
  </label>
);
