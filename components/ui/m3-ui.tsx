"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * M3 Inspired Input component
 */
export interface M3InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const M3Input = React.forwardRef<HTMLInputElement, M3InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "flex h-14 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-2 text-sm ring-offset-zinc-950 transition-all duration-300",
              "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-zinc-50",
              "placeholder:text-zinc-700",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "group-hover:border-zinc-700 font-medium",
              error && "border-red-500/50 focus-visible:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-widest">{error}</p>}
      </div>
    );
  }
);
M3Input.displayName = "M3Input";

/**
 * M3 Inspired Textarea component
 */
export interface M3TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const M3Textarea = React.forwardRef<HTMLTextAreaElement, M3TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full h-full flex flex-col space-y-2">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-3xl border border-zinc-800 bg-zinc-950/50 px-6 py-5 text-sm ring-offset-zinc-950 transition-all duration-300",
            "placeholder:text-zinc-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-zinc-700 font-medium resize-none",
            error && "border-red-500/50 focus-visible:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-widest">{error}</p>}
      </div>
    );
  }
);
M3Textarea.displayName = "M3Textarea";

/**
 * M3 Inspired Select component
 */
export interface M3SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
}

const M3Select = React.forwardRef<HTMLSelectElement, M3SelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            className={cn(
              "flex h-14 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-2 text-sm ring-offset-zinc-950 transition-all duration-300 appearance-none outline-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "cursor-pointer group-hover:border-zinc-700 font-bold uppercase tracking-widest text-[11px]",
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white py-2">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors pointer-events-none group-hover:text-primary" />
        </div>
      </div>
    );
  }
);
M3Select.displayName = "M3Select";

export { M3Input, M3Textarea, M3Select };
