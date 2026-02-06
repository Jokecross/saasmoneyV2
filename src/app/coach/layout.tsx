"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth, getRedirectPathForRole } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Phone,
  Flame,
  Calendar,
  LogOut,
  Users,
} from "lucide-react";

const coachNavItems = [
  { href: "/coach", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/one-of-one", label: "One of One", icon: Phone },
  { href: "/coach/hotset", label: "Hot-Seat", icon: Flame },
  { href: "/coach/bookings", label: "Réservations", icon: Calendar },
];

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
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
      } else if (user.role !== "coach" && user.role !== "admin") {
        router.push(getRedirectPathForRole(user.role));
      }
    }
  }, [user, isLoading, router, mounted]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

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

  if (!user || (user.role !== "coach" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gradient">Coach</span>
            <p className="text-xs text-gray-500">Interface Coach</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {coachNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/coach" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-primary text-white shadow-soft"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <Badge variant="gradient" size="sm">
                Coach
              </Badge>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gradient">Coach</span>
          </div>
          <Avatar name={user.name} size="sm" />
        </div>
        
        {/* Mobile Navigation */}
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {coachNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/coach" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-gradient-primary text-white"
                    : "text-gray-600 bg-gray-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="pt-24 lg:pt-0 p-4 lg:p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
