"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center bg-gradient-primary text-white font-medium",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
}

