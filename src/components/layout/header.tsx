"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  Coins,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-2xl hover:bg-gray-100 transition-colors"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile logo */}
        <Link href="/app" className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gradient">SaaS Money</span>
        </Link>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        {/* User section */}
        <div className="flex items-center gap-4">
          {/* Coins badge */}
          <Link href="/app/one-of-one">
            <Badge
              variant="gradient"
              className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Coins className="w-4 h-4" />
              <span className="font-semibold">{user?.coins_balance || 0}</span>
            </Badge>
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <Avatar src={user?.avatar_url} name={user?.name} size="md" />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-medium border border-gray-100 py-2 animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <Link
                  href="/app/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {menuOpen && (
        <div
          className={cn(
            "lg:hidden fixed inset-0 top-[73px] bg-black/20 z-30",
            "animate-fade-in"
          )}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
