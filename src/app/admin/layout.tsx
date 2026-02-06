"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Shield,
  Calendar,
  Coins,
  LayoutDashboard,
  ArrowLeft,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/slots", label: "Créneaux", icon: Calendar },
  { href: "/admin/coins", label: "Coins", icon: Coins },
  { href: "/admin/remboursements", label: "Remboursements", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "admin") {
        router.push("/app");
      }
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="animate-pulse-soft text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Administration</h1>
                <p className="text-xs text-gray-500">SaaS Money</p>
              </div>
            </div>
          </div>

          <Link href="/app">
            <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
              <Sparkles className="w-4 h-4" />
              Retour à l&apos;app
            </div>
          </Link>
        </div>

        {/* Nav tabs */}
        <nav className="flex gap-1 px-6 pb-2">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-primary text-white shadow-soft"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}
