"use client";

import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ className, active, children, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        active
          ? "bg-gradient-primary text-white shadow-soft"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

