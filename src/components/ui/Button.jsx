import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary", // 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size = "md", // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-juara hover:bg-juara-600 active:bg-juara-700 text-white shadow-sm focus:ring-juara/50",
    secondary:
      "bg-white hover:bg-gray-50 active:bg-gray-100 text-textMain border border-gray-200 shadow-sm focus:ring-gray-300",
    danger:
      "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-rose-400",
    outline:
      "border border-juara text-juara hover:bg-juara-50 active:bg-juara-100 focus:ring-juara/30",
    ghost:
      "text-textMuted hover:text-textMain hover:bg-gray-100/70 focus:ring-gray-200",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
