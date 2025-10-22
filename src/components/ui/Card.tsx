import { ReactNode } from "react";

export const Card = ({ children }: { children: ReactNode }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-indigo-600 transition">
    {children}
  </div>
);
