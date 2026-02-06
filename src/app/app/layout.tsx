"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getRedirectPathForRole } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useIsDesktop } from "@/hooks/use-media-query";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role === "coach") {
        router.push("/coach");
      } else if (user.role === "closer") {
        router.push("/closer");
      }
    }
  }, [user, isLoading, router, mounted]);

  // Loading state
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

  // Redirect en cours ou pas d'accès
  if (!user || user.role === "coach" || user.role === "closer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {isDesktop && <Sidebar />}
      
      <div style={isDesktop ? { marginLeft: '16rem' } : undefined}>
        <Header />
        <main 
          className="p-4" 
          style={{ 
            padding: isDesktop ? '2rem' : '1rem',
            paddingBottom: isDesktop ? '2rem' : '6rem'
          }}
        >
          {children}
        </main>
        
        {!isDesktop && <MobileNav />}
      </div>
    </div>
  );
}
