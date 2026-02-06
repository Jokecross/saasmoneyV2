"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth, getRedirectPathForRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Link2,
  History,
  LogOut,
  Target,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/closer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/closer/generate", label: "Générer un lien", icon: Link2 },
  { href: "/closer/students", label: "Mes Élèves", icon: Users },
  { href: "/closer/history", label: "Historique", icon: History },
];

export default function CloserLayout({ children }: { children: React.ReactNode }) {
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
      } else if (user.role !== "closer" && user.role !== "admin") {
        router.push(getRedirectPathForRole(user.role));
      }
    }
  }, [user, isLoading, router, mounted]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="animate-pulse-soft text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "closer" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 bottom-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-soft">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Closer
            </span>
            <p className="text-xs text-gray-400">Espace Commercial</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-soft"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="px-4 py-3 rounded-2xl bg-gray-50 mb-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Closer
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-400"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
