"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "bordered";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-white shadow-soft",
      gradient: "bg-gradient-primary text-white shadow-glow",
      bordered: "bg-white border-2 border-gray-100",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl p-6",
          variants[variant],
          hover && "transition-all duration-300 hover:shadow-medium hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };

