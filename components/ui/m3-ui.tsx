"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Select, { StylesConfig, components, DropdownIndicatorProps } from "react-select";
import { ChevronDown, Eye, EyeOff, Lock } from "lucide-react";

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
 * M3 Inspired Password component
 */
export interface M3PasswordProps extends Omit<M3InputProps, 'type'> {}

const M3Password = React.forwardRef<HTMLInputElement, M3PasswordProps>(
  ({ className, label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors pointer-events-none group-focus-within:text-primary">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-14 w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 pl-12 pr-12 py-2 text-sm ring-offset-zinc-950 transition-all duration-300 font-mono",
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-widest">{error}</p>}
      </div>
    );
  }
);
M3Password.displayName = "M3Password";

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
export interface M3SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const M3Select = ({ className, label, options, value, onChange, placeholder, disabled }: M3SelectProps) => {
  const selectedOption = options.find(opt => opt.value === value);

  const customStyles: StylesConfig<any, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgb(9 9 11 / 0.5)", // zinc-950/50
      borderColor: state.isFocused ? "var(--color-primary)" : "rgb(39 39 42)", // zinc-800
      borderRadius: "1rem", // 2xl
      minHeight: "3.5rem", // h-14
      paddingLeft: "0.5rem",
      paddingRight: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "rgb(63 63 70)", // zinc-700
      },
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.3s ease",
    }),
    valueContainer: (base) => ({
      ...base,
      paddingLeft: "1rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: "white",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontSize: "10px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgb(63 63 70)", // zinc-700
      fontSize: "12px",
      paddingLeft: "1rem",
    }),
    input: (base) => ({
      ...base,
      color: "white",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "rgb(9 9 11)", // zinc-950
      border: "1px solid rgb(39 39 42)", // zinc-800
      borderRadius: "1rem",
      overflow: "hidden",
      zIndex: 50,
      marginTop: "0.5rem",
      boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? "var(--color-primary)" 
        : state.isFocused 
          ? "rgb(24 24 27)" // zinc-900
          : "transparent",
      color: state.isSelected ? "white" : "rgb(161 161 170)", // zinc-400
      padding: "1rem 1.25rem",
      fontSize: "10px",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      cursor: "pointer",
      borderBottom: "1px solid rgb(24 24 27 / 0.5)",
      transition: "all 0.2s ease",
      "&:active": {
        backgroundColor: "var(--color-primary)",
      },
      "&:last-child": {
        borderBottom: "none",
      }
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 1rem",
    }),
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
          {label}
        </label>
      )}
      <Select
        instanceId={label || "m3-select"}
        value={selectedOption}
        onChange={(option: any) => onChange(option?.value)}
        options={options}
        placeholder={placeholder}
        isDisabled={disabled}
        styles={customStyles}
        components={{
          DropdownIndicator: (props: DropdownIndicatorProps<any, false>) => (
            <components.DropdownIndicator {...props}>
              <div 
                className={cn(
                  "transition-colors", 
                  props.isFocused ? "text-primary" : "text-zinc-600"
                )}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </components.DropdownIndicator>
          ),
        }}
      />
    </div>
  );
};
M3Select.displayName = "M3Select";

export { M3Input, M3Textarea, M3Select, M3Password };
